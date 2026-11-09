<script lang="ts">
  import { range } from '#lib/content/data';
  import { useGame } from '../context.svelte';
  import NumberPad from '../NumberPad.svelte';

  interface Task {
    a: number;
    b: number;
  }

  const ctx = useGame();
  const guided = ctx.level < 3;
  const pool: Task[] = range(2, 9).flatMap((a) => range(2, 9).filter((b) => a + b > 10).map((b) => ({ a, b })));

  let task = $state.raw<Task>(pool[0]);
  let step = $state(0);
  let help = $state(false);
  let solved = $state(false);
  let wrong = $state<number | null>(null);
  let tries = 0;

  const fill = $derived(10 - task.a);
  const rest = $derived(task.b - fill);
  const answers = $derived([fill, rest, task.a + task.b]);
  const dots = $derived(ctx.level === 1 || help);

  function ask() {
    const { a, b } = task;
    if (step === 0) ctx.tell(`${a} + ${b}. Wie viele fehlen von ${a} bis 10?`);
    else if (step === 1) ctx.tell(`Von der ${b} sind ${fill} verbraucht. Wie viele bleiben übrig?`);
    else ctx.tell(guided ? `Also 10 + ${rest}. Wie viel ist ${a} + ${b}?` : `Wie viel ist ${a} + ${b}?`);
  }

  function next() {
    task = ctx.choose(pool, (t) => `${t.a}+${t.b}`);
    step = guided ? 0 : 2;
    help = solved = false;
    wrong = null;
    tries = 0;
    ask();
  }

  function answer(n: number) {
    if (solved || ctx.finished) return;
    if (n === answers[step]) {
      if (step < 2) {
        ctx.sound.click(step * 3);
        step++;
        ask();
      } else {
        solved = true;
        ctx.complete({ item: `${task.a}+${task.b}`, wrongTries: tries, hints: 0 }, next, { message: `Richtig! ${task.a} + ${task.b} = ${task.a + task.b}.` });
      }
      return;
    }
    tries++;
    wrong = n;
    help = true;
    ctx.sound.error();
    const { a, b } = task;
    if (step === 0) ctx.tell(`${a} und ${n} sind ${a + n}. Wir wollen genau bis 10.`);
    else if (step === 1) ctx.tell(`Die ${b} teilen wir: ${fill} und noch ${rest}. Wie viele bleiben übrig?`);
    else ctx.tell(`${a} und ${fill} sind 10. Dazu kommen noch ${rest}. Wie viel ist das?`);
    setTimeout(() => (wrong = null), 500);
  }

  next();
</script>

<div class="symbol" data-testid="bridge" data-answer={answers[step]}>{task.a} + {task.b}</div>
{#if guided}
  <div class="bridge-steps" aria-hidden="true">
    <span class:active={step === 0}>{task.a} + {step > 0 ? fill : '?'} = 10</span>
    <span class:active={step === 1}>{step > 0 ? `${task.b} = ${fill} + ${step > 1 ? rest : '?'}` : ''}</span>
    <span class:active={step === 2}>{step > 1 ? `10 + ${rest} = ?` : ''}</span>
  </div>
{/if}
{#if dots}
  <div class="flash" aria-hidden="true">
    <div class="tenframe">
      {#each range(1, 10) as cell (cell)}
        <div>{#if cell <= task.a}<i class="dot"></i>{:else if step > 0 || help}<i class="dot second"></i>{/if}</div>
      {/each}
    </div>
    <div class="tenframe">
      {#each range(1, 10) as cell (cell)}
        <div>{#if cell <= rest && (step > 1 || help)}<i class="dot second"></i>{/if}</div>
      {/each}
    </div>
  </div>
{/if}
<NumberPad max={step < 2 ? 9 : 20} onanswer={answer} disabled={solved} {wrong} />
