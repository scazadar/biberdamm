import type { Db } from './db';
import { tx } from './db';
import {
  audit,
  generateClassCode,
  generatePicturePassword,
  hashPassword,
  type Principal
} from './auth';
import { GAME_BY_ID, MAX_QUIZ_QUESTIONS, MAX_ROUND_ATTEMPTS, SKILLS } from '#lib/games/catalog';
import type { ItemHistory } from '#lib/learning';
import { attemptScore, mastery, recommendLevel, STARS_PER_STICKER, type Status } from '#lib/learning';

type UserPrincipal = Extract<Principal, { kind: 'user' }>;

const all = <T>(db: Db, sql: string, ...args: any[]) => db.prepare(sql).all(...args) as T[];
const one = <T>(db: Db, sql: string, ...args: any[]) => db.prepare(sql).get(...args) as T | undefined;

// ---------------------------------------------------------------- Einrichtung

export const isSetUp = (db: Db) => !!one(db, 'SELECT 1 AS x FROM school WHERE id = 1');

export function getSchool(db: Db) {
  return one<{ name: string; retention_days: number }>(db, 'SELECT name, retention_days FROM school WHERE id = 1');
}

export function setupSchool(db: Db, input: { school: string; username: string; displayName: string; password: string }) {
  const hash = hashPassword(input.password);
  tx(db, () => {
    if (isSetUp(db)) throw new Error('already set up');
    db.prepare('INSERT INTO school (id, name) VALUES (1, ?)').run(input.school);
    db.prepare("INSERT INTO users (username, display_name, password_hash, role, created_at) VALUES (?,?,?,'admin',?)").run(
      input.username,
      input.displayName,
      hash,
      Date.now()
    );
    audit(db, input.username, 'schule.eingerichtet');
  });
}

export function createTeacher(db: Db, input: { username: string; displayName: string; password: string; role?: 'admin' | 'teacher' }) {
  const r = db
    .prepare('INSERT INTO users (username, display_name, password_hash, role, must_change_password, created_at) VALUES (?,?,?,?,1,?)')
    .run(input.username, input.displayName, hashPassword(input.password), input.role ?? 'teacher', Date.now());
  return Number(r.lastInsertRowid);
}

// ---------------------------------------------------------------- Klassen

export interface ClassRow {
  id: number;
  name: string;
  code: string;
  login_open: number;
  calm_mode: number;
  speech: number;
  disabled_games: string;
  archived_at: number | null;
}

export function canAccessClass(db: Db, p: UserPrincipal, classId: number): boolean {
  if (p.role === 'admin') return !!one(db, 'SELECT 1 AS x FROM classes WHERE id = ?', classId);
  return !!one(db, 'SELECT 1 AS x FROM class_teachers WHERE class_id = ? AND user_id = ?', classId, p.id);
}

export function listClasses(db: Db, p: UserPrincipal) {
  const select = `SELECT c.*, (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) AS student_count FROM classes c`;
  return p.role === 'admin'
    ? all<ClassRow & { student_count: number }>(db, `${select} ORDER BY c.archived_at IS NOT NULL, c.name`)
    : all<ClassRow & { student_count: number }>(
        db,
        `${select} JOIN class_teachers t ON t.class_id = c.id WHERE t.user_id = ? ORDER BY c.archived_at IS NOT NULL, c.name`,
        p.id
      );
}

export const getClass = (db: Db, id: number) => one<ClassRow>(db, 'SELECT * FROM classes WHERE id = ?', id);
export const getClassByCode = (db: Db, code: string) =>
  one<ClassRow>(db, 'SELECT * FROM classes WHERE code = ?', code.toUpperCase());

export function createClass(db: Db, name: string, ownerId: number): number {
  return tx(db, () => {
    let code = generateClassCode();
    while (getClassByCode(db, code)) code = generateClassCode();
    const r = db.prepare('INSERT INTO classes (name, code, created_at) VALUES (?,?,?)').run(name, code, Date.now());
    const id = Number(r.lastInsertRowid);
    db.prepare('INSERT INTO class_teachers (class_id, user_id) VALUES (?,?)').run(id, ownerId);
    return id;
  });
}

