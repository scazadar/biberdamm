import { mkdtempSync, readdirSync, rmSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RateLimit, purgeSpeechCache, synthesize } from './speech';

const WAV = new Uint8Array(64);
WAV.set([0x52, 0x49, 0x46, 0x46]);

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'biberdamm-sprache-'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

function fake(respond: () => Response | Promise<Response> = () => new Response(WAV)) {
  const calls: string[] = [];
  const fetcher = (async (_url: unknown, init?: RequestInit) => {
    calls.push(JSON.parse(String(init?.body)).text);
    return respond();
  }) as typeof fetch;
  return { calls, options: { url: 'http://tts:5000/', dir, fetcher } };
}

describe('Sprachdienst', () => {
  it('erzeugt jeden Text nur einmal', async () => {
    const { calls, options } = fake();
    expect(await synthesize('Hallo.', options)).not.toBeNull();
    expect(await synthesize('Hallo.', options)).not.toBeNull();
    expect(calls).toEqual(['Hallo.']);
  });

  it('fasst gleichzeitige Anfragen zusammen', async () => {
    const { calls, options } = fake();
    await Promise.all([synthesize('Ein Satz.', options), synthesize('Ein Satz.', options)]);
    expect(calls).toHaveLength(1);
  });

  it('liefert null bei Ausfall und speichert nichts', async () => {
    const down = fake(() => Promise.reject(new Error('down')));
    expect(await synthesize('A.', down.options)).toBeNull();
    const error = fake(() => new Response('kaputt', { status: 500 }));
    expect(await synthesize('B.', error.options)).toBeNull();
    const notAudio = fake(() => new Response('<html>'.repeat(20)));
    expect(await synthesize('C.', notAudio.options)).toBeNull();
    expect(readdirSync(dir)).toEqual([]);
  });

  it('fragt das Kontingent nur bei Neuberechnungen', async () => {
    const { calls, options } = fake();
    let asked = 0;
    const allowNew = () => ++asked <= 1;
    expect(await synthesize('Eins.', { ...options, allowNew })).not.toBeNull();
    expect(await synthesize('Eins.', { ...options, allowNew })).toBeInstanceOf(Uint8Array);
    expect(await synthesize('Zwei.', { ...options, allowNew })).toBe('limited');
    expect(asked).toBe(2);
    expect(calls).toEqual(['Eins.']);
  });

  it('lehnt bei voller Warteschlange ab, statt zu stapeln', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const { options } = fake(async () => {
      await gate;
      return new Response(WAV);
    });
    const jobs = Array.from({ length: 33 }, (_, i) => synthesize(`Satz ${i}.`, options));
    expect(await synthesize('Einer zu viel.', options)).toBe('busy');
    release();
    expect((await Promise.all(jobs)).every((r) => r instanceof Uint8Array)).toBe(true);
  });

  it('begrenzt je Schlüssel und Minute', () => {
    const limit = new RateLimit(2);
    expect([limit.take('a', 0), limit.take('a', 1), limit.take('a', 2), limit.take('b', 3)]).toEqual([true, true, false, true]);
    expect(limit.take('a', 60_000)).toBe(true);
  });

  it('löscht nur alte Dateien', async () => {
    const { options } = fake();
    await synthesize('Alt.', options);
    const [old] = readdirSync(dir);
    utimesSync(join(dir, old), new Date(0), new Date(0));
    await synthesize('Neu.', options);
    purgeSpeechCache(dir);
    expect(readdirSync(dir)).toHaveLength(1);
    expect(readdirSync(dir)).not.toContain(old);
  });
});
