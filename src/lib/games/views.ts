import type { Component } from 'svelte';

type Loader = () => Promise<{ default: Component }>;

/** Spielkomponenten werden einzeln nachgeladen. */
export const VIEWS: Record<string, Loader> = {
  tasten: () => import('./views/Tasten.svelte'),
  zehnfinger: () => import('./views/Zehnfinger.svelte'),
  zaehlen: () => import('./views/Zaehlen.svelte'),
  ballons: () => import('./views/Ballons.svelte'),
  anlaute: () => import('./views/Anlaute.svelte'),
  punkte: () => import('./views/Punkte.svelte'),
  spuren: () => import('./views/Spuren.svelte'),
  lebensraum: () => import('./views/Sort.svelte'),
  muell: () => import('./views/Sort.svelte'),
  raetsel: () => import('./views/Raetsel.svelte'),
  wachsen: () => import('./views/Wachsen.svelte'),
  wald: () => import('./views/Wald.svelte'),
  rechnen: () => import('./views/Rechnen.svelte'),
  woerter: () => import('./views/Woerter.svelte'),
  zahlenstrahl: () => import('./views/Zahlenstrahl.svelte'),
  lesen: () => import('./views/Lesen.svelte'),
  lautbruecke: () => import('./views/Lautbruecke.svelte'),
  silben: () => import('./views/Silben.svelte'),
  zahlenhaus: () => import('./views/Zahlenhaus.svelte'),
  blitzblick: () => import('./views/Blitzblick.svelte'),
  zehnerfeld: () => import('./views/Zehnerfeld.svelte'),
  quatsch: () => import('./views/Quatsch.svelte'),
  reime: () => import('./views/Reime.svelte'),
  hunderterfeld: () => import('./views/Hunderterfeld.svelte'),
  quiz: () => import('./views/Quiz.svelte')
};
