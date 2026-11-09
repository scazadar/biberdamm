import { beforeEach, describe, expect, it } from 'vitest';
import { openDb, type Db } from './db';
import {
  checkPicturePassword,
  createSession,
  generatePicturePassword,
  hashPassword,
  MAX_PICTURE_FAILURES,
  PICTURE_LOCK_MS,
  resolveSession,
  STUDENT_SESSION_MS,
  verifyPassword,
  type Principal
} from './auth';
import {
  addStudents,
  canAccessClass,
  classCsv,
  classProgress,
  createAssignment,
  createClass,
  csvCell,
  deleteStudent,
  exportStudent,
  gamePlan,
  getStudent,
  listClasses,
  listStudents,
  openAssignments,
  parseNames,
  parseRound,
  purgeExpired,
  saveRound,
  setupSchool,
  createTeacher,
  totalStars,
  type RoundInput
} from './school';

type U = Extract<Principal, { kind: 'user' }>;
const teacher = (id: number, role: U['role'] = 'teacher'): U => ({ kind: 'user', id, username: 'x', displayName: 'x', role, mustChangePassword: false });
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const round = (n: number, over: Partial<RoundInput> = {}): RoundInput => ({
  id: uuid(n),
  gameId: 'zaehlen',
  level: 1,
  assignmentId: null,
  playedAt: Date.now(),
  attempts: [{ item: '3', wrongTries: 0, hints: 0 }],
  ...over
});

let db: Db;
let classA: number;
let classB: number;
let t1: number;
let t2: number;
let kid: { id: number; classId: number };
let other: { id: number; classId: number };

beforeEach(() => {
  db = openDb(':memory:');
  setupSchool(db, { school: 'Testschule', username: 'admin', displayName: 'Admin', password: 'geheim-geheim' });
  t1 = createTeacher(db, { username: 'a', displayName: 'A', password: 'passwort-123' });
  t2 = createTeacher(db, { username: 'b', displayName: 'B', password: 'passwort-123' });
  classA = createClass(db, '1a', t1);
  classB = createClass(db, '1b', t2);
  addStudents(db, classA, ['Mia K.', 'Ali S.']);
  addStudents(db, classB, ['Tom B.']);
  kid = { id: listStudents(db, classA)[1].id, classId: classA };
  other = { id: listStudents(db, classB)[0].id, classId: classB };
});

describe('Passwörter und Sitzungen', () => {
  it('prüft Passwörter', () => {
    const h = hashPassword('richtig-richtig');
    expect(verifyPassword('richtig-richtig', h)).toBe(true);
    expect(verifyPassword('falsch', h)).toBe(false);
  });

  it('beendet Kinder-Sitzungen nach Ablauf', () => {
    const now = 1_000_000;
    const token = createSession(db, { studentId: kid.id }, now);
    expect(resolveSession(db, token, now + 1)?.kind).toBe('student');
    expect(resolveSession(db, token, now + STUDENT_SESSION_MS)).toBeNull();
  });

  it('erzeugt drei verschiedene Bilder', () => {
    for (let i = 0; i < 50; i++) expect(new Set(generatePicturePassword().split(',')).size).toBe(3);
  });

  it('sperrt nach fünf Fehlversuchen', () => {
    const now = 5_000_000;
    const secret = getStudent(db, kid.id)!.picture_password;
    for (let i = 1; i < MAX_PICTURE_FAILURES; i++) expect(checkPicturePassword(db, kid.id, 'x', now)).toBe('wrong');
    expect(checkPicturePassword(db, kid.id, 'x', now)).toBe('locked');
    expect(checkPicturePassword(db, kid.id, secret, now + 1)).toBe('locked');
    expect(checkPicturePassword(db, kid.id, secret, now + PICTURE_LOCK_MS + 1)).toBe('ok');
  });
});

describe('Zugriffstrennung', () => {
  it('Lehrkraft erreicht nur eigene Klassen', () => {
    expect(canAccessClass(db, teacher(t1), classA)).toBe(true);
    expect(canAccessClass(db, teacher(t1), classB)).toBe(false);
    expect(listClasses(db, teacher(t1)).map((c) => c.id)).toEqual([classA]);
  });

  it('Admin erreicht alle Klassen', () => {
    expect(canAccessClass(db, teacher(1, 'admin'), classB)).toBe(true);
    expect(listClasses(db, teacher(1, 'admin'))).toHaveLength(2);
  });
});

