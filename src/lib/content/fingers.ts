/** Zehn-Finger-System auf der deutschen QWERTZ-Tastatur (nur Buchstaben A–Z). */

export type Hand = 'links' | 'rechts';
export type FingerName = 'kleiner Finger' | 'Ringfinger' | 'Mittelfinger' | 'Zeigefinger' | 'Daumen';

export interface Finger {
  id: string;
  hand: Hand;
  name: FingerName;
  /** Grundstellung des Fingers, z. B. F für den linken Zeigefinger. */
  home: string | null;
}

export const FINGERS: Finger[] = [
  { id: 'l5', hand: 'links', name: 'kleiner Finger', home: 'A' },
  { id: 'l4', hand: 'links', name: 'Ringfinger', home: 'S' },
  { id: 'l3', hand: 'links', name: 'Mittelfinger', home: 'D' },
  { id: 'l2', hand: 'links', name: 'Zeigefinger', home: 'F' },
  { id: 'l1', hand: 'links', name: 'Daumen', home: null },
  { id: 'r1', hand: 'rechts', name: 'Daumen', home: null },
  { id: 'r2', hand: 'rechts', name: 'Zeigefinger', home: 'J' },
  { id: 'r3', hand: 'rechts', name: 'Mittelfinger', home: 'K' },
  { id: 'r4', hand: 'rechts', name: 'Ringfinger', home: 'L' },
  { id: 'r5', hand: 'rechts', name: 'kleiner Finger', home: null }
];

export const FINGER_BY_ID = new Map(FINGERS.map((f) => [f.id, f]));

/** Welcher Finger tippt welchen Buchstaben. */
export const KEY_FINGER: Record<string, string> = {
  Q: 'l5', A: 'l5', Y: 'l5',
  W: 'l4', S: 'l4', X: 'l4',
  E: 'l3', D: 'l3', C: 'l3',
  R: 'l2', F: 'l2', V: 'l2', T: 'l2', G: 'l2', B: 'l2',
  Z: 'r2', H: 'r2', N: 'r2', U: 'r2', J: 'r2', M: 'r2',
  I: 'r3', K: 'r3',
  O: 'r4', L: 'r4',
  P: 'r5'
};

/** Tastaturreihen wie auf der echten Tastatur, mit Versatz in Tastenbreiten. */
export const KEY_ROWS: { keys: string; offset: number }[] = [
  { keys: 'QWERTZUIOP', offset: 0 },
  { keys: 'ASDFGHJKL', offset: 0.3 },
  { keys: 'YXCVBNM', offset: 0.8 }
];

/** Tasten mit Tastmarke zum Finden der Grundstellung. */
export const BUMP_KEYS = ['F', 'J'];

/** Buchstaben je Stufe: erst nur Zeigefinger, dann Grundreihe, dann obere Reihe, dann alle. */
export const FINGER_LEVELS: string[][] = [
  [...'FGRTVBJHUZNM'],
  [...'ASDFGHJKL'],
  [...'ASDFGHJKLQWERTZUIOP'],
  [...'QWERTZUIOPASDFGHJKLYXCVBNM']
];

/** „mit dem linken Zeigefinger“ */
export function fingerPhrase(letter: string): string {
  const f = FINGER_BY_ID.get(KEY_FINGER[letter.toUpperCase()])!;
  const adj = f.hand === 'links' ? 'linken' : 'rechten';
  return f.name === 'kleiner Finger' ? `mit dem ${adj} kleinen Finger` : `mit dem ${adj} ${f.name}`;
}

export interface TypingWord {
  word: string;
  emoji: string;
}

/** Kurze Wörter zum Abtippen: nur A–Z, ohne Umlaute und ß. */
export const TYPING_WORDS: TypingWord[] = [
  { word: 'Hund', emoji: '🐶' },
  { word: 'Maus', emoji: '🐭' },
  { word: 'Ball', emoji: '⚽' },
  { word: 'Baum', emoji: '🌳' },
  { word: 'Nase', emoji: '👃' },
  { word: 'Igel', emoji: '🦔' },
  { word: 'Haus', emoji: '🏠' },
  { word: 'Auto', emoji: '🚗' },
  { word: 'Mond', emoji: '🌙' },
  { word: 'Wal', emoji: '🐳' },
  { word: 'Uhr', emoji: '⌚' },
  { word: 'Rose', emoji: '🌹' },
  { word: 'Eis', emoji: '🍦' },
  { word: 'Kuh', emoji: '🐄' },
  { word: 'Bus', emoji: '🚌' },
  { word: 'Zug', emoji: '🚂' },
  { word: 'Hut', emoji: '👒' },
  { word: 'Boot', emoji: '⛵' },
  { word: 'Fisch', emoji: '🐟' },
  { word: 'Sonne', emoji: '☀️' }
];
