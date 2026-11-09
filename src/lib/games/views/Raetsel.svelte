<script lang="ts">
  import { shuffle } from '#lib/content/data';
  import { RIDDLES, type Riddle } from '#lib/content/nature';
  import { useGame } from '../context.svelte';

  const ctx = useGame();
  let riddle = $state<Riddle>(RIDDLES[0]);
  let options = $state<Riddle[]>([]);
  let clues = $state(1);
  let wrong = $state('');
  let busy = $state(false);
  let tries = 0;

  function next() {
    riddle = ctx.choose(RIDDLES, (r) => r.name);
    const others = shuffle(RIDDLES.filter((r) => r !== riddle && r.name !== riddle.name)).slice(0, ctx.level);
    options = shuffle([riddle, ...others]);
    clues = 1;
    tries = 0;
    wrong = '';
    busy = false;
    ctx.tell(`Wer bin ich? ${riddle.clues[0]}`);
  }

  function moreClue() {
    if (busy || clues >= riddle.clues.length) return;
    clues++;
    ctx.tell(riddle.clues[clues - 1]);
  }

  function answer(o: Riddle) {
    if (busy || ctx.finished) return;
    if (o.name === riddle.name) {
      busy = true;
      const hints = clues - 1;
      clues = riddle.clues.length;
      ctx.complete({ item: riddle.name, wrongTries: tries, hints }, next, { message: `Richtig! Ich bin ${riddle.name}.` });
    } else {
      tries++;
      wrong = o.name;
      ctx.sound.error();
      ctx.tell(`Das ist ${o.name}. Hör noch einen Tipp!`);
      setTimeout(() => (wrong = ''), 400);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat) return;
    if (e.key === ' ') {
      e.preventDefault();
      moreClue();
      return;
    }
    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= options.length) answer(options[n - 1]);
  }

  next();
</script>

<svelte:window onkeydown={onKey} />

<ul style="list-style:none;padding:0;margin:0;text-align:center">
  {#each riddle.clues.slice(0, clues) as c}<li>🔎 {c}</li>{/each}
</ul>
<button type="button" onclick={moreClue} disabled={busy || clues >= riddle.clues.length}>💡 Noch ein Tipp</button>
<div class="choices">
  {#each options as o, i (o.name)}
    <button
      type="button"
      class="choice emoji"
      class:wrong={wrong === o.name}
      class:right={busy && o.name === riddle.name}
      aria-label={o.name}
      data-name={o.name}
      onclick={() => answer(o)}
    >{o.emoji}<span class="keyhint">{i + 1}</span></button>
  {/each}
</div>
