import { describe, expect, it } from 'vitest';
import { PICTURE_SENTENCES, RHYME_PAIRS } from './sentences';

describe('Sätze und Reime', () => {
  it('jede Stufe hat genug eindeutige Sätze, die als Lernelement gespeichert werden können', () => {
    expect(PICTURE_SENTENCES).toHaveLength(3);
    const all = PICTURE_SENTENCES.flat().flatMap((p) => [p.fits, p.nonsense]);
    expect(new Set(all).size).toBe(all.length);
    for (const level of PICTURE_SENTENCES) expect(level.length).toBeGreaterThanOrEqual(8);
    for (const text of all) expect(text.length).toBeLessThanOrEqual(60);
  });

  it('Reimwörter und Bilder kommen nur einmal vor', () => {
    const words = RHYME_PAIRS.flat();
    expect(new Set(words.map((w) => w.word)).size).toBe(words.length);
    expect(new Set(words.map((w) => w.emoji)).size).toBe(words.length);
  });
});
