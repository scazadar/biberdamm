import { db } from '#lib/server/db';
import { hasReadToday, openAssignments } from '#lib/server/school';
import { requireStudent } from '#lib/server/guard';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  const s = requireStudent(locals);
  return { assignments: openAssignments(db(), { id: s.id, classId: s.classId }), readToday: hasReadToday(db(), s.id) };
};
