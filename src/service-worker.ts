/// <reference lib="webworker" />
import { assets, immutable } from '$app/manifest';
import { version } from '$app/env';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `biberdamm-${version}`;
const normalize = (path: string) => (path.startsWith('/') ? path : `/${path}`);
const ASSETS = new Set([...immutable, ...assets].map((a) => normalize(a.path)));

sw.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll([...ASSETS]))
      .then(() => sw.skipWaiting())
  );
});

sw.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => sw.clients.claim())
  );
});

// Nur statische Dateien kommen aus dem Cache. Seiten und Daten enthalten
// personenbezogene Inhalte und bleiben auf geteilten Geräten bewusst außen vor (D-06).
sw.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== sw.location.origin || !ASSETS.has(url.pathname)) return;
  e.respondWith(caches.match(url.pathname).then((hit) => hit ?? fetch(e.request)));
});
