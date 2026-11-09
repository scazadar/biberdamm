import { error, fail } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { audit, picturesOf } from '#lib/server/auth';
import { addStudents, deleteStudent, getStudent, listStudents, parseNames, renameStudent, resetPicturePassword, setLoginOpen, unlockStudent } from '#lib/server/school';
import { requireClass, requireWritableClass, text } from '#lib/server/guard';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
  const { klass } = requireClass(locals, params.id);
  const now = Date.now();
  return {
    students: listStudents(db(), klass.id).map((s) => ({
      id: s.id,
      name: s.display_name,
      pictures: picturesOf(s.picture_password),
      locked: s.locked_until > now
    }))
  };
};

/** Liest das Kind aus dem Formular und stellt sicher, dass es zu dieser Klasse gehört. */
function classStudent(f: FormData, classId: number) {
  const s = getStudent(db(), Number(f.get('studentId')));
  if (!s || s.class_id !== classId) error(404, 'Kind nicht gefunden');
  return s;
}

export const actions: Actions = {
  add: async ({ request, locals, params }) => {
    const { klass, principal } = requireWritableClass(locals, params.id);
    const names = parseNames(String((await request.formData()).get('names') ?? '').slice(0, 10_000));
    if (names.length === 0) return fail(400, { error: 'Bitte mindestens einen Namen eingeben.' });
    const added = addStudents(db(), klass.id, names);
    audit(db(), principal.username, 'kinder.angelegt', `${klass.name}: ${added}`);
    return { message: `${added} Kinder hinzugefügt.` };
  },
  toggleLogin: async ({ locals, params }) => {
    const { klass } = requireWritableClass(locals, params.id);
    setLoginOpen(db(), klass.id, !klass.login_open);
  },
  rename: async ({ request, locals, params }) => {
    const { klass } = requireWritableClass(locals, params.id);
    const f = await request.formData();
    const s = classStudent(f, klass.id);
    const name = text(f, 'name', 40);
    if (!name) return fail(400, { error: 'Der Name darf nicht leer sein.' });
    renameStudent(db(), s.id, name);
    return { message: 'Name geändert.' };
  },
  newPictures: async ({ request, locals, params }) => {
    const { klass, principal } = requireWritableClass(locals, params.id);
    const s = classStudent(await request.formData(), klass.id);
    resetPicturePassword(db(), s.id);
    audit(db(), principal.username, 'kind.bilderpasswort', String(s.id));
    return { message: `Neues Bilderpasswort für ${s.display_name}.` };
  },
  unlock: async ({ request, locals, params }) => {
    const { klass } = requireWritableClass(locals, params.id);
    unlockStudent(db(), classStudent(await request.formData(), klass.id).id);
    return { message: 'Sperre aufgehoben.' };
  },
  remove: async ({ request, locals, params }) => {
    const { klass, principal } = requireClass(locals, params.id);
    const s = classStudent(await request.formData(), klass.id);
    deleteStudent(db(), s.id);
    audit(db(), principal.username, 'kind.geloescht', `${klass.name}: #${s.id}`);
    return { message: 'Kind und alle Lerndaten wurden gelöscht.' };
  }
};
