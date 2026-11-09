<script lang="ts">
  let { data, form } = $props();
</script>

<h1>{data.school}: Klassen</h1>
{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
<div class="tile-grid" style="margin-bottom:1.2rem">
  {#each data.classes as c (c.id)}
    <a class="tile" href="/lehrkraft/klasse/{c.id}" style="min-height:6rem">
      {c.name}
      <span class="small muted">{c.student_count} Kinder{c.archived_at ? ' · archiviert' : ''}</span>
    </a>
  {:else}
    <p class="muted">Noch keine Klassen. Lege unten die erste an.</p>
  {/each}
</div>
<form method="POST" action="?/create" class="card row">
  <label style="flex:1;margin:0">Neue Klasse <input name="name" placeholder="z. B. 1a" required maxlength="60" /></label>
  <button class="primary">Anlegen</button>
</form>
