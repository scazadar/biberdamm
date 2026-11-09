import { db } from '#lib/server/db';
import { requireAdmin } from '#lib/server/guard';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  requireAdmin(locals);
  return {
    entries: db().prepare('SELECT id, at, actor, action, detail FROM audit_log ORDER BY id DESC LIMIT 200').all() as unknown as {
      id: number;
      at: number;
      actor: string;
      action: string;
      detail: string;
    }[]
  };
};