describe('Ergebnisse', () => {
  it('speichert jede Runde genau einmal', () => {
    expect(saveRound(db, kid, round(1))).toBe('saved');
    expect(saveRound(db, kid, round(1))).toBe('duplicate');
    expect(totalStars(db, kid.id)).toBe(1);
  });

  it('rechnet eine fremde Runden-ID keinem anderen Kind zu', () => {
    saveRound(db, kid, round(1));
    expect(saveRound(db, other, round(1))).toBe('rejected');
    expect(totalStars(db, other.id)).toBe(0);
  });

  it('lehnt Aufgaben fremder Klassen ab', () => {
    createAssignment(db, { classId: classB, gameId: 'zaehlen', level: 1, rounds: 1, quizId: null, dueDate: null, createdBy: t2 });
    expect(saveRound(db, kid, round(2, { assignmentId: 1 }))).toBe('rejected');
  });

  it('validiert Eingaben', () => {
    expect(parseRound(round(1))).not.toBeNull();
    expect(parseRound({ ...round(1), gameId: 'gibtsnicht' })).toBeNull();
    expect(parseRound({ ...round(1), level: 9 })).toBeNull();
    expect(parseRound({ ...round(1), id: 'abc' })).toBeNull();
    expect(parseRound({ ...round(1), attempts: [] })).toBeNull();
    expect(parseRound({ ...round(1), attempts: Array(21).fill({ item: 'a', wrongTries: 0, hints: 0 }) })).toBeNull();
  });

  it('erledigt Aufgaben nach der geforderten Rundenzahl', () => {
    createAssignment(db, { classId: classA, gameId: 'zaehlen', level: 2, rounds: 2, quizId: null, dueDate: null, createdBy: t1 });
    expect(openAssignments(db, kid)).toHaveLength(1);
    saveRound(db, kid, round(1, { assignmentId: 1 }));
    expect(openAssignments(db, kid)[0].done).toBe(1);
    saveRound(db, kid, round(2, { assignmentId: 1 }));
    expect(openAssignments(db, kid)).toHaveLength(0);
  });

  it('schlägt nach zwei sehr guten Runden die nächste Stufe vor', () => {
    expect(gamePlan(db, kid.id, 'zaehlen').level).toBe(1);
    saveRound(db, kid, round(1));
    saveRound(db, kid, round(2));
    expect(gamePlan(db, kid.id, 'zaehlen').level).toBe(2);
  });
});

describe('Fortschritt und Datenschutz', () => {
  it('meldet Unterstützungsbedarf erst ab fünf Versuchen', () => {
    const bad = { item: '3', wrongTries: 3, hints: 0 };
    saveRound(db, kid, round(1, { attempts: Array(4).fill(bad) }));
    expect(classProgress(db, classA).support).toHaveLength(0);
    saveRound(db, kid, round(2, { attempts: [bad] }));
    const p = classProgress(db, classA);
    expect(p.support.map((s) => s.studentId)).toEqual([kid.id]);
    expect(p.cells[kid.id]['numbers.count'].status).toBe('hilfe');
  });

  it('Löschen entfernt alle Daten des Kindes', () => {
    saveRound(db, kid, round(1));
    createSession(db, { studentId: kid.id });
    deleteStudent(db, kid.id);
    for (const t of ['game_rounds', 'attempts', 'sessions']) {
      expect(db.prepare(`SELECT COUNT(*) AS n FROM ${t} WHERE student_id = ?`).get(kid.id)).toEqual({ n: 0 });
    }
  });

  it('löscht Daten nach Ablauf der Frist', () => {
    const now = Date.now();
    saveRound(db, kid, round(1), now);
    purgeExpired(db, now + 364 * 86400_000);
    expect(totalStars(db, kid.id)).toBe(1);
    purgeExpired(db, now + 366 * 86400_000);
    expect(totalStars(db, kid.id)).toBe(0);
    expect(db.prepare('SELECT COUNT(*) AS n FROM attempts').get()).toEqual({ n: 0 });
  });

  it('exportiert die Daten eines Kindes', () => {
    saveRound(db, kid, round(1));
    const e = exportStudent(db, kid.id)!;
    expect(e.kind.anzeigename).toBe('Mia K.');
    expect(e.versuche).toHaveLength(1);
  });

  it('entschärft Formeln im CSV', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    addStudents(db, classA, ['=1+1']);
    expect(classCsv(db, classA)).toContain(`"'=1+1"`);
  });

  it('bereinigt eingefügte Namenslisten', () => {
    expect(parseNames('Mia\r\n\r\n mia \nAli\n')).toEqual(['Mia', 'Ali']);
  });
});
