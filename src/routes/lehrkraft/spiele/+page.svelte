<script lang="ts">
  import { GAMES, SKILLS, WORLDS } from '#lib/games/catalog';
  const worldName = (id: string | null) => WORLDS.find((w) => w.id === id)?.title ?? 'Nur als Aufgabe';
</script>

<h1>Spielekatalog</h1>
<div class="table-wrap">
  <table>
    <thead><tr><th>Spiel</th><th>Welt</th><th>Kompetenz</th><th>Motorik</th><th>Stufen</th></tr></thead>
    <tbody>
      {#each GAMES as g (g.id)}
        <tr>
          <td>{g.icon} {g.title}</td>
          <td>{worldName(g.world)}</td>
          <td>{SKILLS[g.skill(1, '')]}</td>
          <td>{g.motor}</td>
          <td class="small">{g.levels.join(' · ')}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
