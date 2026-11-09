<script lang="ts">
  let { form } = $props();
</script>

<main class="narrow">
  <h1><img class="logo-inline" src="/logo-head.png" alt="" width="40" height="40" /> Anmeldung für Lehrkräfte</h1>
  {#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
  <form method="POST" class="card">
    <label>Benutzername <input name="username" required autocomplete="username" /></label>
    <label>Passwort <input name="password" type="password" required autocomplete="current-password" /></label>
    <button class="primary">Anmelden</button>
  </form>
  <a href="/kind">Zur Anmeldung für Kinder</a>
</main>
