import { db } from '#lib/server/db';
import { getClass, totalStars } from '#lib/server/school';
import { requireLearner } from '#lib/server/guard';
import { speechUrl } from '#lib/server/speech';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
  const s = requireLearner(locals);
  const serverSpeech = !!speechUrl();
  // Gäste haben die Kennung 0: Ihre Runden werden weder gespeichert noch übertragen.
  if (s.kind === 'guest') {
    return { guest: true, student: { id: 0, name: '' }, settings: { calm: false, speech: true, disabled: [] as string[], serverSpeech }, stars: 0 };
  }
  const k = getClass(db(), s.classId)!;
  return {
    guest: false,
    student: { id: s.id, name: s.displayName },
    settings: { calm: !!k.calm_mode, speech: !!k.speech, disabled: JSON.parse(k.disabled_games) as string[], serverSpeech },
    stars: totalStars(db(), s.id)
  };
};
