<script lang="ts">
  let { data, form } = $props();
</script>

<div style="max-width:28rem">
  <h1>Passwort ändern</h1>
  {#if data.user.mustChange}<p class="notice">Bitte vergib zuerst ein eigenes Passwort.</p>{/if}
  {#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
  <form method="POST" class="card">
    <label>Aktuelles Passwort <input name="current" type="password" required autocomplete="current-password" /></label>
    <label>Neues Passwort (mind. 10 Zeichen) <input name="next" type="password" required minlength="10" autocomplete="new-password" /></label>
    <button class="primary">Speichern</button>
  </form>
</div>
