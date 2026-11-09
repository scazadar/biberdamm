import { redirect } from '@sveltejs/kit';
import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { db } from '#lib/server/db';
import { resolveSession } from '#lib/server/auth';
import { isFreePlay, isSetUp, purgeExpired } from '#lib/server/school';
import { COOKIE } from '#lib/server/guard';
import { purgeSpeechCache, speechCacheDir } from '#lib/server/speech';

export const init: ServerInit = () => {
  const run = () => {
    purgeExpired(db());
    purgeSpeechCache(speechCacheDir());
  };
  run();
  setInterval(run, 24 * 3600_000).unref();
};

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;
  const database = db();

  if (!isSetUp(database) && path !== '/setup' && !path.startsWith('/_app/')) redirect(303, '/setup');

  const token = event.cookies.get(COOKIE) ?? null;
  event.locals.token = token;
  event.locals.principal = token ? resolveSession(database, token) : null;
  const under = (prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

  // Freies Spielen (F-07): Wer nicht angemeldet ist, spielt als Gast; die Kinder-Anmeldung entfällt.
  if (!event.locals.principal && (under('/lernen') || under('/api/sprache') || under('/kind')) && isFreePlay(database)) {
    if (under('/kind')) redirect(303, '/lernen');
    event.locals.principal = { kind: 'guest' };
  }
  const p = event.locals.principal;

  if (under('/api/ergebnisse') && p?.kind !== 'student') {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }
  // Lehrkräfte nutzen die Stimme für die Seite „Inhalte prüfen“.
  if (under('/api/sprache') && !p) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }
  if (under('/lernen') && p?.kind !== 'student' && p?.kind !== 'guest') redirect(303, '/kind');
  if ((under('/lehrkraft') || under('/admin')) && p?.kind !== 'user') redirect(303, '/login');
  if (under('/admin') && !(p?.kind === 'user' && p.role === 'admin')) redirect(303, '/lehrkraft');
  if (p?.kind === 'user' && p.mustChangePassword && !['/lehrkraft/passwort', '/abmelden'].includes(path) && (under('/lehrkraft') || under('/admin'))) {
    redirect(303, '/lehrkraft/passwort');
  }

  const response = await resolve(event);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // Nicht 'no-referrer': Dann senden Browser bei Formularen Origin: null und die CSRF-Prüfung schlägt fehl.
  response.headers.set('Referrer-Policy', 'same-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Seiten mit Personenbezug nie auf geteilten Geräten zwischenspeichern.
  if (!path.startsWith('/_app/') && !response.headers.has('cache-control')) {
    response.headers.set('Cache-Control', 'no-store');
  }
  return response;
};
