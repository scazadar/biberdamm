import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { audit, checkPicturePassword, destroySession, PICTURE_LENGTH, PICTURES } from '#lib/server/auth';
import { getClassByCode, getStudent } from '#lib/server/school';
import { startSession } from '#lib/server/guard';
import type { Actions, PageServerLoad } from './$types';

function resolve(code: string, rawId: string) {
  const klass = getClassByCode(db(), code);
  const student = getStudent(db(), Number(rawId));
  if (!klass || !klass.login_open || klass.archived_at != null || !student || student.class_id !== klass.id) {
    return null;
  }
  return { klass, student };
}

export const load: PageServerLoad = ({ params }) => {
  const r = resolve(params.code, params.student);
  if (!r) redirect(303, `/kind/${params.code}`);
  return { name: r.student.display_name, code: r.klass.code, pictures: [...PICTURES] as string[], length: PICTURE_LENGTH };
};

export const actions: Actions = {
  default: async ({ params, request, cookies, locals }) => {
    const r = resolve(params.code, params.student);
    if (!r) error(404, 'Nicht gefunden');
    const attempt = String((await request.formData()).get('pictures') ?? '').slice(0, 20);
    const result = checkPicturePassword(db(), r.student.id, attempt);
    if (result === 'locked') {
      audit(db(), `kind:${r.student.id}`, 'anmeldung.gesperrt');
      return fail(429, { error: 'locked' as const });
    }
    if (result === 'wrong') return fail(400, { error: 'wrong' as const });
    if (locals.token) destroySession(db(), locals.token);
    startSession(cookies, { studentId: r.student.id });
    redirect(303, '/lernen');
  }
};
