<script lang="ts">
  let { data, form } = $props();
  const ask = (msg: string) => (e: Event) => {
    if (!confirm(msg)) e.preventDefault();
  };
</script>

{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
{#if form?.message}<p class="notice" role="status">{form.message}</p>{/if}

<section class="card row spread">
  <div>
    Klassencode: <strong data-testid="class-code" style="font-size:1.4rem;letter-spacing:.1em">{data.klass.code}</strong>
    <div class="small muted">Anmeldung für Kinder: {data.klass.loginOpen ? 'geöffnet' : 'geschlossen'}</div>
  </div>
  <div class="row">
    {#if !data.klass.archived}
      <form method="POST" action="?/toggleLogin"><button>{data.klass.loginOpen ? '🔒 Anmeldung schließen' : '🔓 Anmeldung öffnen'}</button></form>
    {/if}
    <a class="btn" href="/lehrkraft/klasse/{data.klass.id}/karten">🖨️ Login-Karten</a>
  </div>
</section>

{#if !data.klass.archived}
  <form method="POST" action="?/add" class="card">
    <label>Kinder hinzufügen (ein Name pro Zeile)
      <textarea name="names" rows="4" placeholder="Mia K.&#10;Ali S."></textarea>
    </label>
    <p class="small muted">Bitte nur Vorname und Initial oder ein Pseudonym verwenden.</p>
    <button class="primary">Hinzufügen</button>
  </form>
{/if}

<div class="table-wrap">
  <table>
    <thead><tr><th>Name</th><th>Bilder</th><th>Aktionen</th></tr></thead>
    <tbody>
      {#each data.students as s (s.id)}
        <tr data-student={s.name}>
          <td>
            <a href="/lehrkraft/kind/{s.id}">{s.name}</a>
            {#if s.locked}<span class="status status-hilfe">🔒 gesperrt</span>{/if}
          </td>
          <td style="font-size:1.4rem;white-space:nowrap" data-testid="pictures">{s.pictures.join(' ')}</td>
          <td>
            <div class="row">
              {#if !data.klass.archived}
                <form method="POST" action="?/rename" class="row">
                  <input type="hidden" name="studentId" value={s.id} />
                  <input name="name" value={s.name} maxlength="40" aria-label="Neuer Name für {s.name}" style="width:9rem" />
                  <button>Umbenennen</button>
                </form>
                {#if s.locked}
                  <form method="POST" action="?/unlock"><input type="hidden" name="studentId" value={s.id} /><button>Entsperren</button></form>
                {/if}
                <form method="POST" action="?/newPictures"><input type="hidden" name="studentId" value={s.id} /><button>Neue Bilder</button></form>
              {/if}
              <form method="POST" action="?/remove">
                <input type="hidden" name="studentId" value={s.id} />
                <button class="danger" onclick={ask(`${s.name} und alle Lerndaten endgültig löschen?`)}>Löschen</button>
              </form>
            </div>
          </td>
        </tr>
      {:else}
        <tr><td colspan="3" class="muted">Noch keine Kinder in dieser Klasse.</td></tr>
      {/each}
    </tbody>
  </table>
</div>
