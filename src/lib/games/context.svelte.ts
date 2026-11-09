import { getContext, setContext } from 'svelte';
import { afterSpeech, say, sound, stopSpeech } from '#lib/client/audio';
import { itemWeight, weightedPick, type ItemHistory } from '#lib/learning';
import type { GameDef } from './catalog';

export interface QuizQuestion {
  id: number;
  prompt: string;
  emoji: string;
  answers: string[];
  correct: number;
  explanation: string;
}

export interface Attempt {
  item: string;
  wrongTries: number;
  hints: number;
}

export interface GameOptions {
  game: GameDef;
  level: number;
  calm: boolean;
  history: Record<string, ItemHistory>;
  quiz: QuizQuestion[] | null;
  onFinish: (attempts: Attempt[]) => void;
}

/** Laufzeit einer Spielrunde: die einzige Schnittstelle zwischen Spiel und Rahmen. */
export class GameContext {
  readonly game: GameDef;
  readonly level: number;
  readonly calm: boolean;
  readonly quiz: QuizQuestion[] | null;
  readonly total: number;
  readonly sound = sound;

  bubble = $state('');
  solved = $state(0);
  finished = $state(false);

  private readonly attempts: Attempt[] = [];
  private readonly used = new Set<string>();
  private readonly history: Record<string, ItemHistory>;
  private readonly onFinish: (a: Attempt[]) => void;
  private last: string | undefined;
  private cancels = new Set<() => void>();

  constructor(o: GameOptions) {
    this.game = o.game;
    this.level = o.level;
    this.calm = o.calm;
    this.quiz = o.quiz;
    this.history = o.history;
    this.onFinish = o.onFinish;
    this.total = o.quiz ? Math.min(o.quiz.length, o.game.tasks[0]) : o.game.tasks[o.level - 1];
  }

  /** Wählt gewichtet den nächsten Inhalt; innerhalb einer Runde möglichst ohne Wiederholung. */
  choose<T>(pool: readonly T[], keyOf: (x: T) => string): T {
    const fresh = pool.filter((x) => !this.used.has(keyOf(x)));
    const source = fresh.length ? fresh : pool.filter((x) => keyOf(x) !== this.last);
    const pickFrom = source.length ? source : pool;
    const now = Date.now();
    const chosen = weightedPick(pickFrom, (x) => {
      const seen = this.history[keyOf(x)];
      return seen ? itemWeight(seen.scores, (now - seen.lastAt) / 86400_000) : itemWeight(undefined);
    });
    this.last = keyOf(chosen);
    this.used.add(this.last);
    return chosen;
  }

  /** Bruno sagt etwas: als Text und, falls verfügbar, als Sprache. */
  tell(text: string) {
    this.bubble = text;
    say(text);
  }

  /** Wiederholt die aktuelle Ansage. */
  repeat() {
    say(this.bubble);
  }

  /** Spielt `fn` erst, wenn die Ansage beendet ist. */
  afterSpeech(fn: () => void, minDelay?: number) {
    const cancel = afterSpeech(() => {
      this.cancels.delete(cancel);
      fn();
    }, minDelay);
    this.cancels.add(cancel);
  }

  /**
   * Meldet eine gelöste Aufgabe. Danach läuft `next`, oder die Runde endet.
   * `instant` überspringt das Warten auf die Sprachausgabe (z. B. Luftballons).
   */
  complete(attempt: Attempt, next: () => void, opts: { message?: string; instant?: boolean } = {}) {
    if (this.finished || this.attempts.length >= this.total) return;
    this.attempts.push(attempt);
    this.solved = this.attempts.length;
    sound.success();
    if (opts.message) this.tell(opts.message);
    const go = () => {
      if (this.attempts.length >= this.total) this.finish();
      else next();
    };
    if (opts.instant && this.attempts.length < this.total) go();
    else this.afterSpeech(go);
  }

  dispose() {
    this.cancels.forEach((c) => c());
    this.cancels.clear();
    stopSpeech();
  }

  private finish() {
    this.finished = true;
    this.onFinish(this.attempts);
  }
}

const KEY = Symbol('game');
export const provideGame = (ctx: GameContext) => setContext(KEY, ctx);
export const useGame = () => getContext<GameContext>(KEY);