export function updateClassSettings(
  db: Db,
  id: number,
  s: { name: string; calm: boolean; speech: boolean; disabledGames: string[] }
) {
  const valid = s.disabledGames.filter((g) => GAME_BY_ID.has(g));
  db.prepare('UPDATE classes SET name = ?, calm_mode = ?, speech = ?, disabled_games = ? WHERE id = ?').run(
    s.name,
    s.calm ? 1 : 0,
    s.speech ? 1 : 0,
    JSON.stringify(valid),
    id
  );
}

export function setLoginOpen(db: Db, id: number, open: boolean) {
  db.prepare('UPDATE classes SET login_open = ? WHERE id = ?').run(open ? 1 : 0, id);
}

export function setArchived(db: Db, id: number, archived: boolean) {
  db.prepare('UPDATE classes SET archived_at = ?, login_open = ? WHERE id = ?').run(archived ? Date.now() : null, archived ? 0 : 1, id);
}

export const deleteClass = (db: Db, id: number) => db.prepare('DELETE FROM classes WHERE id = ?').run(id);

export function classTeachers(db: Db, classId: number) {
  return all<{ id: number; display_name: string }>(
    db,
    'SELECT u.id, u.display_name FROM users u JOIN class_teachers t ON t.user_id = u.id WHERE t.class_id = ? ORDER BY u.display_name',
    classId
  );
}

// ---------------------------------------------------------------- Kinder

export interface StudentRow {
  id: number;
  class_id: number;
  display_name: string;
  picture_password: string;
  failed_attempts: number;
  locked_until: number;
}

export const listStudents = (db: Db, classId: number) =>
  all<StudentRow>(db, 'SELECT * FROM students WHERE class_id = ? ORDER BY display_name COLLATE NOCASE', classId);

export const getStudent = (db: Db, id: number) => one<StudentRow>(db, 'SELECT * FROM students WHERE id = ?', id);

/** Zerlegt eine eingefügte Liste; leere Zeilen und Dubletten werden ignoriert. */
export function parseNames(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const name = raw.trim().slice(0, 40);
    if (name && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      out.push(name);
    }
  }
  return out;
}

export function addStudents(db: Db, classId: number, names: string[]) {
  const existing = new Set(listStudents(db, classId).map((s) => s.display_name.toLowerCase()));
  const fresh = names.filter((n) => !existing.has(n.toLowerCase()));
  tx(db, () => {
    const stmt = db.prepare('INSERT INTO students (class_id, display_name, picture_password, created_at) VALUES (?,?,?,?)');
    for (const n of fresh) stmt.run(classId, n, generatePicturePassword(), Date.now());
  });
  return fresh.length;
}

export const renameStudent = (db: Db, id: number, name: string) =>
  db.prepare('UPDATE students SET display_name = ? WHERE id = ?').run(name, id);

export function resetPicturePassword(db: Db, id: number) {
  db.prepare('UPDATE students SET picture_password = ?, failed_attempts = 0, locked_until = 0 WHERE id = ?').run(generatePicturePassword(), id);
  db.prepare('DELETE FROM sessions WHERE student_id = ?').run(id);
}

export const unlockStudent = (db: Db, id: number) =>
  db.prepare('UPDATE students SET failed_attempts = 0, locked_until = 0 WHERE id = ?').run(id);

export const deleteStudent = (db: Db, id: number) => db.prepare('DELETE FROM students WHERE id = ?').run(id);

// ---------------------------------------------------------------- Aufgaben & Quizze

export interface AssignmentRow {
  id: number;
  class_id: number;
  game_id: string;
  level: number;
  rounds: number;
  quiz_id: number | null;
  due_date: string | null;
  quiz_title?: string | null;
}

