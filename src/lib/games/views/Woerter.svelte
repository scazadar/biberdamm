<script lang="ts">
  import { LETTERS, WORDS, shuffle, type Word } from '#lib/content/data';
  import { say } from '#lib/client/audio';
  import { useGame } from '../context.svelte';

  interface Tile {
    id: number;
    letter: string;
    used: boolean;
  }

  const ctx = useGame();
  const all = Object.values(WORDS);
  const pool = ctx.level === 1 ? all.filter((w) => w.word.length <= 4) : all;

  let word = $state<Word>(pool[0]);
  let tiles = $state<Tile[]>([]);
  let position = $state(0);
  let wrong = $state<number | null>(null);
  let tries = 0;
  const letters = $derived([...word.word.toUpperCase()]);

  function next() {
    word = ctx.choose(pool, (w) => w.word);
    const needed = [...word.word.toUpperCase()];
    const extra = ctx.level === 3 ? shuffle(LETTERS.filter((l) => !needed.includes(l))).slice(0, 2) : [];
    tiles = shuffle([...needed, ...extra]).map((letter, id) => ({ id, letter, used: false }));
    position = 0;
    tries = 0;
    wrong = null;
    ctx.tell(`Schreibe das Wort ${word.word}.`);
  }

  function press(t: Tile) {
    if (t.used || position >= letters.length || ctx.finished) return;
    if (t.letter === letters[position]) {
      t.used = true;
      position++;
      ctx.sound.click(position * 2);
      if (position >= letters.length) {
        ctx.complete({ item: word.word, wrongTries: tries, hints: 0 }, next, { message: `Richtig! ${word.word}.` });
      }
    } else {
      tries++;
      wrong = t.id;
      ctx.sound.error();
      setTimeout(() => (wrong = null), 400);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || e.key.length !== 1) return;
    const k = e.key.toUpperCase();
    const free = tiles.filter((t) => !t.used && t.letter === k);
    const tile = free.find((t) => t.letter === letters[position]) ?? free[0];
    if (tile) press(tile);
  }

  next();
</script>

<svelte:window onkeydown={onKey} />

<button type="button" class="hero" style="border:none;background:none" onclick={() => say(word.word)} aria-label="Wort anhören">{word.emoji}</button>
<div class="letter-slots" data-testid="word" data-word={letters.join('')}>
  {#each letters as l, i}<span>{i < position ? l : ''}</span>{/each}
</div>
<div class="choices">
  {#each tiles as t (t.id)}
    <button type="button" class="choice" class:wrong={wrong === t.id} disabled={t.used} data-letter={t.letter} onclick={() => press(t)}>{t.letter}</button>
  {/each}
</div>
