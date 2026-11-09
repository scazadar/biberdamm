<script lang="ts">
  import { page } from '$app/state';
</script>

<main class="narrow" style="text-align:center">
  <img class="logo" src="/logo.png" alt="Biberdamm" width="160" height="160" />
  <h1>{page.status === 404 ? 'Das gibt es hier nicht.' : 'Da ist etwas schiefgegangen.'}</h1>
  <p class="muted">{page.error?.message}</p>
  <a class="btn" href="/">Zur Startseite</a>
</main>
