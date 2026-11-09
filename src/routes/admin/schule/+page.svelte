<script lang="ts">
  let { data, form } = $props();
</script>

{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
{#if form?.message}<p class="notice" role="status">{form.message}</p>{/if}
<form method="POST" class="card" style="max-width:32rem">
  <label>Name der Schule <input name="name" value={data.school.name} required /></label>
  <label>Lerndaten aufbewahren (Tage) <input name="retention" type="number" min="30" max="3650" value={data.school.retention_days} required /></label>
  <p class="small muted">Ältere Lerndaten werden täglich automatisch gelöscht.</p>
  <label class="check"><input type="checkbox" name="free_play" checked={!!data.school.free_play} /> Freies Spielen ohne Anmeldung</label>
  <p class="small muted">
    Alle Spiele sind dann ohne Anmeldung direkt erreichbar und die Stufe wird selbst gewählt. Gespeichert wird nichts: keine Sterne,
    keine Fortschritte, keine Aufgaben. Die Kinder-Anmeldung entfällt; Lehrkräfte melden sich weiter an. Wer die Adresse kennt, kann spielen.
  </p>
  <button class="primary">Speichern</button>
</form>
