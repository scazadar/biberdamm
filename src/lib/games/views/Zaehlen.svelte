<script lang="ts">
  import { NUMBER_WORDS, pick, range } from '#lib/content/data';
  import { useGame } from '../context.svelte';

  const THINGS = [
    { emoji: '🍎', plural: 'Äpfel' },
    { emoji: '🐞', plural: 'Marienkäfer' },
    { emoji: '🚗', plural: 'Autos' },
    { emoji: '🌸', plural: 'Blumen' },
    { emoji: '🐟', plural: 'Fische' },
    { emoji: '⭐', plural: 'Sterne' },
    { emoji: '🎈', plural: 'Luftballons' },
    { emoji: '🍓', plural: 'Erdbeeren' },
    { emoji: '🐥', plural: 'Küken' },
    { emoji: '⚽', plural: 'Bälle' }
  ];

  const ctx = useGame();
  const max = [5, 10, 15][ctx.level - 1];
  const numbers = range(1, max);

  let target = $state(0);
  let thing = $state(THINGS[0]);
  let counted = $state<(number | null)[]>([]);
  let wrong = $state<number | null>(null);
  let right = $state(false);
  let tries = 0;

  function next() {
    target = ctx.choose(numbers, String);
    thing = pick(THINGS);
    counted = Array(target).fill(null);
    tries = 0;
    right = false;
    wrong = null;
    ctx.tell(`Wie viele ${thing.plural} siehst du?`);
  }

  function tap(i: number) {
    if (counted[i] !== null || right) return;
    const n = counted.filter((c) => c !== null).length + 1;
    counted[i] = n;
    ctx.sound.click(n * 2);
    ctx.tell(NUMBER_WORDS[n]);
  }

  function answer(n: number) {
    if (right || ctx.finished) return;
    if (n === target) {
      right = true;
      ctx.complete({ item: String(n), wrongTries: tries, hints: 0 }, next, {
        message: n === 1 ? 'Richtig! Nur eins!' : `Richtig! Es sind ${NUMBER_WORDS[n]} ${thing.plural}.`
      });
    } else {
      tries++;
      wrong = n;
      ctx.sound.error();
      ctx.tell(`${NUMBER_WORDS[n]}? Zähl nochmal nach! Tippe jedes Ding an.`);
      counted = counted.map(() => null);
      setTimeout(() => (wrong = null), 500);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || !/^[0-9]$/.test(e.key)) return;
    const n = e.key === '0' ? 10 : Number(e.key);
    if (n <= max) answer(n);
  }

  next();
</script>

<svelte:window onkeydown={onKey} />

<div class="items-field" data-testid="things" data-count={target}>
  {#each counted as c, i}
    <button type="button" class="count-thing" onclick={() => tap(i)} aria-label="Zählen">
      {thing.emoji}
      {#if c !== null}<span class="badge">{c}</span>{/if}
    </button>
  {/each}
</div>
<div class="choices">
  {#each numbers as n}
    <button type="button" class="choice" class:wrong={wrong === n} class:right={right && n === target} onclick={() => answer(n)}>{n}</button>
  {/each}
</div>
