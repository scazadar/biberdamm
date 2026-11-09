<script lang="ts">
  import { GAME_BY_ID, SKILLS } from '#lib/games/catalog';
  import StatusBadge from '#lib/components/StatusBadge.svelte';
  let { data } = $props();
  const title = (id: string) => GAME_BY_ID.get(id)?.title ?? id;
  const date = (t: number) => new Date(t).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
</script>

<p><a href="/lehrkraft/klasse/{data.klass.id}/fortschritt">← Klasse {data.klass.name}</a></p>
<div class="row spread">
  <h1>{data.student.name}</h1>
  <a class="btn" href="/lehrkraft/kind/{data.student.id}/export.json" data-sveltekit-reload>⬇️ Datenauskunft (JSON)</a>
</div>
<p>⭐ {data.stars} Sterne</p>

<section class="card">
  <h2>Kompetenzen</h2>
  {#each data.skills as s (s.skill)}
    <div class="row spread" style="padding:.3rem 0"><span>{SKILLS[s.skill]}</span><StatusBadge status={s.status} value={s.value} /></div>
  {:else}
    <p class="muted">Noch keine Daten.</p>
  {/each}
</section>

{#if data.difficulties.length}
  <section class="card">
    <h2>Häufige Schwierigkeiten</h2>
    <ul>
      {#each data.difficulties as d (`${d.game_id}-${d.item}`)}
        <li>{title(d.game_id)}: <strong>{d.item}</strong> ({Math.round(d.avg_score * 100)} %, {d.n}× geübt)</li>
      {/each}
    </ul>
  </section>
{/if}

<section class="card">
  <h2>Letzte Runden</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Zeit</th><th>Spiel</th><th>Stufe</th><th>Ergebnis</th></tr></thead>
      <tbody>
        {#each data.rounds as r, i (i)}
          <tr><td>{date(r.played_at)}</td><td>{title(r.game_id)}</td><td>{r.level}</td><td>{Math.round(r.score * 100)} %</td></tr>
        {:else}
          <tr><td colspan="4" class="muted">Noch keine Runden.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
