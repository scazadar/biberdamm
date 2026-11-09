<script lang="ts">
  import { pick } from '#lib/content/data';
  import { useGame } from '../context.svelte';

  interface Task {
    a: number;
    b: number;
    op: '+' | '-';
  }

  const ctx = useGame();
  const max = ctx.level === 3 ? 20 : 10;
  const tasks: Task[] = [];
  for (let a = 0; a <= max; a++) {
    for (let b = 1; b <= max; b++) {
      if (a >= 1 && a + b <= max) tasks.push({ a, b, op: '+' });
      if (ctx.level > 1 && b <= a) tasks.push({ a, b, op: '-' });
    }
  }
  const key = (t: Task) => `${t.a}${t.op}${t.b}`;
  const result = (t: Task) => (t.op === '+' ? t.a + t.b : t.a - t.b);
  const word = (t: Task) => (t.op === '+' ? 'plus' : 'minus');
  const PICS = ['🍎', '🍓', '🐟', '⭐', '🐥'];

  let task = $state<Task>(tasks[0]);
  let input = $state('');
  let picture = $state(PICS[0]);
  let busy = $state(false);
  let bad = $state(false);
  let tries = 0;

  function next() {
    task = ctx.choose(tasks, key);
    picture = pick(PICS);
    input = '';
    tries = 0;
    busy = false;
    ctx.tell(`Wie viel ist ${task.a} ${word(task)} ${task.b}?`);
  }

  function digit(d: string) {
    if (busy || input.length >= 2) return;
    input = input === '0' ? d : input + d;
  }

  const erase = () => {
    if (!busy) input = input.slice(0, -1);
  };

  function submit() {
    if (busy || input === '' || ctx.finished) return;
    if (Number(input) === result(task)) {
      busy = true;
      ctx.complete({ item: key(task), wrongTries: tries, hints: 0 }, next, {
        message: `Richtig! ${task.a} ${word(task)} ${task.b} ist ${result(task)}.`
      });
    } else {
      tries++;
      bad = true;
      ctx.sound.error();
      ctx.tell('Das stimmt noch nicht. Rechne nochmal!');
      input = '';
      setTimeout(() => (bad = false), 400);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (/^[0-9]$/.test(e.key)) digit(e.key);
    else if (e.key === 'Backspace') erase();
    else if (e.key === 'Enter' && !ctx.finished) {
      e.preventDefault(); // Sonst löst Enter zusätzlich die fokussierte Zifferntaste aus.
      submit();
    }
  }

  next();
</script>

<svelte:window onkeydown={onKey} />

<div class="equation" data-testid="equation" data-result={result(task)}>{task.a} {task.op === '+' ? '+' : '−'} {task.b} =</div>
{#if ctx.level === 1}
  <div aria-hidden="true" style="font-size:2rem;text-align:center">
    {picture.repeat(task.a)} <strong>+</strong> {picture.repeat(task.b)}
  </div>
{/if}
<div class="display" class:shake={bad} aria-live="polite" data-testid="display">{input || ' '}</div>
<div class="pad">
  {#each ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as d}
    <button type="button" onclick={() => digit(d)}>{d}</button>
  {/each}
  <button type="button" onclick={erase} aria-label="Löschen">⌫</button>
  <button type="button" onclick={() => digit('0')}>0</button>
  <button type="button" class="primary" onclick={submit} aria-label="Fertig">✓</button>
</div>
