import { db } from '#lib/server/db';
import { studentProgress, totalStars } from '#lib/server/school';
import { requireStudentAccess } from '#lib/server/guard';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
  const { student, klass } = requireStudentAccess(locals, params.id);
  return {
    student: { id: student.id, name: student.display_name },
    klass: { id: klass.id, name: klass.name },
    stars: totalStars(db(), student.id),
    ...studentProgress(db(), student.id)
  };
};
