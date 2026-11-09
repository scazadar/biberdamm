import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  const p = locals.principal;
  if (p?.kind === 'student') redirect(303, '/lernen');
  if (p?.kind === 'user') redirect(303, '/lehrkraft');
};
