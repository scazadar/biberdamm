<script lang="ts">
  import { BUMP_KEYS, FINGERS, FINGER_BY_ID, KEY_FINGER, KEY_ROWS } from '#lib/content/fingers';

  interface Props {
    /** Buchstabe, der als Nächstes getippt werden soll (Großbuchstabe). */
    goal: string;
    /** Fingerhilfe zeigen: Hände, Farben, Rahmen um die Zieltaste. */
    help: boolean;
    /** Taste, die gerade falsch getippt wurde. */
    flash?: string;
    /** Tasten, die auf dieser Stufe geübt werden; andere erscheinen blasser. */
    practiced?: Set<string>;
    /** Hände über der Tastatur anzeigen. */
    hands?: boolean;
    onpress: (letter: string) => void;
  }

  let { goal, help, flash = '', practiced, hands = true, onpress }: Props = $props();
  const finger = $derived(goal ? FINGER_BY_ID.get(KEY_FINGER[goal]) : undefined);
</script>

{#if hands}
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
{/if}

<div class="keyboard ten">
  {#each KEY_ROWS as row}
    <div class="kb-row" style="padding-left: {row.offset * 3.05}rem">
      {#each row.keys as key}
        <button
          type="button"
          class="f{KEY_FINGER[key].slice(1)}"
          class:colored={help}
          class:other={practiced && !practiced.has(key)}
          class:goal={help && key === goal}
          class:bump={BUMP_KEYS.includes(key)}
          class:wrong={flash === key}
          class:shake={flash === key}
          data-key={key}
          onclick={() => onpress(key)}
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
