<script lang="ts">
  import { range } from '#lib/content/data';

  interface Props {
    max: number;
    onanswer: (n: number) => void;
    disabled?: boolean;
    wrong?: number | null;
    right?: number | null;
  }

  let { max, onanswer, disabled = false, wrong = null, right = null }: Props = $props();
  const numbers = $derived(range(1, max));
  let typed = $state('');

  function submit(n: number) {
    typed = '';
    onanswer(n);
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || disabled) return;
    if (e.key === 'Enter' && typed) {
      e.preventDefault();
      submit(Number(typed));
      return;
    }
    if (!/^[0-9]$/.test(e.key)) return;
    if (max <= 10) {
      const n = e.key === '0' ? 10 : Number(e.key);
      if (n <= max) submit(n);
      return;
    }
    // Zweistellig: Eine Ziffer, die noch eine weitere zulässt, wartet auf die nächste oder auf Enter.
    const value = Number(typed + e.key);
    if (value === 0 || value > max) typed = '';
    else if (value * 10 > max) submit(value);
    else typed = String(value);
  }
</script>

<svelte:window onkeydown={onKey} />

{#if typed}<div class="typed" aria-live="polite">{typed}</div>{/if}
<div class="choices">
  {#each numbers as n (n)}
    <button type="button" class="choice" class:wrong={wrong === n} class:right={right === n} {disabled} onclick={() => submit(n)}>{n}</button>
  {/each}
</div>
