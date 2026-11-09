import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Gäste sammeln keine Sterne, also gibt es für sie kein Album.
export const load: PageServerLoad = ({ locals }) => {
  if (locals.principal?.kind === 'guest') redirect(303, '/lernen');
};
