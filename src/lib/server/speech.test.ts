import { mkdtempSync, readdirSync, rmSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { purgeSpeechCache, synthesize } from './speech';

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
