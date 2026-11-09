<script lang="ts">
  let { data, form } = $props();
  const ask = (msg: string) => (e: Event) => {
    if (!confirm(msg)) e.preventDefault();
  };
</script>

{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
{#if form?.message}<p class="notice" role="status">{form.message}</p>{/if}

<form method="POST" action="?/save" class="card">
  <fieldset disabled={data.klass.archived} style="border:none;padding:0;margin:0">
    <label>Klassenname <input name="name" value={data.klass.name} required maxlength="60" /></label>
    <label class="check"><input type="checkbox" name="speech" checked={data.settings.speech} /> Sprachausgabe</label>
    <label class="check"><input type="checkbox" name="calm" checked={data.settings.calm} /> Ruhemodus (keine Animationen, stehende Ballons)</label>
    <h3>Freigegebene Spiele</h3>
    <div class="tile-grid" style="grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:.2rem">
      {#each data.games as g (g.id)}
        <label class="check" style="margin:0"><input type="checkbox" name="game" value={g.id} checked={!data.settings.disabled.includes(g.id)} /> {g.icon} {g.title}</label>
      {/each}
    </div>
    <p></p>
    <button class="primary">Speichern</button>
  </fieldset>
</form>

<section class="card">
  <h2>Schuljahresende</h2>
  <div class="row">
    <form method="POST" action="?/archive"><button>{data.klass.archived ? 'Reaktivieren' : 'Archivieren'}</button></form>
    <form method="POST" action="?/remove">
      <button class="danger" onclick={ask(`Klasse ${data.klass.name} mit allen Kindern und Lerndaten endgültig löschen?`)}>Klasse löschen</button>
    </form>
  </div>
</section>
