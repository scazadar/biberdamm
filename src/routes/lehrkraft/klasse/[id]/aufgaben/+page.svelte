<script lang="ts">
  import { GAME_BY_ID } from '#lib/games/catalog';
  let { data, form } = $props();
  let gameId = $state('zaehlen');
  const selected = $derived(data.games.find((g) => g.id === gameId)!);
</script>

{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
{#if form?.message}<p class="notice" role="status">{form.message}</p>{/if}

{#if !data.klass.archived}
  <form method="POST" action="?/create" class="card">
    <h2>Neue Aufgabe</h2>
    <div class="row" style="align-items:flex-start">
      <label style="flex:2;min-width:14rem">Spiel
        <select name="game" bind:value={gameId}>
          {#each data.games as g (g.id)}<option value={g.id}>{g.icon} {g.title}</option>{/each}
        </select>
      </label>
      {#if gameId === 'quiz'}
        <label style="flex:2;min-width:14rem">Quiz
          <select name="quiz" required>
            {#each data.quizzes as q (q.id)}<option value={q.id}>{q.title}</option>{/each}
          </select>
        </label>
      {:else}
        <label style="flex:2;min-width:14rem">Stufe
          <select name="level">
            {#each selected.levels as l, i}<option value={i + 1}>{i + 1}: {l}</option>{/each}
          </select>
        </label>
      {/if}
      <label style="flex:1;min-width:7rem">Runden <input name="rounds" type="number" min="1" max="10" value="1" required /></label>
      <label style="flex:1;min-width:10rem">Fällig bis <input name="due" type="date" /></label>
    </div>
    {#if gameId === 'quiz' && data.quizzes.length === 0}
      <p class="muted">Noch kein Quiz mit Fragen vorhanden. <a href="/lehrkraft/quiz">Quiz erstellen</a></p>
    {/if}
    <button class="primary">Aufgabe geben</button>
  </form>
{/if}

{#each data.assignments as a (a.id)}
  {@const g = GAME_BY_ID.get(a.game_id)}
  <section class="card" data-testid="assignment">
    <div class="row spread">
      <h3 style="margin:0">{g?.icon} {a.quiz_title ?? g?.title}{a.game_id !== 'quiz' ? ` · Stufe ${a.level}` : ''} · {a.rounds} Runde(n)</h3>
      {#if !data.klass.archived}
        <form method="POST" action="?/remove"><input type="hidden" name="id" value={a.id} /><button class="danger">Entfernen</button></form>
      {/if}
    </div>
    {#if a.due_date}<p class="small muted">Fällig bis {a.due_date}</p>{/if}
    <p data-testid="finished"><strong>Fertig ({a.finished.length}):</strong> {a.finished.join(', ') || 'noch niemand'}</p>
    <p><strong>Offen ({a.open.length}):</strong> {a.open.join(', ') || 'niemand'}</p>
  </section>
{:else}
  <p class="muted">Noch keine Aufgaben.</p>
{/each}
