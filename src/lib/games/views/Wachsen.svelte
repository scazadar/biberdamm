<script lang="ts">
  import { shuffle } from '#lib/content/data';
  import { CYCLES, type Cycle, type Step } from '#lib/content/nature';
  import { draggable } from '#lib/client/drag';
  import { useGame } from '../context.svelte';

  const ctx = useGame();
  const pool = ctx.level === 3 ? CYCLES : CYCLES.filter((c) => c.steps.length === ctx.level + 2);

  let cycle = $state<Cycle>(pool[0]);
  let placed = $state(0);
  let cards = $state<Step[]>([]);
  let wrong = $state('');
  let tries = 0;

  function next() {
    cycle = ctx.choose(pool, (c) => c.question);
    placed = 0;
    tries = 0;
    wrong = '';
    let deck = shuffle(cycle.steps);
    while (deck.every((s, i) => s === cycle.steps[i])) deck = shuffle(cycle.steps);
    cards = deck;
    ctx.tell(cycle.question);
  }

  function place(step: Step) {
    if (placed >= cycle.steps.length || ctx.finished) return;
    if (step.label === cycle.steps[placed].label) {
      placed++;
      cards = cards.filter((c) => c.label !== step.label);
      ctx.sound.click(placed * 3);
      if (placed >= cycle.steps.length) {
        ctx.complete({ item: cycle.question, wrongTries: tries, hints: 0 }, next, { message: cycle.explain });
      }
    } else {
      tries++;
      wrong = step.label;
      ctx.sound.error();
      ctx.tell(`Was kommt vor ${step.label}?`);
      setTimeout(() => (wrong = ''), 400);
    }
  }

  const showLabels = ctx.level < 3;
  next();
</script>

<div class="slots" data-zone="slots">
  {#each cycle.steps as s, i}
    <div class="slot">
      {#if i < placed}<span class="e">{s.emoji}</span>{#if showLabels}{s.label}{/if}{:else}{i + 1}{/if}
    </div>
  {/each}
</div>
<div class="pool">
  {#each cards as c (c.label)}
    <button
      type="button"
      class="card-step"
      class:shake={wrong === c.label}
      aria-label={c.label}
      data-step={c.label}
      use:draggable={{ onTap: () => place(c), onDrop: (z) => z === 'slots' && place(c) }}
    >
      <span class="e" aria-hidden="true">{c.emoji}</span>
      {#if showLabels}{c.label}{/if}
    </button>
  {/each}
</div>
