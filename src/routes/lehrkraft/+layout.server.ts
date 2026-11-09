import { requireUser } from '#lib/server/guard';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
  const u = requireUser(locals);
  return { user: { displayName: u.displayName, role: u.role, mustChange: u.mustChangePassword } };
};
