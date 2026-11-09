import { fail } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { audit } from '#lib/server/auth';
import { getSchool } from '#lib/server/school';
import { requireAdmin, text } from '#lib/server/guard';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  requireAdmin(locals);
  return { school: getSchool(db())! };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const admin = requireAdmin(locals);
    const f = await request.formData();
    const name = text(f, 'name', 120);
    const days = Number(f.get('retention'));
    if (!name) return fail(400, { error: 'Bitte einen Namen eingeben.' });
    if (!Number.isInteger(days) || days < 30 || days > 3650) return fail(400, { error: 'Die Frist muss zwischen 30 und 3650 Tagen liegen.' });
    const freePlay = f.get('free_play') === 'on' ? 1 : 0;
    db().prepare('UPDATE school SET name = ?, retention_days = ?, free_play = ? WHERE id = 1').run(name, days, freePlay);
    audit(db(), admin.username, 'schule.geaendert', `Frist ${days}, freies Spielen ${freePlay ? 'an' : 'aus'}`);
    return { message: 'Gespeichert.' };
  }
};
