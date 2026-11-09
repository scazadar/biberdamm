import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS school (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  retention_days INTEGER NOT NULL DEFAULT 365
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','teacher')),
  must_change_password INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  login_open INTEGER NOT NULL DEFAULT 1,
  calm_mode INTEGER NOT NULL DEFAULT 0,
  speech INTEGER NOT NULL DEFAULT 1,
  disabled_games TEXT NOT NULL DEFAULT '[]',
  archived_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS class_teachers (
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, user_id)
);
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  picture_password TEXT NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  CHECK ((user_id IS NULL) <> (student_id IS NULL))
);
CREATE TABLE IF NOT EXISTS login_throttle (
  key TEXT PRIMARY KEY,
  failures INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '',
  answers TEXT NOT NULL,
  correct INTEGER NOT NULL,
  explanation TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  level INTEGER NOT NULL,
  rounds INTEGER NOT NULL,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  due_date TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
CREATE TABLE IF NOT EXISTS game_rounds (
  id TEXT PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  level INTEGER NOT NULL,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
  score REAL NOT NULL,
  stars INTEGER NOT NULL,
  played_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rounds_student ON game_rounds(student_id, game_id, played_at);
CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY,
  round_id TEXT NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  skill TEXT NOT NULL,
  item TEXT NOT NULL,
  wrong_tries INTEGER NOT NULL,
  hints INTEGER NOT NULL,
  score REAL NOT NULL,
  at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON attempts(student_id, skill, at);
CREATE INDEX IF NOT EXISTS idx_attempts_game ON attempts(student_id, game_id, item, at);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  at INTEGER NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT ''
);
`;

export type Db = DatabaseSync;

export function openDb(path: string): Db {
  if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);
  return db;
}

let instance: Db | undefined;

/** Gemeinsame Verbindung des Servers; Pfad über BIBERDAMM_DB änderbar. */
export function db(): Db {
  instance ??= openDb(process.env.BIBERDAMM_DB ?? 'data/biberdamm.db');
  return instance;
}

/** Führt `fn` in einer Transaktion aus; verschachtelte Aufrufe sind nicht vorgesehen. */
export function tx<T>(database: Db, fn: () => T): T {
  database.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    database.exec('COMMIT');
    return result;
  } catch (e) {
    database.exec('ROLLBACK');
    throw e;
  }
}
