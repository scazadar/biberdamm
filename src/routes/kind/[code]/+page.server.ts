import { db } from '#lib/server/db';
import { getClassByCode, listStudents } from '#lib/server/school';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
  const klass = getClassByCode(db(), params.code);
  // Unbekannte und geschlossene Klassen sehen gleich aus: Es werden keine Namen ausgegeben (F-04).
  if (!klass || !klass.login_open || klass.archived_at != null) return { open: false as const };
  return {
    open: true as const,
    code: klass.code,
    className: klass.name,
    students: listStudents(db(), klass.id).map((s) => ({ id: s.id, name: s.display_name }))
  };
};
