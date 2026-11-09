import { requireClass } from '#lib/server/guard';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, params }) => {
  const { klass } = requireClass(locals, params.id);
  return { klass: { id: klass.id, name: klass.name, code: klass.code, loginOpen: !!klass.login_open, archived: klass.archived_at != null } };
};
