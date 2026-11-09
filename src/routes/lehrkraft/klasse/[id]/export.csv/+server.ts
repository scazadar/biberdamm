import type { RequestHandler } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { audit } from '#lib/server/auth';
import { classCsv } from '#lib/server/school';
import { requireClass } from '#lib/server/guard';

export const GET: RequestHandler = ({ locals, params }) => {
  const { klass, principal } = requireClass(locals, params.id!);
  audit(db(), principal.username, 'export.klasse', klass.name);
  return new Response(classCsv(db(), klass.id), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="lernstand-klasse-${klass.id}.csv"`
    }
  });
};
