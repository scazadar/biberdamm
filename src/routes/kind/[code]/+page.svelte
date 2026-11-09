<script lang="ts">
  let { data } = $props();
</script>

<main class="kid">
  <div class="kid-main" style="text-align:center;padding-top:2rem">
    {#if data.open}
      <h1><img class="logo-inline" src="/logo-head.png" alt="" width="40" height="40" /> Wer bist du?</h1>
      <p class="muted">Klasse {data.className}</p>
      <div class="tile-grid">
        {#each data.students as s (s.id)}
          <a class="tile" style="min-height:5.5rem" href="/kind/{data.code}/{s.id}">{s.name}</a>
        {/each}
      </div>
    {:else}
      <div style="font-size:4rem">🚪</div>
      <h1>Diese Klasse ist gerade nicht offen.</h1>
      <p>Prüfe den Code oder frage deine Lehrerin oder deinen Lehrer.</p>
      <a class="btn" href="/kind">Zurück</a>
    {/if}
  </div>
</main>
