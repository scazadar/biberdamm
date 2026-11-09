<script lang="ts">
  let { data } = $props();
</script>

<div class="table-wrap">
  <table>
    <caption class="small muted">Die letzten 200 Einträge</caption>
    <thead><tr><th>Zeit</th><th>Wer</th><th>Aktion</th><th>Details</th></tr></thead>
    <tbody>
      {#each data.entries as e (e.id)}
        <tr><td>{new Date(e.at).toLocaleString('de-DE')}</td><td>{e.actor}</td><td>{e.action}</td><td>{e.detail}</td></tr>
      {/each}
    </tbody>
  </table>
</div>
