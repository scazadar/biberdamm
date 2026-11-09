import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { audit, hashPassword, verifyPassword } from '#lib/server/auth';
import { requireUser } from '#lib/server/guard';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const u = requireUser(locals);
    const f = await request.formData();
    const current = String(f.get('current') ?? '');
    const next = String(f.get('next') ?? '');
    const row = db().prepare('SELECT password_hash FROM users WHERE id = ?').get(u.id) as { password_hash: string };
    if (!verifyPassword(current, row.password_hash)) return fail(400, { error: 'Das aktuelle Passwort stimmt nicht.' });
    if (next.length < 10) return fail(400, { error: 'Das neue Passwort braucht mindestens 10 Zeichen.' });
    if (next === current) return fail(400, { error: 'Bitte ein anderes Passwort wählen.' });
    db().prepare('UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?').run(hashPassword(next), u.id);
    audit(db(), u.username, 'passwort.geaendert');
    redirect(303, '/lehrkraft');
  }
};
