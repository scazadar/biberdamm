<script lang="ts">
  let { user }: { user: { displayName: string; role: string } } = $props();
</script>

<nav class="admin-nav no-print" aria-label="Hauptnavigation">
  <div class="inner">
    <a class="brand" href="/lehrkraft"><img class="logo-inline" src="/logo-head.png" alt="" width="40" height="40" /> Biberdamm</a>
    <a href="/lehrkraft">Klassen</a>
    <a href="/lehrkraft/quiz">Quizze</a>
    <a href="/lehrkraft/spiele">Spiele</a>
    {#if user.role === 'admin'}<a href="/admin">Verwaltung</a>{/if}
    <span class="push small">{user.displayName}</span>
    <a href="/lehrkraft/passwort" class="small">Passwort</a>
    <form method="POST" action="/abmelden"><button>Abmelden</button></form>
  </div>
</nav>