export function createAssignment(
  db: Db,
  a: { classId: number; gameId: string; level: number; rounds: number; quizId: number | null; dueDate: string | null; createdBy: number }
) {
  const game = GAME_BY_ID.get(a.gameId);
  if (!game) throw new Error('unknown game');
  if (a.level < 1 || a.level > game.levels.length) throw new Error('invalid level');
  if (a.rounds < 1 || a.rounds > 10) throw new Error('invalid rounds');
  if (a.gameId === 'quiz' && !a.quizId) throw new Error('quiz required');
  db.prepare('INSERT INTO assignments (class_id, game_id, level, rounds, quiz_id, due_date, created_by, created_at) VALUES (?,?,?,?,?,?,?,?)').run(
    a.classId,
    a.gameId,
    a.level,
    a.rounds,
    a.gameId === 'quiz' ? a.quizId : null,
    a.dueDate,
    a.createdBy,
    Date.now()
  );
}

export const listAssignments = (db: Db, classId: number) =>
  all<AssignmentRow>(
    db,
    `SELECT a.*, q.title AS quiz_title FROM assignments a LEFT JOIN quizzes q ON q.id = a.quiz_id
     WHERE a.class_id = ? ORDER BY a.created_at DESC, a.id DESC`,
    classId
  );

export const getAssignment = (db: Db, id: number) => one<AssignmentRow>(db, 'SELECT * FROM assignments WHERE id = ?', id);
export const deleteAssignment = (db: Db, id: number) => db.prepare('DELETE FROM assignments WHERE id = ?').run(id);

/** Je Aufgabe: Zahl gespielter Runden pro Kind. */
export function assignmentProgress(db: Db, classId: number) {
  const rows = all<{ assignment_id: number; student_id: number; n: number }>(
    db,
    `SELECT r.assignment_id, r.student_id, COUNT(*) AS n FROM game_rounds r
     JOIN assignments a ON a.id = r.assignment_id WHERE a.class_id = ? GROUP BY 1, 2`,
    classId
  );
  const map = new Map<number, Map<number, number>>();
  for (const r of rows) {
    if (!map.has(r.assignment_id)) map.set(r.assignment_id, new Map());
    map.get(r.assignment_id)!.set(r.student_id, r.n);
  }
  return map;
}

export function openAssignments(db: Db, student: { id: number; classId: number }) {
  return all<AssignmentRow & { done: number }>(
    db,
    `SELECT a.*, q.title AS quiz_title,
       (SELECT COUNT(*) FROM game_rounds r WHERE r.assignment_id = a.id AND r.student_id = ?) AS done
     FROM assignments a LEFT JOIN quizzes q ON q.id = a.quiz_id
     WHERE a.class_id = ? ORDER BY a.due_date IS NULL, a.due_date, a.id`,
    student.id,
    student.classId
  ).filter((a) => a.done < a.rounds);
}

export interface QuizInput {
  prompt: string;
  emoji: string;
  answers: string[];
  correct: number;
  explanation: string;
}

export function validateQuizQuestion(q: QuizInput): string | null {
  if (!q.prompt.trim()) return 'Bitte eine Frage eingeben.';
  const filled = q.answers.filter((a) => a.trim());
  if (filled.length < 2 || filled.length > 4) return 'Bitte 2 bis 4 Antworten eingeben.';
  if (q.correct < 0 || q.correct >= q.answers.length || !q.answers[q.correct]?.trim()) return 'Bitte die richtige Antwort markieren.';
  return null;
}

export function createQuiz(db: Db, ownerId: number, title: string) {
  return Number(db.prepare('INSERT INTO quizzes (owner_id, title, created_at) VALUES (?,?,?)').run(ownerId, title, Date.now()).lastInsertRowid);
}

export function listQuizzes(db: Db, p: UserPrincipal) {
  const sql = `SELECT q.id, q.title, (SELECT COUNT(*) FROM quiz_questions x WHERE x.quiz_id = q.id) AS question_count FROM quizzes q`;
  return p.role === 'admin'
    ? all<{ id: number; title: string; question_count: number }>(db, `${sql} ORDER BY q.title`)
    : all<{ id: number; title: string; question_count: number }>(db, `${sql} WHERE q.owner_id = ? ORDER BY q.title`, p.id);
}

