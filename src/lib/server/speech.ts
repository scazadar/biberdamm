/**
 * Neuronale Sprachausgabe über einen Piper-Dienst im eigenen Netz (D-05).
 * Jeder Satz wird einmal erzeugt und danach aus dem Zwischenspeicher geliefert.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export const MAX_SPEECH_TEXT = 300;
const MAX_CACHE_FILES = 20_000;
const MAX_PARALLEL = 3;
const TIMEOUT = 10_000;
/** Etwas langsamer als die Standardgeschwindigkeit, weil die Hörer Kinder sind. */
const LENGTH_SCALE = 1.1;

export interface SpeechOptions {
  url: string;
  dir: string;
  fetcher?: typeof fetch;
}

const inFlight = new Map<string, Promise<Uint8Array | null>>();
const waiting: (() => void)[] = [];
let running = 0;
let cacheFiles: number | undefined;

async function slot<T>(fn: () => Promise<T>): Promise<T> {
  if (running >= MAX_PARALLEL) await new Promise<void>((r) => waiting.push(r));
  running++;
  try {
    return await fn();
  } finally {
    running--;
    waiting.shift()?.();
  }
}

const isWav = (b: Uint8Array) => b.length > 44 && String.fromCharCode(...b.subarray(0, 4)) === 'RIFF';

function store(dir: string, file: string, audio: Uint8Array) {
  mkdirSync(dir, { recursive: true });
  cacheFiles ??= readdirSync(dir).length;
  if (cacheFiles >= MAX_CACHE_FILES) return;
  // Erst vollständig schreiben, damit nie eine halbe Datei ausgeliefert wird.
  const temp = `${file}.${process.pid}.tmp`;
  writeFileSync(temp, audio);
  renameSync(temp, file);
  cacheFiles++;
}

async function generate(text: string, file: string, o: SpeechOptions): Promise<Uint8Array | null> {
  const res = await (o.fetcher ?? fetch)(`${o.url.replace(/\/$/, '')}/synthesize`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, length_scale: LENGTH_SCALE }),
    signal: AbortSignal.timeout(TIMEOUT)
  });
  if (!res.ok) return null;
  const audio = new Uint8Array(await res.arrayBuffer());
  if (!isWav(audio)) return null;
  store(o.dir, file, audio);
  return audio;
}

/** Liefert WAV-Daten oder `null`, wenn der Dienst nicht verfügbar ist. */
export async function synthesize(text: string, o: SpeechOptions): Promise<Uint8Array | null> {
  const key = createHash('sha256').update(`${LENGTH_SCALE}\n${text}`).digest('hex');
  const file = join(o.dir, `${key}.wav`);
  try {
    return readFileSync(file);
  } catch {
    /* noch nicht erzeugt */
  }
  let job = inFlight.get(key);
  if (!job) {
    job = slot(() => generate(text, file, o))
      .catch(() => null)
      .finally(() => inFlight.delete(key));
    inFlight.set(key, job);
  }
  return job;
}

/** Entfernt alte Dateien; eigene Quiztexte sollen nicht unbegrenzt liegen bleiben. */
export function purgeSpeechCache(dir: string, maxAgeDays = 30, now = Date.now()) {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of names) {
    const file = join(dir, name);
    if (now - statSync(file).mtimeMs > maxAgeDays * 86400_000) rmSync(file, { force: true });
  }
  cacheFiles = undefined;
}

export const speechUrl = () => process.env.BIBERDAMM_TTS_URL || null;
export const speechCacheDir = () => join(dirname(resolve(process.env.BIBERDAMM_DB ?? 'data/biberdamm.db')), 'sprache');
