<script lang="ts">
  import { PICTURE_SENTENCES, type PictureSentence } from '#lib/content/sentences';
  import { say } from '#lib/client/audio';
  import { useGame } from '../context.svelte';

  interface Item {
    source: PictureSentence;
    text: string;
    fits: boolean;
  }

  const ctx = useGame();
  const pool: Item[] = PICTURE_SENTENCES[ctx.level - 1].flatMap((source) => [
    { source, text: source.fits, fits: true },
    { source, text: source.nonsense, fits: false }
  ]);

  let item = $state.raw<Item>(pool[0]);
  let solved = $state(false);
  let wrong = $state<boolean | null>(null);
  let tries = 0;
  let hints = 0;

  function next() {
    item = ctx.choose(pool, (i) => i.text);
    solved = false;
    wrong = null;
    tries = hints = 0;
    ctx.tell('Lies den Satz. Passt er zum Bild?');
  }

  // Wie bei der Lesezeit: Ein angetipptes Wort wird vorgelesen und zählt als Tipp.
  function hear(word: string) {
    hints++;
    say(word.replace(/[.,!?]/g, ''));
  }

  function answer(fits: boolean) {
    if (solved || ctx.finished) return;
    if (fits === item.fits) {
      solved = true;
      ctx.complete({ item: item.text, wrongTries: tries, hints }, next, { message: item.fits ? 'Richtig, das passt!' : `Richtig, Quatsch! ${item.source.fits}` });
    } else {
      tries++;
      wrong = fits;
      ctx.sound.error();
      ctx.tell(item.fits ? `Schau noch mal genau. ${item.text}` : `Schau noch mal genau hin. Der Satz sagt: ${item.text}`);
      setTimeout(() => (wrong = null), 500);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat) return;
    const k = e.key.toLowerCase();
    if (k === 'j' || k === '1') answer(true);
    else if (k === 'n' || k === '2') answer(false);
  }

  next();
</script>

<svelte:window onkeydown={onKey} />

<div class="hero" role="img" aria-label="Bild zum Satz">{item.source.picture}</div>
<p class="sentence" data-testid="sentence">
  {#each item.text.split(' ') as word, i (i)}
    <button type="button" class="word" onclick={() => hear(word)}>{word}</button>{' '}
  {/each}
</p>
<div class="choices">
  <button type="button" class="choice text" class:wrong={wrong === true} class:right={solved && item.fits} data-right={item.fits} onclick={() => answer(true)}>✓ Passt</button>
  <button type="button" class="choice text" class:wrong={wrong === false} class:right={solved && !item.fits} data-right={!item.fits} onclick={() => answer(false)}>✗ Quatsch</button>
</div>
