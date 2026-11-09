<script lang="ts">
  import { GAME_BY_ID } from '#lib/games/catalog';
  let { data } = $props();
</script>

<div class="kid">
  <header class="kid-top">
    <a class="btn" href="/lernen" aria-label="Zurück">←</a>
    <span class="name">{data.world.icon} {data.world.title}</span>
  </header>
  <main class="kid-main">
    <div class="tile-grid">
      {#each data.gameIds as id (id)}
        {@const g = GAME_BY_ID.get(id)!}
        <a class="tile" href="/lernen/spiel/{id}" data-game={id}><span class="icon">{g.icon}</span>{g.title}</a>
      {/each}
    </div>
  </main>
</div>
