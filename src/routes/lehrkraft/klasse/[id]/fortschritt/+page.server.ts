import { db } from '#lib/server/db';
import { classProgress } from '#lib/server/school';
import { requireClass } from '#lib/server/guard';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
  const { klass } = requireClass(locals, params.id);
  const p = classProgress(db(), klass.id);
  return { ...p, students: p.students.map((s) => ({ id: s.id, name: s.display_name })) };
};
