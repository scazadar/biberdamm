<script lang="ts">
  import { SOUND_WORDS, SPOKEN_SOUNDS, type SoundWord } from '#lib/content/phonics';
  import { shuffle } from '#lib/content/data';
  import { useGame } from '../context.svelte';

  const ctx = useGame();
  const [min, max, options] = [[2, 3, 2], [3, 4, 3], [4, 5, 4]][ctx.level - 1];
  const pool = SOUND_WORDS.filter((w) => w.sounds.length >= min && w.sounds.length <= max);

  // raw: Die Wörter werden per Identität verglichen, ein $state-Proxy wäre nie gleich.
  let word = $state.raw<SoundWord>(pool[0]);
  let choices = $state.raw<SoundWord[]>([]);
  let wrong = $state<string | null>(null);
  let solved = $state(false);
  let tries = 0;

  const written = (w: SoundWord) => w.sounds.join(' – ');
  const spoken = (w: SoundWord) => w.sounds.map((s) => `${SPOKEN_SOUNDS[s]}.`).join(' ');
  const listen = () => ctx.tell(written(word), spoken(word));

  function next() {
    word = ctx.choose(pool, (w) => w.word);
    // Wörter mit gleichem Anfangslaut zuerst, damit das Kind das ganze Wort anhören muss.
    const others = shuffle(SOUND_WORDS.filter((w) => w !== word)).sort((a, b) => Number(b.sounds[0] === word.sounds[0]) - Number(a.sounds[0] === word.sounds[0]));
    choices = shuffle([word, ...others.slice(0, options - 1)]);
    tries = 0;
    wrong = null;
    solved = false;
    listen();
  }

  function answer(w: SoundWord) {
    if (solved || ctx.finished) return;
    if (w === word) {
      solved = true;
      ctx.complete({ item: word.word, wrongTries: tries, hints: 0 }, next, { message: `Richtig! ${word.word}.` });
    } else {
      tries++;
      wrong = w.word;
      ctx.sound.error();
      ctx.tell(`Das ist ${w.word}. Hör noch mal: ${written(word)}`, `Das ist ${w.word}. Hör noch mal. ${spoken(word)}`);
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

<button type="button" class="btn" onclick={listen}>🔊 Noch mal hören</button>
<div class="choices">
  {#each choices as c (c.word)}
    <button type="button" class="choice emoji" class:wrong={wrong === c.word} class:right={solved && c === word} data-right={c === word} aria-label={c.word} onclick={() => answer(c)}>{c.emoji}</button>
  {/each}
</div>
