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

{#if view}
  {#key run}
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
