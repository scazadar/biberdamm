import { redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { isFreePlay } from '#lib/server/school';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  const p = locals.principal;
  if (p?.kind === 'student') redirect(303, '/lernen');
  if (p?.kind === 'user') redirect(303, '/lehrkraft');
  if (isFreePlay(db())) redirect(303, '/lernen');
};
