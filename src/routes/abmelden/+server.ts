import { redirect, type RequestHandler } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { destroySession } from '#lib/server/auth';
import { getClass } from '#lib/server/school';
import { clearSessionCookie } from '#lib/server/guard';

export const POST: RequestHandler = ({ locals, cookies }) => {
  const p = locals.principal;
  if (locals.token) destroySession(db(), locals.token);
  clearSessionCookie(cookies);
  // Auf Klassen-Tablets führt die Abmeldung direkt zur Namensauswahl für das nächste Kind.
  redirect(303, p?.kind === 'student' ? `/kind/${getClass(db(), p.classId)?.code ?? ''}` : '/');
};
