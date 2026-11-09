<script lang="ts">
  import { STICKERS } from '#lib/games/catalog';
  import { STARS_PER_STICKER } from '#lib/learning';
  let { data } = $props();
  const unlocked = $derived(Math.min(STICKERS.length, Math.floor(data.stars / STARS_PER_STICKER)));
  const missing = $derived(STARS_PER_STICKER - (data.stars % STARS_PER_STICKER));
</script>

<div class="kid">
  <header class="kid-top">
    <a class="btn" href="/lernen" aria-label="Zurück">←</a>
    <span class="name">📒 Mein Album</span>
    <span style="flex:1"></span>
    <span class="stars">⭐ {data.stars}</span>
  </header>
  <main class="kid-main">
    {#if unlocked < STICKERS.length}
      <p>Noch {missing} ⭐ bis zum nächsten Sticker!</p>
    {/if}
    <div class="tile-grid" style="grid-template-columns:repeat(auto-fill,minmax(5.5rem,1fr))" data-testid="album" data-unlocked={unlocked}>
      {#each STICKERS as s, i}
        <div class="tile" style="min-height:5.5rem"><span class="icon">{i < unlocked ? s : '❔'}</span></div>
      {/each}
    </div>
  </main>
</div>
