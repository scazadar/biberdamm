import { requireAdmin } from '#lib/server/guard';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
  const u = requireAdmin(locals);
  return { user: { displayName: u.displayName, role: u.role } };
};