export function canAccessQuiz(db: Db, p: UserPrincipal, quizId: number) {
  const q = one<{ owner_id: number | null }>(db, 'SELECT owner_id FROM quizzes WHERE id = ?', quizId);
  return !!q && (p.role === 'admin' || q.owner_id === p.id);
}

export const getQuizTitle = (db: Db, id: number) => one<{ title: string }>(db, 'SELECT title FROM quizzes WHERE id = ?', id)?.title;

export function getQuizQuestions(db: Db, quizId: number) {
  return all<{ id: number; prompt: string; emoji: string; answers: string; correct: number; explanation: string }>(
    db,
    'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id',
    quizId
  ).map((q) => ({ ...q, answers: JSON.parse(q.answers) as string[] }));
}

export function addQuizQuestion(db: Db, quizId: number, q: QuizInput) {
  const count = one<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM quiz_questions WHERE quiz_id = ?', quizId)!.n;
  if (count >= MAX_QUIZ_QUESTIONS) throw new Error('too many questions');
  const correctText = q.answers[q.correct];
  const answers = q.answers.map((a) => a.trim()).filter(Boolean);
  db.prepare('INSERT INTO quiz_questions (quiz_id, prompt, emoji, answers, correct, explanation) VALUES (?,?,?,?,?,?)').run(
    quizId,
    q.prompt.trim(),
    q.emoji.trim(),
    JSON.stringify(answers),
    answers.indexOf(correctText.trim()),
    q.explanation.trim()
  );
}

export const deleteQuizQuestion = (db: Db, quizId: number, id: number) =>
  db.prepare('DELETE FROM quiz_questions WHERE id = ? AND quiz_id = ?').run(id, quizId);
export const deleteQuiz = (db: Db, id: number) => db.prepare('DELETE FROM quizzes WHERE id = ?').run(id);

// ---------------------------------------------------------------- Lernstand des Kindes

export function totalStars(db: Db, studentId: number) {
  return one<{ s: number | null }>(db, 'SELECT SUM(stars) AS s FROM game_rounds WHERE student_id = ?', studentId)!.s ?? 0;
}

export const stickersFor = (stars: number) => Math.floor(stars / STARS_PER_STICKER);

/** Stufenvorschlag und Inhaltsgewichte-Rohdaten für den Spielstart. */
export function gamePlan(db: Db, studentId: number, gameId: string) {
  const game = GAME_BY_ID.get(gameId)!;
  const rounds = all<{ level: number; score: number }>(
    db,
    'SELECT level, score FROM game_rounds WHERE student_id = ? AND game_id = ? ORDER BY played_at DESC, rowid DESC LIMIT 2',
    studentId,
    gameId
  );
  const attempts = all<{ item: string; score: number; at: number }>(
    db,
    'SELECT item, score, at FROM attempts WHERE student_id = ? AND game_id = ? ORDER BY at DESC, id DESC LIMIT 300',
    studentId,
    gameId
  );
  const history: Record<string, ItemHistory> = {};
  for (const a of attempts) {
    const entry = (history[a.item] ??= { scores: [], lastAt: a.at });
    if (entry.scores.length < 5) entry.scores.push(a.score);
  }
  return { level: recommendLevel(rounds, game.levels.length), history };
}

/** Wurde heute (Serverzeit) schon eine Leserunde gespielt? */
export function hasReadToday(db: Db, studentId: number, now = new Date()) {
  const start = new Date(now).setHours(0, 0, 0, 0);
  return !!one(db, "SELECT 1 AS x FROM game_rounds WHERE student_id = ? AND game_id = 'lesen' AND played_at >= ? LIMIT 1", studentId, start);
}

