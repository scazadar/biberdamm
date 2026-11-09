<script lang="ts">
  import { page } from '$app/state';
  let { data, children } = $props();
  const base = $derived(`/lehrkraft/klasse/${data.klass.id}`);
  const tabs = $derived([
    { href: base, label: 'Kinder' },
    { href: `${base}/fortschritt`, label: 'Fortschritt' },
    { href: `${base}/aufgaben`, label: 'Aufgaben' },
    { href: `${base}/einstellungen`, label: 'Einstellungen' }
  ]);
</script>

<div class="no-print">
  <h1>Klasse {data.klass.name}</h1>
  {#if data.klass.archived}<p class="notice">Diese Klasse ist archiviert und nur noch lesbar.</p>{/if}
  <nav class="tabs" aria-label="Klassenbereiche">
    {#each tabs as t (t.href)}
      <a href={t.href} aria-current={page.url.pathname === t.href ? 'page' : undefined}>{t.label}</a>
    {/each}
  </nav>
</div>
{@render children()}
