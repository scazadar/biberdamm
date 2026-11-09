import { describe, expect, it, vi } from 'vitest';
import { enqueue, flush, type QueuedRound, type QueueStorage } from './queue';

function memory(): QueueStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

const entry = (id: string, studentId: number, savedAt = 1000): QueuedRound => ({
  studentId,
  savedAt,
  round: { id, gameId: 'zaehlen', level: 1, assignmentId: null, playedAt: savedAt, attempts: [{ item: '1', wrongTries: 0, hints: 0 }] }
});

describe('Ergebnis-Warteschlange', () => {
  it('sendet nur Runden des angemeldeten Kindes', async () => {
    const s = memory();
    enqueue(s, entry('a', 1), 1000);
    enqueue(s, entry('b', 2), 1000);
    const send = vi.fn(async () => 200);
    expect(await flush(s, 1, send, 2000)).toBe(0);
    expect(send).toHaveBeenCalledTimes(1);
    expect(await flush(s, 2, send, 2000)).toBe(0);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('behält Runden bei Netzfehlern und überträgt sie später genau einmal', async () => {
    const s = memory();
    enqueue(s, entry('a', 1), 1000);
    expect(await flush(s, 1, async () => { throw new Error('offline'); }, 2000)).toBe(1);
    const send = vi.fn(async () => 200);
    await flush(s, 1, send, 3000);
    await flush(s, 1, send, 4000);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('behält Runden bei abgelaufener Sitzung, verwirft aber dauerhaft ungültige', async () => {
    const s = memory();
    enqueue(s, entry('a', 1), 1000);
    expect(await flush(s, 1, async () => 401, 2000)).toBe(1);
    expect(await flush(s, 1, async () => 400, 2000)).toBe(0);
    expect(await flush(s, 1, async () => 200, 2000)).toBe(0);
  });

  it('verwirft Runden nach sieben Tagen', async () => {
    const s = memory();
    enqueue(s, entry('a', 1, 0), 0);
    const send = vi.fn(async () => 200);
    await flush(s, 1, send, 8 * 86400_000);
    expect(send).not.toHaveBeenCalled();
  });
});
