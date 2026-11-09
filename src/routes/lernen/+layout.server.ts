import { db } from '#lib/server/db';
import { getClass, totalStars } from '#lib/server/school';
import { requireStudent } from '#lib/server/guard';
import { speechUrl } from '#lib/server/speech';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
  const s = requireStudent(locals);
  const k = getClass(db(), s.classId)!;
  return {
    student: { id: s.id, name: s.displayName },
    settings: { calm: !!k.calm_mode, speech: !!k.speech, disabled: JSON.parse(k.disabled_games) as string[], serverSpeech: !!speechUrl() },
    stars: totalStars(db(), s.id)
  };
};
