import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { audit, burnPasswordCheck, clearLoginFailures, destroySession, isThrottled, recordLoginFailure, verifyPassword } from '#lib/server/auth';
import { startSession, text } from '#lib/server/guard';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  if (locals.principal?.kind === 'user') redirect(303, '/lehrkraft');
};

export const actions: Actions = {
  default: async ({ request, cookies, getClientAddress, locals }) => {
    const f = await request.formData();
    const username = text(f, 'username', 40);
    const password = String(f.get('password') ?? '').slice(0, 500);
    const key = `${username.toLowerCase()}|${getClientAddress()}`;
    const database = db();
    if (isThrottled(database, key)) {
      return fail(429, { error: 'Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen.' });
    }
    const user = database
      .prepare('SELECT id, username, password_hash, active FROM users WHERE username = ?')
      .get(username) as { id: number; username: string; password_hash: string; active: number } | undefined;
    const valid = user ? verifyPassword(password, user.password_hash) : burnPasswordCheck(password);
    if (!user || !valid || !user.active) {
      recordLoginFailure(database, key);
      audit(database, username || '(leer)', 'anmeldung.fehlgeschlagen');
      return fail(400, { error: 'Benutzername oder Passwort ist falsch.' });
    }
    clearLoginFailures(database, key);
    if (locals.token) destroySession(database, locals.token);
    startSession(cookies, { userId: user.id });
    audit(database, user.username, 'anmeldung');
    redirect(303, '/lehrkraft');
  }
};
