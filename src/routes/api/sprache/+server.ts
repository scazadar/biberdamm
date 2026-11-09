import { json, type RequestHandler } from '@sveltejs/kit';
import { MAX_SPEECH_TEXT, speechCacheDir, speechUrl, synthesize } from '#lib/server/speech';

// POST statt GET: Texte sollen nicht in den Zugriffsprotokollen des Proxys landen.
export const POST: RequestHandler = async ({ request }) => {
  const url = speechUrl();
  if (!url) return json({ error: 'not configured' }, { status: 503 });
  const body = (await request.json().catch(() => null)) as { text?: unknown } | null;
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text || text.length > MAX_SPEECH_TEXT) return json({ error: 'invalid' }, { status: 400 });
  const audio = await synthesize(text, { url, dir: speechCacheDir() });
  if (!audio) return json({ error: 'unavailable' }, { status: 503 });
  return new Response(audio as BodyInit, { headers: { 'content-type': 'audio/wav' } });
};
