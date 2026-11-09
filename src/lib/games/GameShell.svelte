<script lang="ts">
  import { onDestroy, untrack, type Component } from 'svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import { sound } from '#lib/client/audio';
  import { enqueue, syncResults } from '#lib/client/queue';
  import type { ItemHistory } from '#lib/learning';
  import type { GameDef } from './catalog';
  import { GameContext, provideGame, type Attempt, type QuizQuestion } from './context.svelte';

  interface Props {
    game: GameDef;
    view: Component;
    level: number;
    calm: boolean;
    history: Record<string, ItemHistory>;
    quiz: QuizQuestion[] | null;
    studentId: number;
    assignmentId: number | null;
    onAgain: () => void;
    backHref: string;
  }

  const props: Props = $props();
  const View = untrack(() => props.view);

  let earned = $state(0);

  function finish(attempts: Attempt[]) {
    earned = attempts.length;
    sound.fanfare();
    enqueue(localStorage, {
      studentId: props.studentId,
      savedAt: Date.now(),
      round: {
        id: crypto.randomUUID(),
        gameId: props.game.id,
        level: props.level,
        assignmentId: props.assignmentId,
        playedAt: Date.now(),
        attempts
      }
    });
    // Ohne Verbindung würde das Neuladen auf der Fehlerseite enden.
    void syncResults(props.studentId).then((sent) => {
      if (sent) void invalidateAll();
    });
  }

  const ctx = untrack(
    () =>
      new GameContext({
        game: props.game,
        level: props.level,
        calm: props.calm,
        history: props.history,
        quiz: props.quiz,
        onFinish: finish
      })
  );
  provideGame(ctx);
  onDestroy(() => ctx.dispose());

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') void goto(props.backHref);
    else if (e.key === 'Enter' && ctx.finished) props.onAgain();
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="shell" class:calm-mode={props.calm}>
  <header class="shell-top">
    <a class="btn" href={props.backHref} aria-label="Zurück">←</a>
    <h1>{props.game.icon} {props.game.title}</h1>
    <div
      class="progress"
      role="progressbar"
      aria-label="Fortschritt der Runde"
      aria-valuemin="0"
      aria-valuemax={ctx.total}
      aria-valuenow={ctx.solved}
    >
      <div style:width="{(ctx.solved / ctx.total) * 100}%"></div>
    </div>
    <span class="stars" aria-label="{ctx.solved} Sterne in dieser Runde">⭐ {ctx.solved}</span>
  </header>

  <div class="bruno">
    <button type="button" onclick={() => ctx.repeat()} aria-label="Nochmal vorlesen" title="Nochmal hören"><img class="logo-bruno" src="/logo-head.png" alt="" width="64" height="64" /></button>
    <div class="bubble" aria-live="polite" data-testid="bubble">{ctx.bubble}</div>
  </div>

  <main class="stage">
    <View />
  </main>

  {#if ctx.finished}
    <div class="overlay" role="dialog" aria-modal="true" aria-label="Runde beendet">
      <div class="panel">
        <div class="big">🎉</div>
        <h2>Geschafft!</h2>
        <p data-testid="earned">Du hast {earned} ⭐ gesammelt.</p>
        <div class="row" style="justify-content:center">
          <button class="primary" type="button" onclick={props.onAgain}>🔁 Nochmal</button>
          <a class="btn" href={props.backHref}>🏠 Zurück</a>
        </div>
      </div>
    </div>
  {/if}
</div>