export interface RoundInput {
  id: string;
  gameId: string;
  level: number;
  assignmentId: number | null;
  playedAt: number;
  attempts: { item: string; wrongTries: number; hints: number }[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_AGE = 7 * 86400_000;

/** Prüft die Form einer Rückmeldung (S-05). Gibt bei Fehlern `null` zurück. */
export function parseRound(raw: unknown): RoundInput | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || !UUID.test(r.id)) return null;
  const game = typeof r.gameId === 'string' ? GAME_BY_ID.get(r.gameId) : undefined;
  if (!game) return null;
  if (!Number.isInteger(r.level) || (r.level as number) < 1 || (r.level as number) > game.levels.length) return null;
  if (r.assignmentId !== null && !Number.isInteger(r.assignmentId)) return null;
  if (typeof r.playedAt !== 'number' || !Number.isFinite(r.playedAt)) return null;
  if (!Array.isArray(r.attempts) || r.attempts.length === 0 || r.attempts.length > MAX_ROUND_ATTEMPTS) return null;
  const attempts: RoundInput['attempts'] = [];
  for (const a of r.attempts as Record<string, unknown>[]) {
    if (typeof a?.item !== 'string' || a.item.length === 0 || a.item.length > 60) return null;
    if (!Number.isInteger(a.wrongTries) || (a.wrongTries as number) < 0 || (a.wrongTries as number) > 100) return null;
    if (!Number.isInteger(a.hints) || (a.hints as number) < 0 || (a.hints as number) > 5) return null;
    attempts.push({ item: a.item, wrongTries: a.wrongTries as number, hints: a.hints as number });
  }
  return { id: r.id, gameId: r.gameId as string, level: r.level as number, assignmentId: r.assignmentId as number | null, playedAt: r.playedAt, attempts };
}

export type SaveResult = 'saved' | 'duplicate' | 'rejected';

/** Speichert eine Runde genau einmal; die Runden-ID macht Wiederholungen unschädlich. */
export function saveRound(db: Db, student: { id: number; classId: number }, round: RoundInput, now = Date.now()): SaveResult {
  const game = GAME_BY_ID.get(round.gameId)!;
  if (round.assignmentId !== null) {
    const a = getAssignment(db, round.assignmentId);
    if (!a || a.class_id !== student.classId || a.game_id !== round.gameId) return 'rejected';
  } else if (round.gameId === 'quiz') {
    return 'rejected';
  }
  const playedAt = Math.min(now, Math.max(now - MAX_AGE, round.playedAt));
  return tx(db, (): SaveResult => {
    const existing = one<{ student_id: number }>(db, 'SELECT student_id FROM game_rounds WHERE id = ?', round.id);
    if (existing) return existing.student_id === student.id ? 'duplicate' : 'rejected';
    const scores = round.attempts.map((a) => attemptScore(a.wrongTries, a.hints));
    const score = scores.reduce((x, y) => x + y, 0) / scores.length;
    db.prepare('INSERT INTO game_rounds (id, student_id, game_id, level, assignment_id, score, stars, played_at) VALUES (?,?,?,?,?,?,?,?)').run(
      round.id,
      student.id,
      round.gameId,
      round.level,
      round.assignmentId,
      score,
      round.attempts.length,
      playedAt
    );
    const stmt = db.prepare('INSERT INTO attempts (round_id, student_id, game_id, skill, item, wrong_tries, hints, score, at) VALUES (?,?,?,?,?,?,?,?,?)');
    round.attempts.forEach((a, i) => {
      stmt.run(round.id, student.id, round.gameId, game.skill(round.level, a.item), a.item, a.wrongTries, a.hints, scores[i], playedAt);
    });
    return 'saved';
  });
}

// ---------------------------------------------------------------- Fortschritt

export interface SkillCell {
  value: number | null;
  status: Status;
  n: number;
}

