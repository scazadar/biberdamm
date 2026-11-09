<script lang="ts">
  let { data, form } = $props();
</script>

{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
{#if form?.message}<p class="notice" role="status">{form.message}</p>{/if}
<form method="POST" class="card" style="max-width:32rem">
  <label>Name der Schule <input name="name" value={data.school.name} required /></label>
  <label>Lerndaten aufbewahren (Tage) <input name="retention" type="number" min="30" max="3650" value={data.school.retention_days} required /></label>
  <p class="small muted">Ältere Lerndaten werden täglich automatisch gelöscht.</p>
  <button class="primary">Speichern</button>
</form>
