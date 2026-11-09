import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Db } from './db';

export const PICTURES = ['🐶', '🐱', '🐸', '🍎', '🌻', '⭐', '🚗', '⚽', '🌈'] as const;
export const PICTURE_LENGTH = 3;
export const MAX_PICTURE_FAILURES = 5;
export const PICTURE_LOCK_MS = 10 * 60_000;
export const STUDENT_SESSION_MS = 4 * 3600_000;
export const USER_SESSION_MS = 12 * 3600_000;
const USER_MAX_FAILURES = 8;
const USER_BLOCK_MS = 15 * 60_000;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 32, { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const expected = Buffer.from(key, 'hex');
  const actual = scryptSync(password, Buffer.from(salt, 'hex'), expected.length, {
    N: 2 ** 15,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
  });
  return timingSafeEqual(actual, expected);
}

/** Bewusst teurer Vergleich gegen einen Dummy, damit unbekannte Namen nicht schneller scheitern. */
const DUMMY_HASH = hashPassword(randomBytes(12).toString('hex'));
export const burnPasswordCheck = (password: string) => verifyPassword(password, DUMMY_HASH);

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateClassCode(): string {
  return Array.from({ length: 6 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');
}

/** Drei verschiedene Bilder, als Indizes in PICTURES. */
export function generatePicturePassword(): string {
  const pool = PICTURES.map((_, i) => i);
  const out: number[] = [];
  for (let i = 0; i < PICTURE_LENGTH; i++) out.push(pool.splice(randomInt(pool.length), 1)[0]);
  return out.join(',');
}

export const picturesOf = (secret: string) => secret.split(',').map((i) => PICTURES[Number(i)]);

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export type Principal =
  | { kind: 'user'; id: number; username: string; displayName: string; role: 'admin' | 'teacher'; mustChangePassword: boolean }
  | { kind: 'student'; id: number; displayName: string; classId: number }
  /** Freies Spielen (F-07): ohne Anmeldung, es wird nichts gespeichert. */
  | { kind: 'guest' };

export function createSession(db: Db, subject: { userId?: number; studentId?: number }, now = Date.now()): string {
  const token = randomBytes(32).toString('base64url');
  const ttl = subject.userId ? USER_SESSION_MS : STUDENT_SESSION_MS;
  db.prepare('INSERT INTO sessions (token_hash, user_id, student_id, expires_at) VALUES (?,?,?,?)').run(
    sha256(token),
    subject.userId ?? null,
    subject.studentId ?? null,
    now + ttl
  );
  return token;
}

export function destroySession(db: Db, token: string) {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
}

export function resolveSession(db: Db, token: string, now = Date.now()): Principal | null {
  const row = db
    .prepare(
      `SELECT s.expires_at, u.id AS uid, u.username, u.display_name AS uname, u.role, u.must_change_password, u.active,
              st.id AS sid, st.display_name AS sname, st.class_id, c.archived_at
       FROM sessions s
       LEFT JOIN users u ON u.id = s.user_id
       LEFT JOIN students st ON st.id = s.student_id
       LEFT JOIN classes c ON c.id = st.class_id
       WHERE s.token_hash = ?`
    )
    .get(sha256(token)) as Record<string, any> | undefined;
  if (!row || row.expires_at <= now) return null;
  if (row.uid != null) {
    if (!row.active) return null;
    return {
      kind: 'user',
      id: row.uid,
      username: row.username,
      displayName: row.uname,
      role: row.role,
      mustChangePassword: !!row.must_change_password
    };
  }
  if (row.sid != null && row.archived_at == null) {
    return { kind: 'student', id: row.sid, displayName: row.sname, classId: row.class_id };
  }
  return null;
}

export type PictureResult = 'ok' | 'wrong' | 'locked';

/** Prüft das Bilderpasswort und führt Fehlversuche und Sperre (F-05). */
export function checkPicturePassword(db: Db, studentId: number, attempt: string, now = Date.now()): PictureResult {
  const row = db
    .prepare('SELECT picture_password, failed_attempts, locked_until FROM students WHERE id = ?')
    .get(studentId) as { picture_password: string; failed_attempts: number; locked_until: number } | undefined;
  if (!row) return 'wrong';
  if (row.locked_until > now) return 'locked';
  if (row.picture_password === attempt) {
    db.prepare('UPDATE students SET failed_attempts = 0, locked_until = 0 WHERE id = ?').run(studentId);
    return 'ok';
  }
  const failures = row.failed_attempts + 1;
  if (failures >= MAX_PICTURE_FAILURES) {
    db.prepare('UPDATE students SET failed_attempts = 0, locked_until = ? WHERE id = ?').run(now + PICTURE_LOCK_MS, studentId);
    return 'locked';
  }
  db.prepare('UPDATE students SET failed_attempts = ? WHERE id = ?').run(failures, studentId);
  return 'wrong';
}

export function isThrottled(db: Db, key: string, now = Date.now()): boolean {
  const row = db.prepare('SELECT blocked_until FROM login_throttle WHERE key = ?').get(key) as { blocked_until: number } | undefined;
  return !!row && row.blocked_until > now;
}

export function recordLoginFailure(db: Db, key: string, now = Date.now()) {
  const row = db.prepare('SELECT failures, blocked_until FROM login_throttle WHERE key = ?').get(key) as
    | { failures: number; blocked_until: number }
    | undefined;
  const expired = row && row.blocked_until !== 0 && row.blocked_until <= now;
  const failures = (expired || !row ? 0 : row.failures) + 1;
  const blocked = failures >= USER_MAX_FAILURES ? now + USER_BLOCK_MS : 0;
  db.prepare('INSERT OR REPLACE INTO login_throttle (key, failures, blocked_until) VALUES (?,?,?)').run(key, failures, blocked);
}

export function clearLoginFailures(db: Db, key: string) {
  db.prepare('DELETE FROM login_throttle WHERE key = ?').run(key);
}

export function audit(db: Db, actor: string, action: string, detail = '', now = Date.now()) {
  db.prepare('INSERT INTO audit_log (at, actor, action, detail) VALUES (?,?,?,?)').run(now, actor, action, detail);
}
