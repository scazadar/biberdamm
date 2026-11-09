<script lang="ts">
  let { form } = $props();
</script>

<main class="narrow">
  <h1><img class="logo-inline" src="/logo-head.png" alt="" width="40" height="40" /> Biberdamm einrichten</h1>
  <p class="muted">Lege die Schule und das Konto der Schulverwaltung an.</p>
  {#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
  <form method="POST" class="card">
    <label>Name der Schule <input name="school" required /></label>
    <label>Dein Name <input name="displayName" required autocomplete="name" /></label>
    <label>Benutzername <input name="username" required autocomplete="username" /></label>
    <label>Passwort (mind. 10 Zeichen) <input name="password" type="password" required minlength="10" autocomplete="new-password" /></label>
    <button class="primary">Einrichten</button>
  </form>
</main>
