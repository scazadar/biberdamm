<script lang="ts">
  import { shuffle } from '#lib/content/data';
  import { SORT_GAMES, type SortItem, type SortZone } from '#lib/content/nature';
  import { draggable } from '#lib/client/drag';
  import { useGame } from '../context.svelte';

  const ctx = useGame();
  const config = SORT_GAMES[ctx.game.id === 'muell' ? 'muell' : 'lebensraum'];
  const zoneCount = ctx.level + 2;

  let item = $state<SortItem>(config.items[0]);
  let zones = $state<SortZone[]>([]);
  let busy = $state(false);
  let wrong = $state('');
  let tries = 0;

  function next() {
    item = ctx.choose(config.items, (x) => x.name);
    const correct = config.zones.find((z) => z.id === item.zone)!;
    const others = shuffle(config.zones.filter((z) => z.id !== item.zone)).slice(0, zoneCount - 1);
    zones = shuffle([correct, ...others]);
    busy = false;
    wrong = '';
    tries = 0;
    ctx.tell(config.question(item));
  }

  function drop(id: string | null) {
    if (!id || busy || ctx.finished) return;
    const zone = zones.find((z) => z.id === id);
    if (!zone) return;
    if (zone.id === item.zone) {
      busy = true;
      ctx.complete({ item: item.name, wrongTries: tries, hints: 0 }, next, { message: `Richtig! ${item.fact}` });
    } else {
      tries++;
      wrong = zone.id;
      ctx.sound.error();
      ctx.tell(config.wrong(item, zone));
      setTimeout(() => (wrong = ''), 400);
    }
  }

  function onKey(e: KeyboardEvent) {
    const n = Number(e.key);
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || !Number.isInteger(n) || n < 1 || n > zones.length) return;
    drop(zones[n - 1].id);
  }

  next();
</script>

<svelte:window onkeydown={onKey} />

{#key item.name}
  <div class="hero" use:draggable={{ disabled: busy, onDrop: drop }} role="img" aria-label={item.name} data-testid="item">{item.emoji}</div>
{/key}
<div class="zones">
  {#each zones as z, i (z.id)}
    <button
      type="button"
      class="zone"
      class:shake={wrong === z.id}
      data-zone={z.id}
      style:background="color-mix(in srgb, {z.color} 55%, white)"
      onclick={() => drop(z.id)}
    >
      <span class="icon" aria-hidden="true">{z.icon}</span>
      <span>{z.name}<span class="keyhint">{i + 1}</span></span>
    </button>
  {/each}
</div>