export function classProgress(db: Db, classId: number) {
  const students = listStudents(db, classId);
  const rows = all<{ student_id: number; skill: string; score: number }>(
    db,
    `SELECT student_id, skill, score FROM (
       SELECT a.student_id, a.skill, a.score,
         ROW_NUMBER() OVER (PARTITION BY a.student_id, a.skill ORDER BY a.at DESC, a.id DESC) AS rn
       FROM attempts a JOIN students s ON s.id = a.student_id WHERE s.class_id = ?
     ) WHERE rn <= 15 ORDER BY student_id, skill, rn`,
    classId
  );
  const scores = new Map<string, number[]>();
  for (const r of rows) {
    const k = `${r.student_id}|${r.skill}`;
    if (!scores.has(k)) scores.set(k, []);
    scores.get(k)!.push(r.score);
  }
  const used = new Set(rows.map((r) => r.skill));
  const skills = Object.keys(SKILLS).filter((s) => used.has(s));
  const cells: Record<number, Record<string, SkillCell>> = {};
  const support: { studentId: number; name: string; skill: string }[] = [];
  for (const s of students) {
    cells[s.id] = {};
    for (const skill of skills) {
      const cell = mastery(scores.get(`${s.id}|${skill}`) ?? []);
      cells[s.id][skill] = cell;
      if (cell.status === 'hilfe') support.push({ studentId: s.id, name: s.display_name, skill });
    }
  }
  return { students, skills, cells, support };
}

export function studentProgress(db: Db, studentId: number) {
  const rows = all<{ skill: string; score: number }>(
    db,
    `SELECT skill, score FROM (
       SELECT skill, score, ROW_NUMBER() OVER (PARTITION BY skill ORDER BY at DESC, id DESC) AS rn
       FROM attempts WHERE student_id = ?
     ) WHERE rn <= 15 ORDER BY skill, rn`,
    studentId
  );
  const bySkill = new Map<string, number[]>();
  for (const r of rows) {
    if (!bySkill.has(r.skill)) bySkill.set(r.skill, []);
    bySkill.get(r.skill)!.push(r.score);
  }
  const skills = [...bySkill].map(([skill, s]) => ({ skill, ...mastery(s) }));
  const rounds = all<{ game_id: string; level: number; score: number; stars: number; played_at: number }>(
    db,
    'SELECT game_id, level, score, stars, played_at FROM game_rounds WHERE student_id = ? ORDER BY played_at DESC, rowid DESC LIMIT 20',
    studentId
  );
  const difficulties = all<{ game_id: string; item: string; avg_score: number; n: number }>(
    db,
    `SELECT game_id, item, AVG(score) AS avg_score, COUNT(*) AS n FROM attempts WHERE student_id = ?
     GROUP BY game_id, item HAVING n >= 3 AND avg_score < 0.7 ORDER BY avg_score, n DESC LIMIT 15`,
    studentId
  );
  return { skills, rounds, difficulties };
}

/** Maskiert Werte, die Tabellenkalkulationen als Formel ausführen würden. */
export function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function classCsv(db: Db, classId: number): string {
  const { students, skills, cells } = classProgress(db, classId);
  const header = ['Kind', ...skills.map((s) => SKILLS[s])];
  const lines = students.map((s) => [
    s.display_name,
    ...skills.map((sk) => {
      const c = cells[s.id][sk];
      return c.value === null ? '' : `${Math.round(c.value * 100)}%`;
    })
  ]);
  return '﻿' + [header, ...lines].map((l) => l.map(csvCell).join(';')).join('\r\n') + '\r\n';
}

/** Vollständige Auskunft über die zu einem Kind gespeicherten Daten (F-53). */
export function exportStudent(db: Db, studentId: number) {
  const s = getStudent(db, studentId);
  if (!s) return null;
  return {
    kind: { anzeigename: s.display_name, klasse: getClass(db, s.class_id)?.name },
    runden: all(db, 'SELECT id, game_id, level, score, stars, played_at FROM game_rounds WHERE student_id = ? ORDER BY played_at', studentId),
    versuche: all(db, 'SELECT game_id, skill, item, wrong_tries, hints, score, at FROM attempts WHERE student_id = ? ORDER BY at, id', studentId)
  };
}

// ---------------------------------------------------------------- Wartung

export function purgeExpired(db: Db, now = Date.now()) {
  const retention = getSchool(db)?.retention_days ?? 365;
  db.prepare('DELETE FROM game_rounds WHERE played_at < ?').run(now - retention * 86400_000);
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now);
  db.prepare('DELETE FROM login_throttle WHERE blocked_until <> 0 AND blocked_until <= ?').run(now);
  db.prepare('DELETE FROM audit_log WHERE at < ?').run(now - 2 * 365 * 86400_000);
}
