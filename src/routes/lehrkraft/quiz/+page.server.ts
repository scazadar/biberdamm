import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { createQuiz, listQuizzes } from '#lib/server/school';
import { requireUser, text } from '#lib/server/guard';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => ({ quizzes: listQuizzes(db(), requireUser(locals)) });

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const u = requireUser(locals);
    const title = text(await request.formData(), 'title', 80);
    if (!title) return fail(400, { error: 'Bitte einen Titel eingeben.' });
    redirect(303, `/lehrkraft/quiz/${createQuiz(db(), u.id, title)}`);
  }
};
