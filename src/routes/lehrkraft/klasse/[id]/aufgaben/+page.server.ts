import { error, fail } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { GAMES } from '#lib/games/catalog';
import { assignmentProgress, canAccessQuiz, createAssignment, deleteAssignment, getAssignment, listAssignments, listQuizzes, listStudents } from '#lib/server/school';
import { requireClass, requireWritableClass, text } from '#lib/server/guard';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
  const { klass, principal } = requireClass(locals, params.id);
  const students = listStudents(db(), klass.id);
  const progress = assignmentProgress(db(), klass.id);
  return {
    games: GAMES.map((g) => ({ id: g.id, title: g.title, icon: g.icon, levels: g.levels })),
    quizzes: listQuizzes(db(), principal).filter((q) => q.question_count > 0),
    assignments: listAssignments(db(), klass.id).map((a) => {
      const done = students.filter((s) => (progress.get(a.id)?.get(s.id) ?? 0) >= a.rounds);
      return { ...a, finished: done.map((s) => s.display_name), open: students.filter((s) => !done.includes(s)).map((s) => s.display_name) };
    })
  };
};

export const actions: Actions = {
  create: async ({ request, locals, params }) => {
    const { klass, principal } = requireWritableClass(locals, params.id);
    const f = await request.formData();
    const gameId = text(f, 'game', 20);
    const quizId = gameId === 'quiz' ? Number(f.get('quiz')) : null;
    if (quizId !== null && !canAccessQuiz(db(), principal, quizId)) return fail(400, { error: 'Bitte ein eigenes Quiz wählen.' });
    const due = text(f, 'due', 10);
    if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) return fail(400, { error: 'Ungültiges Datum.' });
    try {
      createAssignment(db(), {
        classId: klass.id,
        gameId,
        level: gameId === 'quiz' ? 1 : Number(f.get('level')),
        rounds: Number(f.get('rounds')),
        quizId,
        dueDate: due || null,
        createdBy: principal.id
      });
    } catch {
      return fail(400, { error: 'Bitte die Angaben prüfen.' });
    }
    return { message: 'Aufgabe angelegt.' };
  },
  remove: async ({ request, locals, params }) => {
    const { klass } = requireWritableClass(locals, params.id);
    const a = getAssignment(db(), Number((await request.formData()).get('id')));
    if (!a || a.class_id !== klass.id) error(404, 'Aufgabe nicht gefunden');
    deleteAssignment(db(), a.id);
    return { message: 'Aufgabe entfernt.' };
  }
};
