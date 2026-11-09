<script lang="ts">
  import { onDestroy } from 'svelte';
  import { range } from '#lib/content/data';
  import { useGame } from '../context.svelte';
  import NumberPad from '../NumberPad.svelte';

  const DICE: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8] };
  const ctx = useGame();
  const max = [5, 10, 20][ctx.level - 1];
  const numbers = range([1, 2, 6][ctx.level - 1], max);
  const showFor = [2000, 1500, 1000][ctx.level - 1];

  let target = $state(numbers[0]);
  let visible = $state(false);
  let revealed = $state(false);
  let ready = $state(false);
  let solved = $state(false);
  let wrong = $state<number | null>(null);
  let tries = 0;
  let hints = 0;
  let hideTimer: ReturnType<typeof setTimeout>;

  const frames = $derived(ctx.level === 1 ? [] : ctx.level === 2 ? [target] : [Math.min(target, 10), Math.max(target - 10, 0)]);

  function show() {
    ready = true;
    visible = true;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => (visible = false), showFor);
  }

  function next() {
    target = ctx.choose(numbers, String);
    visible = revealed = ready = solved = false;
    wrong = null;
    tries = hints = 0;
    ctx.tell('Schau genau hin!');
    ctx.afterSpeech(show, 300);
  }

  function again() {
    if (visible || revealed || solved) return;
    hints++;
    show();
  }

  const explain = (n: number) => (n > 10 ? `Hier sind 10 und noch ${n - 10}, das sind ${n}.` : n > 5 ? `Hier sind 5 und noch ${n - 5}, das sind ${n}.` : `Das sind ${n}.`);

  function answer(n: number) {
    if (solved || !ready || ctx.finished) return;
    clearTimeout(hideTimer);
    if (n === target) {
      solved = true;
      visible = true;
      ctx.complete({ item: String(n), wrongTries: tries, hints }, next, { message: `Richtig! ${n}.` });
    } else {
      tries++;
      wrong = n;
      visible = revealed = true;
      ctx.sound.error();
      ctx.tell(`${explain(target)} Tippe die Zahl an.`);
      setTimeout(() => (wrong = null), 500);
    }
  }

  onDestroy(() => clearTimeout(hideTimer));
  next();
</script>

<div class="flash" data-testid="flash" data-count={target} data-visible={visible} role="img" aria-label={visible ? `${target} Punkte` : 'Die Punkte sind verdeckt'}>
  {#if ctx.level === 1}
    <div class="dice">
      {#each range(0, 8) as cell (cell)}<div>{#if visible && DICE[target].includes(cell)}<i class="dot"></i>{/if}</div>{/each}
    </div>
  {:else}
    {#each frames as filled, f (f)}
      <div class="tenframe">
        {#each range(1, 10) as cell (cell)}<div>{#if visible && cell <= filled}<i class="dot"></i>{/if}</div>{/each}
      </div>
    {/each}
  {/if}
</div>
<button type="button" class="btn" onclick={again} disabled={!ready || visible || revealed || solved}>👀 Noch mal zeigen</button>
<NumberPad {max} onanswer={answer} disabled={!ready || solved} {wrong} right={solved ? target : null} />
