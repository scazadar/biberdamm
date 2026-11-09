<script lang="ts">
  import { page } from '$app/state';
</script>

<main class="narrow" style="text-align:center">
  <div style="font-size:4rem">🦫</div>
  <h1>{page.status === 404 ? 'Das gibt es hier nicht.' : 'Da ist etwas schiefgegangen.'}</h1>
  <p class="muted">{page.error?.message}</p>
  <a class="btn" href="/">Zur Startseite</a>
</main>
