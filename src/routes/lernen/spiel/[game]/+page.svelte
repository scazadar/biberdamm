<script lang="ts">
  import type { Component } from 'svelte';
  import { GAME_BY_ID } from '#lib/games/catalog';
  import { VIEWS } from '#lib/games/views';
  import GameShell from '#lib/games/GameShell.svelte';

  let { data } = $props();
  let view = $state<Component | null>(null);
  let run = $state(0);
  const game = $derived(GAME_BY_ID.get(data.gameId)!);
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const backHref = $derived(data.assignmentId || !game.world ? '/lernen' : `/lernen/welt/${game.world}`);

  $effect(() => {
    void VIEWS[data.gameId]().then((m) => (view = m.default));
  });
</script>

{#if data.guest && game.levels.length > 1}
  <nav class="level-pick" aria-label="Stufe wählen">
    <span>Stufe:</span>
    {#each game.levels as label, i (i)}
      <a class="btn" href="?stufe={i + 1}" title={label} aria-current={data.level === i + 1 ? 'page' : undefined}>{i + 1}</a>
    {/each}
  </nav>
{/if}
{#if view}
  {#key `${run}-${data.level}`}
    <GameShell
      {game}
      {view}
      level={data.level}
      calm={data.settings.calm || reduced}
      history={data.history}
      quiz={data.quiz}
      studentId={data.student.id}
      assignmentId={data.assignmentId}
      {backHref}
      onAgain={() => run++}
    />
  {/key}
{/if}
