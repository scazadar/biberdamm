<script lang="ts">
  import { STATUS_LABEL, STATUS_SYMBOL, type Status } from '#lib/learning';
  let { status, compact = false, value = null }: { status: Status; compact?: boolean; value?: number | null } = $props();
  const pct = $derived(value === null ? '' : ` (${Math.round(value * 100)} %)`);
</script>

<span class="status status-{status}" title="{STATUS_LABEL[status]}{pct}">
  <span aria-hidden="true">{STATUS_SYMBOL[status]}</span>
  {#if compact}<span class="sr">{STATUS_LABEL[status]}</span>{:else}{STATUS_LABEL[status]}{/if}
</span>

<style>
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
</style>
