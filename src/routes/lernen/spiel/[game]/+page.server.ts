import { error, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { GAME_BY_ID } from '#lib/games/catalog';
import { gamePlan, getAssignment, getClass, getQuizQuestions } from '#lib/server/school';
import { requireLearner } from '#lib/server/guard';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, locals, url }) => {
  const s = requireLearner(locals);
  const game = GAME_BY_ID.get(params.game);
  if (!game) error(404, 'Spiel nicht gefunden');

  // Gäste wählen die Stufe selbst; ohne gespeicherte Runden gibt es keinen Vorschlag.
  if (s.kind === 'guest') {
    if (game.id === 'quiz') redirect(303, '/lernen');
    const chosen = Number(url.searchParams.get('stufe'));
    const level = Number.isInteger(chosen) && chosen >= 1 && chosen <= game.levels.length ? chosen : 1;
    return { gameId: game.id, level, assignmentId: null, history: {}, quiz: null };
  }

  const rawAssignment = url.searchParams.get('aufgabe');
  const plan = gamePlan(db(), s.id, game.id);
  let level = plan.level;
  let assignmentId: number | null = null;
  let quiz = null;

  if (rawAssignment) {
    const a = getAssignment(db(), Number(rawAssignment));
    if (!a || a.class_id !== s.classId || a.game_id !== game.id) error(404, 'Aufgabe nicht gefunden');
    assignmentId = a.id;
    level = a.level;
    if (game.id === 'quiz') {
      quiz = getQuizQuestions(db(), a.quiz_id!);
      if (quiz.length === 0) error(404, 'Dieses Quiz hat noch keine Fragen.');
    }
  } else {
    const disabled = JSON.parse(getClass(db(), s.classId)!.disabled_games) as string[];
    if (game.id === 'quiz' || disabled.includes(game.id)) redirect(303, '/lernen');
  }

  return { gameId: game.id, level, assignmentId, history: plan.history, quiz };
};
