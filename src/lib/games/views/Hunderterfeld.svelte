<script lang="ts">
  import { range } from '#lib/content/data';
  import { useGame } from '../context.svelte';

  const ctx = useGame();
  const numbers = range(1, 100);
  const labelled = (n: number) => ctx.level === 1 || (ctx.level === 2 && n % 10 === 0);
  // Stufe 1 übt das Finden gelesener Zahlen, ohne die leichtesten Einerzahlen.
  const targets = ctx.level === 1 ? range(11, 99) : range(2, 99).filter((n) => !labelled(n));

  let target = $state(targets[0]);
  let cursor = $state(0);
  let solved = $state(false);
  let wrong = $state<number | null>(null);
  let tries = 0;

  function next() {
    target = ctx.choose(targets, String);
    solved = false;
    wrong = null;
    tries = 0;
    ctx.tell(`Wo ist die ${target}?`);
  }

  function pick(n: number) {
    if (solved || ctx.finished) return;
    cursor = n - 1;
    if (n === target) {
      solved = true;
      ctx.complete({ item: String(target), wrongTries: tries, hints: 0 }, next, { message: `Richtig! Da ist die ${target}.` });
    } else {
      tries++;
      wrong = n;
      ctx.sound.error();
      const start = Math.floor((target - 1) / 10) * 10 + 1;
      ctx.tell(`Das ist die ${n}. Die ${target} steht in der Reihe von ${start} bis ${start + 9}, auf Platz ${target - start + 1}.`);
      setTimeout(() => (wrong = null), 600);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -10, ArrowDown: 10 };
    if (e.key in moves) {
      e.preventDefault();
      cursor = Math.min(99, Math.max(0, cursor + moves[e.key]));
      document.querySelector<HTMLElement>(`[data-n="${cursor + 1}"]`)?.focus();
    } else if (e.key === 'Enter' && !ctx.finished) {
      e.preventDefault(); // Sonst löst Enter zusätzlich die fokussierte Schaltfläche aus.
      pick(cursor + 1);
    }
  }

  next();
</script>

<svelte:window onkeydown={onKey} />

<div class="symbol" aria-hidden="true">{target}</div>
<div class="hundred-wrap">
  <div class="hundred" data-testid="hundred" data-target={target}>
    {#each numbers as n (n)}
      <button
        type="button"
        data-n={n}
        tabindex={cursor === n - 1 ? 0 : -1}
        class:cursor={cursor === n - 1}
        class:wrong={wrong === n}
        class:right={solved && n === target}
        aria-label={String(n)}
        onclick={() => pick(n)}>{labelled(n) || wrong === n || (solved && n === target) ? n : ''}</button>
    {/each}
  </div>
</div>
