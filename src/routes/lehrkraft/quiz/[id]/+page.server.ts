import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { MAX_QUIZ_QUESTIONS } from '#lib/games/catalog';
import { addQuizQuestion, deleteQuiz, deleteQuizQuestion, getQuizQuestions, getQuizTitle, validateQuizQuestion } from '#lib/server/school';
import { requireQuiz, text } from '#lib/server/guard';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
  const { quizId } = requireQuiz(locals, params.id);
  return { title: getQuizTitle(db(), quizId), questions: getQuizQuestions(db(), quizId), max: MAX_QUIZ_QUESTIONS };
};

export const actions: Actions = {
  add: async ({ request, locals, params }) => {
    const { quizId } = requireQuiz(locals, params.id);
    const f = await request.formData();
    const q = {
      prompt: text(f, 'prompt', 200),
      emoji: text(f, 'emoji', 16),
      answers: [0, 1, 2, 3].map((i) => text(f, `answer${i}`, 80)),
      correct: Number(f.get('correct')),
      explanation: text(f, 'explanation', 300)
    };
    const problem = validateQuizQuestion(q);
    if (problem) return fail(400, { error: problem });
    const filled = q.answers.filter(Boolean);
    if (new Set(filled).size !== filled.length) return fail(400, { error: 'Die Antworten müssen sich unterscheiden.' });
    try {
      addQuizQuestion(db(), quizId, q);
    } catch {
      return fail(400, { error: `Ein Quiz kann höchstens ${MAX_QUIZ_QUESTIONS} Fragen haben.` });
    }
    return { message: 'Frage hinzugefügt.' };
  },
  removeQuestion: async ({ request, locals, params }) => {
    const { quizId } = requireQuiz(locals, params.id);
    deleteQuizQuestion(db(), quizId, Number((await request.formData()).get('id')));
    return { message: 'Frage entfernt.' };
  },
  remove: async ({ locals, params }) => {
    deleteQuiz(db(), requireQuiz(locals, params.id).quizId);
    redirect(303, '/lehrkraft/quiz');
  }
};
