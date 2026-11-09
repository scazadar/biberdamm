<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  let { children } = $props();

  // AGPL §13: Wer eine veränderte Fassung betreibt, trägt hier das eigene Repository ein.
  const SOURCE_URL = 'https://github.com/scazadar/biberdamm';
  // In der laufenden Runde würde der Link Kinder aus dem Spiel führen.
  const inGame = $derived(page.route.id === '/lernen/spiel/[game]');
</script>

<svelte:head><title>Biberdamm</title></svelte:head>
{@render children()}
{#if !inGame}
  <footer class="source-link small">
    <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">Quellcode (AGPL 3.0)</a>
  </footer>
{/if}
