<script lang="ts">
  import { useGame } from '../context.svelte';

  const ctx = useGame();
  const [max, step, labelEvery] = ctx.level === 1 ? [10, 1, 5] : ctx.level === 2 ? [20, 1, 10] : [100, 5, 50];
  const count = max / step;
  const values = Array.from({ length: count + 1 }, (_, i) => i * step);
  const targets = values.slice(1, -1);

  let target = $state(targets[0]);
  let marker = $state(0);
  let busy = $state(false);
  let bad = $state(false);
  let line: HTMLElement;
  let dragging = false;
  let tries = 0;

  const at = (v: number) => `calc(var(--inset) + (100% - 2 * var(--inset)) * ${v / max})`;

  function next() {
    target = ctx.choose(targets, String);
    marker = 0;
    tries = 0;
    busy = false;
    ctx.tell(`Wo ist die ${target}? Bringe Bruno dorthin.`);
  }

  const move = (delta: number) => {
    if (!busy) marker = Math.min(max, Math.max(0, marker + delta * step));
  };

  function placeFromPointer(e: PointerEvent) {
    if (busy) return;
    const box = line.getBoundingClientRect();
    const inset = parseFloat(getComputedStyle(line).getPropertyValue('--inset')) * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const share = (e.clientX - box.left - inset) / (box.width - 2 * inset);
    marker = Math.min(max, Math.max(0, Math.round((share * max) / step) * step));
  }

  function down(e: PointerEvent) {
    dragging = true;
    line.setPointerCapture(e.pointerId);
    placeFromPointer(e);
  }

  function submit() {
    if (busy || ctx.finished) return;
    if (marker === target) {
      busy = true;
      ctx.complete({ item: String(target), wrongTries: tries, hints: 0 }, next, { message: `Richtig! Hier ist die ${target}.` });
    } else {
      tries++;
      bad = true;
      ctx.sound.error();
      ctx.tell(`Das ist die ${marker}. Die ${target} liegt weiter ${marker < target ? 'rechts' : 'links'}.`);
      setTimeout(() => (bad = false), 400);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === 'ArrowRight') move(1);
    else if (e.key === 'ArrowLeft') move(-1);
    else if (e.key === 'Enter' && !ctx.finished) {
      e.preventDefault(); // Sonst löst Enter zusätzlich die fokussierte Schaltfläche aus.
      submit();
    } else return;
    if (e.key !== 'Enter') e.preventDefault();
  }

  next();
</script>

<svelte:window onkeydown={onKey} />

<div class="symbol" aria-hidden="true">{target}</div>
<div
  bind:this={line}
  class="numline"
  class:shake={bad}
  role="slider"
  tabindex="0"
  aria-label="Zahlenstrahl von 0 bis {max}"
  aria-valuemin="0"
  aria-valuemax={max}
  aria-valuenow={marker}
  data-testid="numline"
  data-target={target}
  data-step={step}
  onpointerdown={down}
  onpointermove={(e) => dragging && placeFromPointer(e)}
  onpointerup={() => (dragging = false)}
  onpointercancel={() => (dragging = false)}
>
  <div class="axis"></div>
  {#each values as v (v)}
    <div class="tick" class:major={v % labelEvery === 0} style:left={at(v)}></div>
    {#if v % labelEvery === 0}<div class="label" style:left={at(v)}>{v}</div>{/if}
  {/each}
  <div class="marker" style:left={at(marker)} aria-hidden="true">🦫</div>
</div>
<div class="numline-controls">
  <button type="button" class="choice" onclick={() => move(-1)} aria-label="Nach links">◀</button>
  <button type="button" class="choice" onclick={() => move(1)} aria-label="Nach rechts">▶</button>
  <button type="button" class="choice" onclick={submit} aria-label="Fertig">✓</button>
</div>
