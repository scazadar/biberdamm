/** Sprachausgabe (Server-Stimme, sonst lokale Gerätestimme, D-05) und synthetische Töne. */

const MAX_WAIT = 12_000;
const SERVER_TIMEOUT = 8_000;
const SERVER_RETRY = 60_000;
const MAX_CACHED = 200;
let voice: SpeechSynthesisVoice | null = null;
let speechEnabled = true;
let soundEnabled = true;
let serverSpeech = false;
let serverDownUntil = 0;
let ctx: AudioContext | undefined;
let source: AudioBufferSourceNode | null = null;
let serverRun = 0;
let serverBusy = false;
const buffers = new Map<string, Promise<AudioBuffer>>();
const active = new Set<SpeechSynthesisUtterance>();
const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function initAudio(opts: { speech: boolean; server: boolean }) {
  speechEnabled = opts.speech;
  serverSpeech = opts.server;
  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
  if (!supported) return;
  const choose = () => {
    const local = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('de') && v.localService);
    voice = local.find((v) => /natural|neural|premium|enhanced/i.test(v.name)) ?? local[0] ?? null;
  };
  choose();
  speechSynthesis.addEventListener('voiceschanged', choose);
}

function unlock() {
  if (voice) speechSynthesis.speak(new SpeechSynthesisUtterance(''));
  context();
}

export function stopSpeech() {
  serverRun++;
  serverBusy = false;
  try {
    source?.stop();
  } catch {
    /* schon beendet */
  }
  source = null;
  if (!supported) return;
  speechSynthesis.cancel();
  active.clear();
}

const sentences = (text: string) => (text.match(/[^.!?]+[.!?]*/g) ?? [text]).map((s) => s.trim()).filter(Boolean);

function speakOnDevice(text: string) {
  if (!supported || !voice) return;
  for (const sentence of sentences(text)) {
    const u = new SpeechSynthesisUtterance(sentence);
    u.lang = 'de-DE';
    u.voice = voice;
    u.rate = 0.9;
    u.pitch = 1.1;
    u.onend = u.onerror = () => active.delete(u);
    active.add(u); // Chrome beendet sonst nicht referenzierte Äußerungen mitten im Satz.
    speechSynthesis.speak(u);
  }
}

async function loadSentence(c: AudioContext, sentence: string): Promise<AudioBuffer> {
  const res = await fetch('/api/sprache', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: sentence }),
    signal: AbortSignal.timeout(SERVER_TIMEOUT)
  });
  if (!res.ok) throw new Error(`Sprachdienst: ${res.status}`);
  return c.decodeAudioData(await res.arrayBuffer());
}

function sentenceBuffer(c: AudioContext, sentence: string) {
  let job = buffers.get(sentence);
  if (!job) {
    job = loadSentence(c, sentence);
    job.catch(() => buffers.delete(sentence));
    buffers.set(sentence, job);
    if (buffers.size > MAX_CACHED) buffers.delete(buffers.keys().next().value!);
  }
  return job;
}

function play(c: AudioContext, buffer: AudioBuffer) {
  return new Promise<void>((done) => {
    const node = c.createBufferSource();
    node.buffer = buffer;
    node.connect(c.destination);
    node.onended = () => done();
    source = node;
    node.start();
  });
}

async function speakOnServer(c: AudioContext, text: string) {
  const run = ++serverRun;
  serverBusy = true;
  let parts: AudioBuffer[];
  try {
    parts = await Promise.all(sentences(text).map((s) => sentenceBuffer(c, s)));
  } catch {
    if (run !== serverRun) return;
    serverBusy = false;
    serverDownUntil = Date.now() + SERVER_RETRY;
    speakOnDevice(text);
    return;
  }
  for (const part of parts) {
    if (run !== serverRun) return;
    // Vor der ersten Berührung ist Ton gesperrt; dann bliebe die Wiedergabe sonst hängen.
    if (c.state !== 'running') break;
    await play(c, part);
  }
  if (run === serverRun) serverBusy = false;
}

export function say(text: string) {
  if (!speechEnabled) return;
  stopSpeech();
  const c = serverSpeech && Date.now() >= serverDownUntil ? context() : null;
  if (c) void speakOnServer(c, text);
  else speakOnDevice(text);
}

const speaking = () => speechEnabled && (serverBusy || (supported && !!voice && (speechSynthesis.speaking || speechSynthesis.pending)));

/** Ruft `fn` nach Ende der Ansage auf, frühestens nach `minDelay` ms. Liefert eine Abbruchfunktion. */
export function afterSpeech(fn: () => void, minDelay = 1200, pause = 400): () => void {
  const start = Date.now();
  let waited = false;
  let timer: ReturnType<typeof setTimeout>;
  const check = () => {
    if (speaking() && Date.now() - start < MAX_WAIT) {
      waited = true;
      timer = setTimeout(check, 100);
    } else {
      timer = setTimeout(fn, waited ? pause : 0);
    }
  };
  timer = setTimeout(check, minDelay);
  return () => clearTimeout(timer);
}

function context(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

const audio = () => (soundEnabled ? context() : null);

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.2) {
  const c = audio();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime + start;
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sound = {
  setEnabled: (v: boolean) => (soundEnabled = v),
  success: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.25, 'triangle')),
  fanfare: () => {
    [523, 659, 784].forEach((f, i) => tone(f, i * 0.14, 0.2, 'triangle'));
    tone(1047, 0.42, 0.6, 'triangle');
  },
  error: () => {
    tone(247, 0, 0.2, 'sine', 0.12);
    tone(196, 0.14, 0.3, 'sine', 0.12);
  },
  click: (step = 0) => tone(440 * Math.pow(2, step / 12), 0, 0.12, 'triangle', 0.15),
  pop: () => tone(700, 0, 0.1, 'square', 0.08)
};
