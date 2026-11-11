<script lang="ts">
  import { BUMP_KEYS, FINGERS, FINGER_BY_ID, FINGER_LEVELS, KEY_FINGER, KEY_ROWS, fingerPhrase } from '#lib/content/fingers';
  import { useGame } from '../context.svelte';

  const ctx = useGame();
  const pool = FINGER_LEVELS[ctx.level - 1] ?? FINGER_LEVELS[0];
  const practiced = new Set(pool);
  /** Auf der letzten Stufe erscheint die Fingerhilfe erst nach einem Fehler. */
  const alwaysHelp = ctx.level < FINGER_LEVELS.length;
  const START = [
    'Lege die Zeigefinger auf F und J. Die Tasten haben kleine Striche zum Fühlen.',
    'Lege die Finger auf die mittlere Reihe: links A S D F, rechts J K L.',
    'Die Finger liegen auf A S D F und J K L. Für die obere Reihe streckst du den Finger nach oben und kommst zurück.',
    'Finger auf A S D F und J K L. Jetzt kommen alle Buchstaben.'
  ];

  let target = $state('');
  let flash = $state('');
  let tries = $state(0);
  let busy = false;
  let first = true;
  const help = $derived(alwaysHelp || tries > 0);
  const finger = $derived(target ? FINGER_BY_ID.get(KEY_FINGER[target]) : undefined);

  function next() {
    target = ctx.choose(pool, (x) => x);
    tries = 0;
    busy = false;
    flash = '';
    const task = alwaysHelp ? `Tippe das ${target} ${fingerPhrase(target)}.` : `Tippe das ${target}.`;
    ctx.tell(first ? `${START[ctx.level - 1] ?? START[0]} ${task}` : task);
    first = false;
  }

  function press(letter: string) {
    if (busy || ctx.finished) return;
    if (letter === target) {
      busy = true;
      ctx.complete({ item: target, wrongTries: tries, hints: 0 }, next);
    } else {
      tries++;
      flash = letter;
      ctx.sound.error();
      ctx.tell(`Das war das ${letter}. Das ${target} tippst du ${fingerPhrase(target)}.`);
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

<div class="hands" class:hidden={!help} aria-hidden="true" data-testid="hands" data-finger={help ? finger?.id : ''}>
  {#each ['links', 'rechts'] as hand}
    <div class="hand">
      {#each FINGERS.filter((f) => f.hand === hand) as f}
        <span class="finger f{f.id.slice(1)} {f.id}" class:active={help && finger?.id === f.id}></span>
      {/each}
    </div>
  {/each}
</div>
<p class="finger-label" data-testid="finger-label">
  {#if help && finger}
    {finger.hand === 'links' ? 'Linke' : 'Rechte'} Hand: {finger.name}
  {:else}
    &nbsp;
  {/if}
</p>

<div class="keyboard ten">
  {#each KEY_ROWS as row}
    <div class="kb-row" style="padding-left: {row.offset * 3.05}rem">
      {#each row.keys as key}
        <button
          type="button"
          class="f{KEY_FINGER[key].slice(1)}"
          class:colored={help}
          class:other={!practiced.has(key)}
          class:goal={help && key === target}
          class:bump={BUMP_KEYS.includes(key)}
          class:wrong={flash === key}
          class:shake={flash === key}
          data-key={key}
          onclick={() => press(key)}
        >
          {key}
        </button>
      {/each}
    </div>
  {/each}
</div>

<style>
  .hands { display: flex; justify-content: center; gap: 2.5rem; margin: .4rem 0 0; }
  .hands.hidden { visibility: hidden; }
  .hand { display: flex; align-items: flex-end; gap: .3rem; }
  .finger { display: block; width: 1.5rem; border-radius: .75rem .75rem .4rem .4rem; background: #eee6d4; border: 2px solid #c9bfa8; }
  .l5, .r5 { height: 2.6rem; }
  .l4, .r4 { height: 3.4rem; }
  .l3, .r3 { height: 3.8rem; }
  .l2, .r2 { height: 3.4rem; }
  .l1, .r1 { height: 1.9rem; width: 1.7rem; }
  .finger.active { border-color: var(--ink); border-width: 3px; transform: translateY(-.4rem); }
  .finger-label { text-align: center; font-weight: 700; margin: .3rem 0 .6rem; min-height: 1.5em; }

  .f5.active, .colored.f5 { background: #f4c2dc; }
  .f4.active, .colored.f4 { background: #f7dc8f; }
  .f3.active, .colored.f3 { background: #bfe3b9; }
  .f2.active, .colored.f2 { background: #b6dbf5; }

  .ten button { position: relative; }
  .ten button.other { opacity: .55; }
  .ten button.wrong { background: var(--bad-bg); border-color: var(--bad); opacity: 1; }
  .ten button.goal { outline: 3px solid var(--ink); outline-offset: 1px; opacity: 1; }
  .ten button.bump::after { content: ''; position: absolute; bottom: .45rem; left: 35%; width: 30%; height: 3px; border-radius: 2px; background: currentColor; }
</style>
