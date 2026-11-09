import { describe, expect, it } from 'vitest';
import { SOUND_WORDS, SPOKEN_SOUNDS, SYLLABLE_WORDS } from './phonics';

const unique = (list: string[]) => new Set(list).size === list.length;

describe('Wortlisten', () => {
  it('jeder Laut hat eine gesprochene Form', () => {
    for (const w of SOUND_WORDS) for (const s of w.sounds) expect(SPOKEN_SOUNDS[s], `${w.word}: ${s}`).toBeDefined();
  });

  it('Bilder und Wörter sind eindeutig', () => {
    for (const list of [SOUND_WORDS, SYLLABLE_WORDS]) {
      expect(unique(list.map((w) => w.word))).toBe(true);
      expect(unique(list.map((w) => w.emoji))).toBe(true);
    }
  });

  it('jede Stufe hat genug Wörter', () => {
    const lengths = [[2, 3], [3, 4], [4, 5]];
    for (const [min, max] of lengths) {
      expect(SOUND_WORDS.filter((w) => w.sounds.length >= min && w.sounds.length <= max).length).toBeGreaterThanOrEqual(8);
    }
    expect(SYLLABLE_WORDS.filter((w) => w.syllables.length <= 2).length).toBeGreaterThanOrEqual(6);
    expect(SYLLABLE_WORDS.filter((w) => w.syllables.length >= 2).length).toBeGreaterThanOrEqual(6);
  });
});
