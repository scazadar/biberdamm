<script lang="ts">
  import { LETTERS, WORDS } from '#lib/content/data';
  import { useGame } from '../context.svelte';

  const ctx = useGame();
  const rows = ['QWERTZUIOP', 'ASDFGHJKL', 'YXCVBNM'];
  const lower = LETTERS.map((l) => l.toLowerCase());
  const pool = ctx.level === 1 ? LETTERS : ctx.level === 2 ? lower : [...LETTERS, ...lower];
  const isLower = (s: string) => s === s.toLowerCase();

  let target = $state('');
  let flash = $state('');
  let tries = 0;
  let busy = false;
  const word = $derived(WORDS[target.toUpperCase()]);

  function next() {
    target = ctx.choose(pool, (x) => x);
    tries = 0;
    busy = false;
    flash = '';
    ctx.tell(isLower(target) ? `Finde das kleine ${target}.` : `Finde das ${target}.`);
  }

  function press(letter: string) {
    if (busy || ctx.finished) return;
    if (letter.toUpperCase() === target.toUpperCase()) {
      busy = true;
      const w = WORDS[target.toUpperCase()];
      ctx.complete({ item: target, wrongTries: tries, hints: 0 }, next, {
        message: w && ctx.level < 3 ? `Richtig! ${target.toUpperCase()} wie ${w.word}.` : 'Richtig!'
      });
    } else {
      tries++;
      flash = letter;
      ctx.sound.error();
      ctx.tell(`Das ist das ${letter}. Suche das ${target}.`);
      setTimeout(() => (flash = ''), 400);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || !/^[a-zA-Z]$/.test(e.key)) return;
    press(e.key.toUpperCase());
  }

  next();
</script>

<svelte:window onkeydown={onKey} />

<div class="symbol" data-testid="target">{target}</div>
{#if word && ctx.level < 3}
  <div class="hero" aria-hidden="true">{word.emoji}</div>
{/if}
<div class="keyboard">
  {#each rows as row}
    <div class="kb-row">
      {#each row as key}
        <button type="button" class:wrong={flash === key} class:shake={flash === key} onclick={() => press(key)}>
          {ctx.level === 2 ? key.toLowerCase() : key}
        </button>
      {/each}
    </div>
  {/each}
</div>
