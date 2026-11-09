/** Lernmodell gemäß Spezifikation, Abschnitt 5. Reine Funktionen, auf Server und Client nutzbar. */

export const MIN_ATTEMPTS = 5;
export const MASTERY_WINDOW = 15;

export type Status = 'offen' | 'hilfe' | 'uebt' | 'sicher';

export const STATUS_LABEL: Record<Status, string> = {
  offen: 'Noch offen',
  hilfe: 'Braucht Unterstützung',
  uebt: 'Übt noch',
  sicher: 'Sicher'
};

export const STATUS_SYMBOL: Record<Status, string> = {
  offen: '○',
  hilfe: '▲',
  uebt: '◐',
  sicher: '●'
};

export function attemptScore(wrongTries: number, hints: number): number {
  if (wrongTries === 0) return hints > 0 ? 0.7 : 1;
  return wrongTries === 1 ? 0.4 : 0;
}

/** `scores` in beliebiger Länge, neueste zuerst. */
export function mastery(scores: number[]): { value: number | null; status: Status; n: number } {
  const recent = scores.slice(0, MASTERY_WINDOW);
  if (recent.length < MIN_ATTEMPTS) {
    return { value: recent.length ? mean(recent) : null, status: 'offen', n: recent.length };
  }
  const value = mean(recent);
  const status: Status = value < 0.5 ? 'hilfe' : value < 0.8 ? 'uebt' : 'sicher';
  return { value, status, n: recent.length };
}

/** `lastRounds` neueste zuerst, jeweils mit Stufe und Wert der Runde. */
export function recommendLevel(
  lastRounds: { level: number; score: number }[],
  maxLevel: number
): number {
  if (lastRounds.length === 0) return 1;
  const [latest, previous] = lastRounds;
  let level = latest.level;
  if (latest.score < 0.5) level -= 1;
  else if (previous && previous.level === latest.level && latest.score >= 0.85 && previous.score >= 0.85) {
    level += 1;
  }
  return Math.min(maxLevel, Math.max(1, level));
}

/** Bisherige Werte eines Inhalts (neueste zuerst) und Zeitpunkt des letzten Übens. */
export interface ItemHistory {
  scores: number[];
  lastAt: number;
}

/** Tage bis zur nächsten Wiederholung je nach Sicherheit; unsichere Inhalte werden nicht gedämpft. */
export function reviewInterval(score: number): number {
  return score < 0.5 ? 0 : score < 0.8 ? 2 : 7;
}

/** Faktor für verteiltes Üben: gerade Geübtes tritt zurück, Überfälliges kommt häufiger (5.3). */
export function spacingFactor(score: number, ageDays: number): number {
  const interval = reviewInterval(score);
  if (interval === 0) return 1;
  return Math.min(2, Math.max(0.25, Math.max(0, ageDays) / interval));
}

/**
 * Gewicht eines Inhalts; `recent` sind die letzten Werte dieses Inhalts,
 * `ageDays` die Tage seit dem letzten Üben (ohne Angabe keine Zeitwirkung).
 */
export function itemWeight(recent: number[] | undefined, ageDays?: number): number {
  if (!recent || recent.length === 0) return 2;
  const score = mean(recent.slice(0, 5));
  const base = 1 + 3 * (1 - score);
  return ageDays === undefined ? base : base * spacingFactor(score, ageDays);
}

/**
 * Wählt gewichtet zufällig; `exclude` verhindert direkte Wiederholung,
 * solange noch andere Inhalte verfügbar sind.
 */
export function weightedPick<T>(
  pool: readonly T[],
  weightOf: (x: T) => number,
  exclude?: T,
  random: () => number = Math.random
): T {
  const candidates = pool.length > 1 && exclude !== undefined ? pool.filter((x) => x !== exclude) : pool;
  const weights = candidates.map(weightOf);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r < 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export const STARS_PER_STICKER = 10;

function mean(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
