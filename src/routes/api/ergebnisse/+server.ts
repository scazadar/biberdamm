import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { parseRound, saveRound } from '#lib/server/school';
import { requireStudent } from '#lib/server/guard';

export const POST: RequestHandler = async ({ request, locals }) => {
  const s = requireStudent(locals);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'bad request' }, { status: 415 });
  const raw = await request.text();
  if (raw.length > 20_000) return json({ error: 'too large' }, { status: 413 });
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json({ error: 'bad request' }, { status: 400 });
  }
  const round = parseRound(parsed);
  if (!round) return json({ error: 'invalid' }, { status: 400 });
  const result = saveRound(db(), { id: s.id, classId: s.classId }, round);
  return json({ result }, { status: result === 'rejected' ? 403 : 200 });
};
