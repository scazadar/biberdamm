import { describe, expect, it } from 'vitest';
import { attemptScore, itemWeight, mastery, recommendLevel, spacingFactor, weightedPick } from './learning';

describe('Lernmodell', () => {
  it('bewertet Versuche', () => {
    expect(attemptScore(0, 0)).toBe(1);
    expect(attemptScore(0, 2)).toBe(0.7);
    expect(attemptScore(1, 0)).toBe(0.4);
    expect(attemptScore(4, 0)).toBe(0);
  });

  it('bestimmt den Status', () => {
    expect(mastery([1, 1, 1, 1]).status).toBe('offen');
    expect(mastery(Array(5).fill(0.4)).status).toBe('hilfe');
    expect(mastery(Array(5).fill(0.5)).status).toBe('uebt');
    expect(mastery(Array(5).fill(0.8)).status).toBe('sicher');
  });

  it('betrachtet nur die letzten 15 Versuche', () => {
    expect(mastery([...Array(15).fill(1), ...Array(30).fill(0)]).value).toBe(1);
  });

  it('schlägt Stufen vor', () => {
    expect(recommendLevel([], 3)).toBe(1);
    expect(recommendLevel([{ level: 1, score: 0.9 }, { level: 1, score: 0.9 }], 3)).toBe(2);
    expect(recommendLevel([{ level: 2, score: 0.9 }, { level: 1, score: 0.9 }], 3)).toBe(2);
    expect(recommendLevel([{ level: 2, score: 0.3 }], 3)).toBe(1);
    expect(recommendLevel([{ level: 1, score: 0.1 }], 3)).toBe(1);
    expect(recommendLevel([{ level: 3, score: 1 }, { level: 3, score: 1 }], 3)).toBe(3);
  });

  it('gewichtet unsichere Inhalte stärker', () => {
    expect(itemWeight(undefined)).toBe(2);
    expect(itemWeight([1, 1])).toBe(1);
    expect(itemWeight([0, 0])).toBe(4);
  });

  it('verteilt das Üben über die Zeit', () => {
    // Sicher: gerade geübt tritt zurück, nach 7 Tagen normal, danach bevorzugt bis Faktor 2.
    expect(spacingFactor(1, 0)).toBe(0.25);
    expect(spacingFactor(1, 7)).toBe(1);
    expect(spacingFactor(1, 100)).toBe(2);
    // Übt noch: kürzerer Abstand.
    expect(spacingFactor(0.6, 2)).toBe(1);
    // Unsicher: nie gedämpft. Falsche Geräteuhr: wie gerade geübt.
    expect(spacingFactor(0.2, 0)).toBe(1);
    expect(spacingFactor(1, -3)).toBe(0.25);
    expect(itemWeight([1, 1], 0)).toBe(0.25);
    expect(itemWeight([0, 0], 0)).toBe(4);
    expect(itemWeight(undefined, 0)).toBe(2);
  });

  it('wiederholt nicht direkt', () => {
    for (let i = 0; i < 100; i++) expect(weightedPick(['a', 'b'], () => 1, 'a')).toBe('b');
    expect(weightedPick(['a'], () => 1, 'a')).toBe('a');
  });

  it('folgt den Gewichten', () => {
    expect(weightedPick(['a', 'b'], (x) => (x === 'a' ? 1 : 3), undefined, () => 0.1)).toBe('a');
    expect(weightedPick(['a', 'b'], (x) => (x === 'a' ? 1 : 3), undefined, () => 0.9)).toBe('b');
  });
});
