import { describe, expect, it } from 'vitest';
import { TYPING_WORDS, BUMP_KEYS, FINGER_BY_ID, FINGER_LEVELS, KEY_FINGER, KEY_ROWS, fingerPhrase } from './fingers';

const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

describe('Zehn-Finger-System', () => {
  it('jeder Buchstabe hat genau einen Finger und eine Taste', () => {
    const keys = KEY_ROWS.flatMap((r) => [...r.keys]);
    expect([...keys].sort()).toEqual(ALPHABET);
    for (const l of ALPHABET) expect(FINGER_BY_ID.get(KEY_FINGER[l]), l).toBeDefined();
  });

  it('Stufe 1 übt nur die Zeigefinger', () => {
    for (const l of FINGER_LEVELS[0]) expect(FINGER_BY_ID.get(KEY_FINGER[l])!.name, l).toBe('Zeigefinger');
  });

  it('die Stufen bauen aufeinander auf', () => {
    for (const level of FINGER_LEVELS) expect(new Set(level).size).toBe(level.length);
    for (let i = 2; i < FINGER_LEVELS.length; i++) for (const l of FINGER_LEVELS[i - 1]) expect(FINGER_LEVELS[i]).toContain(l);
    expect([...FINGER_LEVELS.at(-1)!].sort()).toEqual(ALPHABET);
  });

  it('Tastmarken liegen unter den Zeigefingern', () => {
    expect(BUMP_KEYS.map((k) => FINGER_BY_ID.get(KEY_FINGER[k])!.home)).toEqual(BUMP_KEYS);
  });

  it('nennt den Finger verständlich', () => {
    expect(fingerPhrase('f')).toBe('mit dem linken Zeigefinger');
    expect(fingerPhrase('P')).toBe('mit dem rechten kleinen Finger');
    expect(fingerPhrase('K')).toBe('mit dem rechten Mittelfinger');
  });

  it('Tippwörter bestehen nur aus Tasten der Tastatur und sind eindeutig', () => {
    for (const w of TYPING_WORDS) expect(w.word.toUpperCase(), w.word).toMatch(/^[A-Z]{3,5}$/);
    expect(new Set(TYPING_WORDS.map((w) => w.word)).size).toBe(TYPING_WORDS.length);
    expect(new Set(TYPING_WORDS.map((w) => w.emoji)).size).toBe(TYPING_WORDS.length);
  });
});
