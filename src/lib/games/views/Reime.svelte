<script lang="ts">
  import { RHYME_PAIRS, type RhymeWord } from '#lib/content/sentences';
  import { shuffle } from '#lib/content/data';
  import { say } from '#lib/client/audio';
  import { useGame } from '../context.svelte';

  const ctx = useGame();
  const options = ctx.level + 1;
  const words = RHYME_PAIRS.flat();
  const partner = new Map(RHYME_PAIRS.flatMap(([a, b]) => [[a, b], [b, a]] as [RhymeWord, RhymeWord][]));

  let target = $state.raw<RhymeWord>(words[0]);
  let choices = $state.raw<RhymeWord[]>([]);
  let solved = $state(false);
  let wrong = $state<string | null>(null);
  let tries = 0;

  const rhyme = $derived(partner.get(target)!);

  function next() {
    target = ctx.choose(words, (w) => w.word);
    const others = shuffle(words.filter((w) => w !== target && w !== partner.get(target)));
    choices = shuffle([partner.get(target)!, ...others.slice(0, options - 1)]);
    solved = false;
    wrong = null;
    tries = 0;
    ctx.tell(`Was reimt sich auf ${target.word}?`);
  }

  const listen = () => say(`${target.word}. ${choices.map((c) => `${c.word}.`).join(' ')}`);

  function answer(w: RhymeWord) {
    if (solved || ctx.finished) return;
    if (w === rhyme) {
      solved = true;
      ctx.complete({ item: target.word, wrongTries: tries, hints: 0 }, next, { message: `Richtig! ${target.word} – ${rhyme.word}.` });
    } else {
      tries++;
      wrong = w.word;
      ctx.sound.error();
      ctx.tell(`${target.word} und ${w.word} reimen sich nicht. Hör auf das Ende: ${target.word}.`);
      setTimeout(() => (wrong = null), 500);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat) return;
    const choice = choices[Number(e.key) - 1];
    if (choice) answer(choice);
  }

  next();
</script>

<svelte:window onkeydown={onKey} />

<div class="hero" role="img" aria-label={target.word}>{target.emoji}</div>
<div class="small muted">{target.word}</div>
<button type="button" class="btn" onclick={listen}>🔊 Alle Wörter hören</button>
<div class="choices">
  {#each choices as c (c.word)}
    <button type="button" class="choice emoji labelled" class:wrong={wrong === c.word} class:right={solved && c === rhyme} data-right={c === rhyme} onclick={() => answer(c)}>
      <span aria-hidden="true">{c.emoji}</span><small>{c.word}</small>
    </button>
  {/each}
</div>
