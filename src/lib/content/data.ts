export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const DIGITS = '123456789'.split('');

export interface Word {
  word: string;
  emoji: string;
}

/** Anlaut-Wörter; Q, X und Y fehlen bewusst (keine kindgerechten Bildwörter). */
export const WORDS: Record<string, Word> = {
  A: { word: 'Affe', emoji: '🐒' },
  B: { word: 'Banane', emoji: '🍌' },
  C: { word: 'Clown', emoji: '🤡' },
  D: { word: 'Delfin', emoji: '🐬' },
  E: { word: 'Elefant', emoji: '🐘' },
  F: { word: 'Fisch', emoji: '🐟' },
  G: { word: 'Giraffe', emoji: '🦒' },
  H: { word: 'Hund', emoji: '🐶' },
  I: { word: 'Igel', emoji: '🦔' },
  J: { word: 'Jojo', emoji: '🪀' },
  K: { word: 'Katze', emoji: '🐱' },
  L: { word: 'Löwe', emoji: '🦁' },
  M: { word: 'Maus', emoji: '🐭' },
  N: { word: 'Nase', emoji: '👃' },
  O: { word: 'Oktopus', emoji: '🐙' },
  P: { word: 'Pinguin', emoji: '🐧' },
  R: { word: 'Rakete', emoji: '🚀' },
  S: { word: 'Sonne', emoji: '☀️' },
  T: { word: 'Tomate', emoji: '🍅' },
  U: { word: 'Uhr', emoji: '⌚' },
  V: { word: 'Vogel', emoji: '🐦' },
  W: { word: 'Wal', emoji: '🐳' },
  Z: { word: 'Zebra', emoji: '🦓' },
};

export const WORD_LETTERS = Object.keys(WORDS);

export const NUMBER_WORDS = [
  'null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn',
  'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn',
];

export const rand = (n: number) => Math.floor(Math.random() * n);

export const pick = <T>(arr: readonly T[]): T => arr[rand(arr.length)];

export function pickOther<T>(arr: readonly T[], not: T): T {
  let x: T;
  do {
    x = pick(arr);
  } while (x === not && arr.length > 1);
  return x;
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);
