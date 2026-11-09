import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { isSetUp, setupSchool } from '#lib/server/school';
import { text } from '#lib/server/guard';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  if (isSetUp(db())) redirect(303, '/');
};

export const actions: Actions = {
  default: async ({ request }) => {
    if (isSetUp(db())) redirect(303, '/');
    const f = await request.formData();
    const school = text(f, 'school', 120);
    const displayName = text(f, 'displayName', 80);
    const username = text(f, 'username', 40);
    const password = String(f.get('password') ?? '');
    if (!school || !displayName || !username) return fail(400, { error: 'Bitte alle Felder ausfüllen.' });
    if (password.length < 10) return fail(400, { error: 'Das Passwort braucht mindestens 10 Zeichen.' });
    setupSchool(db(), { school, displayName, username, password });
    redirect(303, '/login');
  }
};
