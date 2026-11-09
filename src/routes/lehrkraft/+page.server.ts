import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { audit } from '#lib/server/auth';
import { createClass, getSchool, listClasses } from '#lib/server/school';
import { requireUser, text } from '#lib/server/guard';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => ({
  school: getSchool(db())?.name,
  classes: listClasses(db(), requireUser(locals))
});

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const u = requireUser(locals);
    const name = text(await request.formData(), 'name', 60);
    if (!name) return fail(400, { error: 'Bitte einen Klassennamen eingeben.' });
    const id = createClass(db(), name, u.id);
    audit(db(), u.username, 'klasse.angelegt', name);
    redirect(303, `/lehrkraft/klasse/${id}`);
  }
};
