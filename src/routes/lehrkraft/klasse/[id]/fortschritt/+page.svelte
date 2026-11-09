<script lang="ts">
  import { SKILLS } from '#lib/games/catalog';
  import { STATUS_LABEL, STATUS_SYMBOL, type Status } from '#lib/learning';
  import StatusBadge from '#lib/components/StatusBadge.svelte';
  let { data } = $props();
  const legend = Object.keys(STATUS_LABEL) as Status[];
</script>

{#if data.support.length}
  <section class="card">
    <h2>▲ Braucht Unterstützung</h2>
    <ul data-testid="support">
      {#each data.support as s (`${s.studentId}-${s.skill}`)}
        <li><a href="/lehrkraft/kind/{s.studentId}">{s.name}</a>: {SKILLS[s.skill]}</li>
      {/each}
    </ul>
  </section>
{/if}

<div class="row spread" style="margin-bottom:.6rem">
  <div class="small muted">
    {#each legend as l}<span style="margin-right:.8rem">{STATUS_SYMBOL[l]} {STATUS_LABEL[l]}</span>{/each}
  </div>
  <a class="btn" href="/lehrkraft/klasse/{data.klass.id}/export.csv" data-sveltekit-reload>⬇️ CSV-Export</a>
</div>

{#if data.skills.length === 0}
  <p class="muted">Sobald die Kinder gespielt haben, erscheint hier der Lernstand.</p>
{:else}
  <div class="table-wrap">
    <table data-testid="matrix">
      <caption class="small muted">Beobachtungshilfe, keine Benotung.</caption>
      <thead>
        <tr><th scope="col">Kind</th>{#each data.skills as sk}<th scope="col">{SKILLS[sk]}</th>{/each}</tr>
      </thead>
      <tbody>
        {#each data.students as s (s.id)}
          <tr>
            <th scope="row"><a href="/lehrkraft/kind/{s.id}">{s.name}</a></th>
            {#each data.skills as sk}
              <td><StatusBadge status={data.cells[s.id][sk].status} value={data.cells[s.id][sk].value} compact /></td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
