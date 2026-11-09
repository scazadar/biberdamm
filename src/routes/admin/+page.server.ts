import { fail } from '@sveltejs/kit';
import { randomBytes } from 'node:crypto';
import { db } from '#lib/server/db';
import { audit, hashPassword } from '#lib/server/auth';
import { canAccessClass, createTeacher, listClasses } from '#lib/server/school';
import { requireAdmin, text } from '#lib/server/guard';
import type { Actions, PageServerLoad } from './$types';

const tempPassword = () => randomBytes(9).toString('base64url');

export const load: PageServerLoad = ({ locals }) => {
  const admin = requireAdmin(locals);
  const users = db()
    .prepare('SELECT id, username, display_name, role, active FROM users ORDER BY display_name')
    .all() as unknown as { id: number; username: string; display_name: string; role: string; active: number }[];
  return { users, classes: listClasses(db(), admin).map((c) => ({ id: c.id, name: c.name })), selfId: admin.id };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const admin = requireAdmin(locals);
    const f = await request.formData();
    const username = text(f, 'username', 40);
    const displayName = text(f, 'displayName', 80);
    if (!username || !displayName) return fail(400, { error: 'Bitte alle Felder ausfüllen.' });
    const password = tempPassword();
    try {
      createTeacher(db(), { username, displayName, password, role: f.get('role') === 'admin' ? 'admin' : 'teacher' });
    } catch {
      return fail(400, { error: 'Dieser Benutzername ist bereits vergeben.' });
    }
    audit(db(), admin.username, 'lehrkraft.angelegt', username);
    return { temp: { username, password } };
  },
  reset: async ({ request, locals }) => {
    const admin = requireAdmin(locals);
    const id = Number((await request.formData()).get('id'));
    const row = db().prepare('SELECT username FROM users WHERE id = ?').get(id) as { username: string } | undefined;
    if (!row) return fail(404, { error: 'Nicht gefunden.' });
    const password = tempPassword();
    db().prepare('UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?').run(hashPassword(password), id);
    db().prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
    audit(db(), admin.username, 'lehrkraft.passwort_zurueckgesetzt', row.username);
    return { temp: { username: row.username, password } };
  },
  toggle: async ({ request, locals }) => {
    const admin = requireAdmin(locals);
    const id = Number((await request.formData()).get('id'));
    if (id === admin.id) return fail(400, { error: 'Das eigene Konto kann nicht deaktiviert werden.' });
    db().prepare('UPDATE users SET active = 1 - active WHERE id = ?').run(id);
    db().prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
    audit(db(), admin.username, 'lehrkraft.status_geaendert', String(id));
    return { message: 'Status geändert.' };
  },
  assign: async ({ request, locals }) => {
    const admin = requireAdmin(locals);
    const f = await request.formData();
    const userId = Number(f.get('id'));
    const classId = Number(f.get('classId'));
    if (!canAccessClass(db(), admin, classId)) return fail(404, { error: 'Klasse nicht gefunden.' });
    db().prepare('INSERT OR IGNORE INTO class_teachers (class_id, user_id) VALUES (?,?)').run(classId, userId);
    audit(db(), admin.username, 'lehrkraft.klasse_zugeordnet', `${userId} -> ${classId}`);
    return { message: 'Klasse zugeordnet.' };
  }
};
