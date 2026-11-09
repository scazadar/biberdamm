<script lang="ts">
  import { SYLLABLE_WORDS, type SyllableWord } from '#lib/content/phonics';
  import { range, shuffle } from '#lib/content/data';
  import { say } from '#lib/client/audio';
  import { useGame } from '../context.svelte';

  interface Card {
    id: number;
    text: string;
    used: boolean;
  }

  const ctx = useGame();
  const building = ctx.level === 3;
  const pool = SYLLABLE_WORDS.filter((w) => (ctx.level === 1 ? w.syllables.length <= 2 : w.syllables.length >= 2));

  let word = $state<SyllableWord>(pool[0]);
  let taps = $state(0);
  let cards = $state<Card[]>([]);
  let placed = $state(0);
  let wrongCard = $state<number | null>(null);
  let solved = $state(false);
  let bad = $state(false);
  let tries = 0;

  const size = $derived(word.syllables.length);
  const slowly = (w: SyllableWord) => w.syllables.map((s) => `${s}.`).join(' ');

  function next() {
    word = ctx.choose(pool, (w) => w.word);
    taps = placed = tries = 0;
    solved = false;
    wrongCard = null;
    cards = shuffle(word.syllables).map((text, id) => ({ id, text, used: false }));
    ctx.tell(building ? `Baue das Wort ${word.word}.` : `${word.word}. Trommle jede Silbe einmal.`);
  }

  const win = () => {
    solved = true;
    ctx.complete({ item: word.word, wrongTries: tries, hints: 0 }, next, { message: `Richtig! ${word.syllables.join(' – ')}.` });
  };

  function drum() {
    if (solved || ctx.finished || taps >= 9) return;
    taps++;
    ctx.sound.click(taps * 2);
  }

  function confirm() {
    if (solved || ctx.finished || taps === 0) return;
    if (taps === size) return win();
    tries++;
    taps = 0;
    bad = true;
    ctx.sound.error();
    const count = size === 1 ? 'Das ist eine Silbe.' : `Das sind ${size} Silben.`;
    ctx.tell(`Hör genau: ${word.syllables.join(' – ')}. ${count}`, `Hör genau. ${slowly(word)} ${count}`);
    setTimeout(() => (bad = false), 400);
  }

  function press(c: Card) {
    if (c.used || solved || ctx.finished) return;
    if (c.text === word.syllables[placed]) {
      c.used = true;
      placed++;
      ctx.sound.click(placed * 2);
      if (placed === size) win();
    } else {
      tries++;
      wrongCard = c.id;
      ctx.sound.error();
      say(slowly(word));
      setTimeout(() => (wrongCard = null), 400);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat) return;
    if (building) {
      const card = cards[Number(e.key) - 1];
      if (card) press(card);
    } else if (e.key === ' ') {
      e.preventDefault();
      drum();
    } else if (e.key === 'Enter' && !ctx.finished) {
      e.preventDefault(); // Sonst löst Enter zusätzlich die fokussierte Schaltfläche aus.
      confirm();
    }
  }

  next();
</script>

<svelte:window onkeydown={onKey} />

<button type="button" class="hero" style="border:none;background:none" onclick={() => say(word.word)} aria-label="Wort anhören">{word.emoji}</button>
{#if building}
  <div class="letter-slots syllable-slots" data-testid="syllables" data-parts={word.syllables.join('|')}>
    {#each word.syllables as s, i (i)}<span>{i < placed ? s : ''}</span>{/each}
  </div>
  <div class="choices">
    {#each cards as c (c.id)}
      <button type="button" class="choice text" class:wrong={wrongCard === c.id} disabled={c.used} data-syllable={c.text} onclick={() => press(c)}>{c.text}</button>
    {/each}
  </div>
{:else}
  <div class="taps" class:shake={bad} data-testid="taps" data-target={size} data-count={taps} aria-label="{taps} Silben getrommelt" role="status">
    {#each range(1, taps) as t (t)}<i class="dot"></i>{/each}
  </div>
  <div class="numline-controls">
    <button type="button" class="choice emoji" onclick={drum} aria-label="Trommeln" data-testid="drum">🥁</button>
    <button type="button" class="choice emoji" onclick={confirm} aria-label="Fertig" data-testid="confirm">✓</button>
  </div>
{/if}
