import { db } from '#lib/server/db';
import { hasReadToday, openAssignments } from '#lib/server/school';
import { requireLearner } from '#lib/server/guard';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  const s = requireLearner(locals);
  if (s.kind === 'guest') return { assignments: [], readToday: true };
  return { assignments: openAssignments(db(), { id: s.id, classId: s.classId }), readToday: hasReadToday(db(), s.id) };
};
