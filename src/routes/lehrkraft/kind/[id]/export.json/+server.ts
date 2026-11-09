import type { RequestHandler } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { audit } from '#lib/server/auth';
import { exportStudent } from '#lib/server/school';
import { requireStudentAccess } from '#lib/server/guard';

export const GET: RequestHandler = ({ locals, params }) => {
  const { student, principal } = requireStudentAccess(locals, params.id!);
  audit(db(), principal.username, 'export.kind', String(student.id));
  return new Response(JSON.stringify(exportStudent(db(), student.id), null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="auskunft-kind-${student.id}.json"`
    }
  });
};
