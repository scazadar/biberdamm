<script lang="ts">
  import { WORDS, WORD_LETTERS, shuffle } from '#lib/content/data';
  import { say } from '#lib/client/audio';
  import { draggable } from '#lib/client/drag';
  import { useGame } from '../context.svelte';

  const ctx = useGame();
  let letter = $state('A');
  let options = $state<string[]>([]);
  let placed = $state(false);
  let wrong = $state('');
  let tries = 0;
  const word = $derived(WORDS[letter]);

  function next() {
    letter = ctx.choose(WORD_LETTERS, (x) => x);
    const others = shuffle(WORD_LETTERS.filter((l) => l !== letter)).slice(0, ctx.level);
    options = shuffle([letter, ...others]);
    placed = false;
    wrong = '';
    tries = 0;
    ctx.tell(`Womit fängt ${WORDS[letter].word} an?`);
  }

  function answer(l: string) {
    if (placed || ctx.finished) return;
    if (l === letter) {
      placed = true;
      ctx.complete({ item: letter, wrongTries: tries, hints: 0 }, next, { message: `Richtig! ${word.word} fängt mit ${letter} an.` });
    } else {
      tries++;
      wrong = l;
      ctx.sound.error();
      ctx.tell(`Hör nochmal genau hin: ${word.word}.`);
      setTimeout(() => (wrong = ''), 400);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat) return;
    const k = e.key.toUpperCase();
    if (options.includes(k)) answer(k);
  }

  next();
</script>

<svelte:window onkeydown={onKey} />

<button type="button" class="hero" style="border:none;background:none" onclick={() => say(word.word)} aria-label="Wort anhören">{word.emoji}</button>
<div class="letter-slots" style="align-items:end">
  <span data-zone="gap" style="border:3px dashed var(--brand);border-radius:10px" data-testid="gap">{placed ? letter : '?'}</span>
  {#each word.word.slice(1) as ch}<span style="border:none">{ch}</span>{/each}
</div>
<div class="choices">
  {#each options as o (o)}
    <button
      type="button"
      class="choice"
      class:wrong={wrong === o}
      use:draggable={{ disabled: placed, onTap: () => answer(o), onDrop: (z) => z === 'gap' && answer(o) }}
    >{o}</button>
  {/each}
</div>
