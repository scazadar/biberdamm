import { error, type Cookies } from '@sveltejs/kit';
import { db } from './db';
import { createSession, type Principal } from './auth';
import { canAccessClass, canAccessQuiz, getClass, getStudent } from './school';

export const COOKIE = 'biberdamm_session';

export type UserPrincipal = Extract<Principal, { kind: 'user' }>;

export function requireUser(locals: App.Locals): UserPrincipal {
  if (locals.principal?.kind !== 'user') error(401, 'Nicht angemeldet');
  return locals.principal;
}

export function requireAdmin(locals: App.Locals): UserPrincipal {
  const p = requireUser(locals);
  if (p.role !== 'admin') error(403, 'Nur für die Schulverwaltung');
  return p;
}

export function requireStudent(locals: App.Locals) {
  if (locals.principal?.kind !== 'student') error(401, 'Nicht angemeldet');
  return locals.principal;
}

/** Fremde Klassen sind nicht von nicht vorhandenen zu unterscheiden. */
export function requireClass(locals: App.Locals, rawId: string) {
  const p = requireUser(locals);
  const id = Number(rawId);
  if (!Number.isInteger(id) || !canAccessClass(db(), p, id)) error(404, 'Klasse nicht gefunden');
  return { principal: p, klass: getClass(db(), id)! };
}

export function requireWritableClass(locals: App.Locals, rawId: string) {
  const r = requireClass(locals, rawId);
  if (r.klass.archived_at != null) error(409, 'Diese Klasse ist archiviert.');
  return r;
}

export function requireStudentAccess(locals: App.Locals, rawId: string) {
  const p = requireUser(locals);
  const id = Number(rawId);
  const student = Number.isInteger(id) ? getStudent(db(), id) : undefined;
  if (!student || !canAccessClass(db(), p, student.class_id)) error(404, 'Kind nicht gefunden');
  return { principal: p, student, klass: getClass(db(), student.class_id)! };
}

export function requireQuiz(locals: App.Locals, rawId: string) {
  const p = requireUser(locals);
  const id = Number(rawId);
  if (!Number.isInteger(id) || !canAccessQuiz(db(), p, id)) error(404, 'Quiz nicht gefunden');
  return { principal: p, quizId: id };
}

export function startSession(cookies: Cookies, subject: { userId?: number; studentId?: number }) {
  const token = createSession(db(), subject);
  cookies.set(COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.BIBERDAMM_INSECURE_COOKIES !== '1'
  });
}

export function clearSessionCookie(cookies: Cookies) {
  cookies.delete(COOKIE, { path: '/', secure: process.env.BIBERDAMM_INSECURE_COOKIES !== '1' });
}

export const text = (form: FormData, key: string, max = 200) => String(form.get(key) ?? '').trim().slice(0, max);
