<script lang="ts">
  import { shuffle } from '#lib/content/data';
  import { useGame, type QuizQuestion } from '../context.svelte';

  const ctx = useGame();
  const questions = ctx.quiz ?? [];
  let index = 0;
  let question = $state<QuizQuestion>(questions[0]);
  let answers = $state<{ text: string; right: boolean }[]>([]);
  let wrong = $state('');
  let busy = $state(false);
  let tries = 0;

  function show() {
    question = questions[index];
    answers = shuffle(question.answers.map((text, i) => ({ text, right: i === question.correct })));
    wrong = '';
    tries = 0;
    busy = false;
    ctx.tell(question.prompt);
  }

  function answer(a: { text: string; right: boolean }) {
    if (busy || ctx.finished) return;
    if (a.right) {
      busy = true;
      index++;
      ctx.complete({ item: question.prompt.slice(0, 60), wrongTries: tries, hints: 0 }, show, {
        message: `Richtig! ${question.explanation}`.trim()
      });
    } else {
      tries++;
      wrong = a.text;
      ctx.sound.error();
      ctx.tell(`${a.text} stimmt nicht. Versuch es nochmal!`);
      setTimeout(() => (wrong = ''), 400);
    }
  }

  function onKey(e: KeyboardEvent) {
    const n = Number(e.key);
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || !Number.isInteger(n) || n < 1 || n > answers.length) return;
    answer(answers[n - 1]);
  }

  show();
</script>

<svelte:window onkeydown={onKey} />

{#if question.emoji}<div class="hero" aria-hidden="true">{question.emoji}</div>{/if}
<div class="choices">
  {#each answers as a, i (a.text)}
    <button
      type="button"
      class="choice text"
      class:wrong={wrong === a.text}
      class:right={busy && a.right}
      data-right={a.right}
      onclick={() => answer(a)}
    >{a.text}<span class="keyhint">{i + 1}</span></button>
  {/each}
</div>
