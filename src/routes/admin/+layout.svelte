<script lang="ts">
  import { page } from '$app/state';
  import StaffNav from '#lib/components/StaffNav.svelte';
  let { data, children } = $props();
  const tabs = [
    { href: '/admin', label: 'Lehrkräfte' },
    { href: '/admin/schule', label: 'Schule' },
    { href: '/admin/protokoll', label: 'Protokoll' }
  ];
</script>

<StaffNav user={data.user} />
<main class="page">
  <h1>Verwaltung</h1>
  <nav class="tabs" aria-label="Verwaltungsbereiche">
    {#each tabs as t (t.href)}
      <a href={t.href} aria-current={page.url.pathname === t.href ? 'page' : undefined}>{t.label}</a>
    {/each}
  </nav>
  {@render children()}
</main>
