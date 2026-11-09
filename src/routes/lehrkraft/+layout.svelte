<script lang="ts">
  import StaffNav from '#lib/components/StaffNav.svelte';
  let { data, children } = $props();
</script>

<StaffNav user={data.user} />
<main class="page">{@render children()}</main>
