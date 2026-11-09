<script lang="ts">
  import { say } from '#lib/client/audio';
  import { shuffle } from '#lib/content/data';
  import { READING_TEXTS, type ReadingText } from '#lib/content/reading';
  import { useGame } from '../context.svelte';

  interface Answer {
    text: string;
    right: boolean;
  }

  const ctx = useGame();
  const pool = READING_TEXTS.filter((t) => t.level === ctx.level);

  let current = $state<ReadingText>(pool[0]);
  let asking = $state(false);
  let answers = $state<Answer[]>([]);
  let helped = $state<number[]>([]);
  let wrong = $state('');
  let busy = $state(false);
  let tries = 0;

  const words = $derived(current.text.split(' '));

  function next() {
    current = ctx.choose(pool, (t) => t.id);
    answers = shuffle(current.answers.map((text, i) => ({ text, right: i === 0 })));
    asking = false;
    helped = [];
    wrong = '';
    tries = 0;
    busy = false;
    // Der Text selbst wird nicht vorgelesen: Das Kind soll ihn selbst erlesen.
    ctx.tell('Lies den Text laut vor. Tippe auf ein Wort, wenn du Hilfe brauchst.');
  }

  function help(i: number) {
    say(words[i].replace(/[.,!?]/g, ''));
    if (!helped.includes(i)) helped.push(i);
  }

  function ask() {
    asking = true;
    ctx.tell(current.question);
  }

  function answer(a: Answer) {
    if (busy || ctx.finished) return;
    if (a.right) {
      busy = true;
      ctx.complete({ item: current.id, wrongTries: tries, hints: helped.length ? 1 : 0 }, next, { message: 'Richtig! Gut gelesen.' });
    } else {
      tries++;
      wrong = a.text;
      ctx.sound.error();
      ctx.tell('Das stimmt noch nicht. Lies noch einmal nach!');
      setTimeout(() => (wrong = ''), 400);
    }
  }

  next();
</script>

<p class="reading" data-testid="reading">
  {#each words as w, i (i)}
    <button type="button" class:helped={helped.includes(i)} onclick={() => help(i)}>{w}</button>{' '}
  {/each}
</p>

{#if asking}
  <p class="reading-question">{current.question}</p>
  <div class="choices">
    {#each answers as a (a.text)}
      <button type="button" class="choice text" class:wrong={wrong === a.text} class:right={busy && a.right} data-right={a.right} onclick={() => answer(a)}>{a.text}</button>
    {/each}
  </div>
{:else}
  <button type="button" class="choice text" onclick={ask}>Fertig gelesen</button>
{/if}
