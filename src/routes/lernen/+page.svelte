<script lang="ts">
  import { GAME_BY_ID, WORLDS } from '#lib/games/catalog';
  let { data } = $props();
</script>

<div class="kid">
  <header class="kid-top">
    {#if data.guest}
      <img class="logo-inline" src="/logo-head.png" alt="" width="40" height="40" />
      <span class="name">Biberdamm</span>
      <span style="flex:1"></span>
      <a class="btn small" href="/login" data-testid="staff-login">🧑‍🏫 Lehrkraft</a>
    {:else}
      <span class="name">🦫 {data.student.name}</span>
      <span style="flex:1"></span>
      <a class="stars" href="/lernen/album" style="text-decoration:none;color:inherit" data-testid="stars">⭐ {data.stars}</a>
      <form method="POST" action="/abmelden"><button aria-label="Abmelden">🚪 Fertig</button></form>
    {/if}
  </header>
  <main class="kid-main">
    {#if data.assignments.length}
      <h2>📌 Deine Aufgaben</h2>
      <div class="tile-grid" style="margin-bottom:1.5rem">
        {#each data.assignments as a (a.id)}
          {@const g = GAME_BY_ID.get(a.game_id)}
          {#if g}
            <a class="tile task" href="/lernen/spiel/{a.game_id}?aufgabe={a.id}" data-assignment={a.id}>
              <span class="icon">{g.icon}</span>
              {a.quiz_title ?? g.title}
              <span class="small">{a.done} von {a.rounds}</span>
            </a>
          {/if}
        {/each}
      </div>
    {/if}
    {#if !data.readToday && !data.settings.disabled.includes('lesen')}
      <h2>📖 Heute schon gelesen?</h2>
      <div class="tile-grid" style="margin-bottom:1.5rem">
        <a class="tile task" href="/lernen/spiel/lesen" data-testid="daily-reading"><span class="icon">📖</span>Lesezeit</a>
      </div>
    {/if}
    <h2>🌍 Welten</h2>
    <div class="tile-grid">
      {#each WORLDS as w (w.id)}
        <a class="tile" href="/lernen/welt/{w.id}"><span class="icon">{w.icon}</span>{w.title}</a>
      {/each}
      {#if !data.guest}<a class="tile" href="/lernen/album"><span class="icon">📒</span>Mein Album</a>{/if}
    </div>
  </main>
</div>
