<script lang="ts">
  import { range, shuffle } from '#lib/content/data';
  import { useGame } from '../context.svelte';
  import NumberPad from '../NumberPad.svelte';

  const FLOORS = 3;
  const ctx = useGame();
  const max = [5, 10, 20][ctx.level - 1];
  const roofs = range([2, 3, 11][ctx.level - 1], max);

  let roof = $state(roofs[0]);
  let lefts = $state<number[]>([]);
  let active = $state(0);
  let wrong = $state<number | null>(null);
  let help = $state(false);
  let done = $state(false);
  let tries = 0;

  const left = $derived(lefts[active] ?? 0);
  const missing = $derived(roof - left);

  function ask() {
    help = false;
    wrong = null;
    ctx.tell(`Wie viel fehlt von ${lefts[active]} bis ${roof}?`);
  }

  function next() {
    roof = ctx.choose(roofs, String);
    lefts = shuffle(range(1, roof - 1)).slice(0, FLOORS);
    active = 0;
    tries = 0;
    done = false;
    ask();
  }

  function answer(n: number) {
    if (done || ctx.finished) return;
    if (n === missing) {
      if (active + 1 < lefts.length) {
        ctx.sound.click(active * 2);
        active++;
        ask();
      } else {
        done = true;
        ctx.complete({ item: String(roof), wrongTries: tries, hints: 0 }, next, { message: `Richtig! Das Haus der ${roof} ist voll.` });
      }
    } else {
      tries++;
      wrong = n;
      help = true;
      ctx.sound.error();
      ctx.tell(`${left} und ${n} sind ${left + n}. Wir brauchen ${roof}.`);
      setTimeout(() => (wrong = null), 500);
    }
  }

  next();
</script>

<div class="house" data-testid="house" data-missing={missing}>
  <div class="roof">{roof}</div>
  {#each lefts as l, i (l)}
    <div class="floor" class:active={i === active}>
      <span>{l}</span>
      <span>{i < active || done ? roof - l : i === active ? '?' : ''}</span>
    </div>
  {/each}
</div>
{#if help}
  <div class="house-dots" aria-hidden="true">
    {#each range(1, roof) as d (d)}<i class="dot" class:second={d > left}></i>{/each}
  </div>
{/if}
<NumberPad {max} onanswer={answer} disabled={done} {wrong} />
