import { redirect } from '@sveltejs/kit';
import { text } from '#lib/server/guard';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const code = text(await request.formData(), 'code', 12).toUpperCase().replace(/[^A-Z0-9]/g, '');
    redirect(303, `/kind/${code || '-'}`);
  }
};
