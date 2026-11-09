/**
 * Warteschlange für Spielergebnisse (N-03). Einträge gehören einem Kind und werden nur
 * in dessen Sitzung übertragen, damit auf geteilten Geräten nichts falsch zugeordnet wird.
 */

const KEY = 'biberdamm.ergebnisse';
const MAX_AGE = 7 * 86400_000;

export interface QueuedRound {
  studentId: number;
  savedAt: number;
  round: {
    id: string;
    gameId: string;
    level: number;
    assignmentId: number | null;
    playedAt: number;
    attempts: { item: string; wrongTries: number; hints: number }[];
  };
}

export interface QueueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type Sender = (round: QueuedRound['round']) => Promise<number>;

function read(storage: QueueStorage, now: number): QueuedRound[] {
  try {
    const items = JSON.parse(storage.getItem(KEY) ?? '[]') as QueuedRound[];
    return items.filter((i) => now - i.savedAt < MAX_AGE);
  } catch {
    return [];
  }
}

export function enqueue(storage: QueueStorage, entry: QueuedRound, now = Date.now()) {
  storage.setItem(KEY, JSON.stringify([...read(storage, now), entry]));
}

/**
 * Überträgt alle Runden dieses Kindes. Bei Netzfehlern, 401 oder 5xx bleibt die Runde liegen;
 * andere Antworten sind endgültig (gespeichert oder dauerhaft ungültig).
 * Liefert die Zahl noch offener Runden des Kindes.
 */
export async function flush(storage: QueueStorage, studentId: number, send: Sender, now = Date.now()): Promise<number> {
  const mine = read(storage, now).filter((i) => i.studentId === studentId);
  let pending = 0;
  for (const entry of mine) {
    let status = 0;
    try {
      status = await send(entry.round);
    } catch {
      /* offline */
    }
    if (status === 0 || status === 401 || status >= 500) {
      pending++;
      continue;
    }
    // Erneut lesen: Während des Sendens kann eine neue Runde hinzugekommen sein.
    storage.setItem(KEY, JSON.stringify(read(storage, now).filter((i) => i.round.id !== entry.round.id)));
  }
  return pending;
}

export const sendRound: Sender = async (round) => {
  const res = await fetch('/api/ergebnisse', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(round)
  });
  return res.status;
};

let inFlight = false;

/** Stößt die Übertragung an; parallele Läufe werden zusammengefasst. `true`, wenn alles übertragen ist. */
export async function syncResults(studentId: number): Promise<boolean> {
  if (inFlight) return false;
  inFlight = true;
  try {
    return (await flush(localStorage, studentId, sendRound)) === 0;
  } finally {
    inFlight = false;
  }
}
