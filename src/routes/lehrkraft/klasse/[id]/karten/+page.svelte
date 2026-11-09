<script lang="ts">
  let { data } = $props();
</script>

<div class="no-print row" style="margin-bottom:1rem">
  <button class="primary" onclick={() => window.print()}>🖨️ Drucken</button>
  <span class="muted small">Die Karten enthalten die Zugangsdaten der Kinder. Bitte sicher aufbewahren.</span>
</div>
<div class="cards">
  {#each data.cards as c (c.id)}
    <div class="login-card">
      <div class="qr">{@html c.qr}</div>
      <div>
        <h3>{c.name}</h3>
        <div class="small">Klassencode: <strong>{data.klass.code}</strong></div>
        <div class="pics">{c.pictures.join(' ')}</div>
      </div>
    </div>
  {/each}
</div>
