<script lang="ts">
  let { data, form } = $props();
</script>

{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
{#if form?.message}<p class="notice" role="status">{form.message}</p>{/if}
{#if form?.temp}
  <p class="notice" role="status">
    Startpasswort für <strong>{form.temp.username}</strong>: <code data-testid="temp-password">{form.temp.password}</code>.
    Es wird nur jetzt angezeigt und muss beim ersten Login geändert werden.
  </p>
{/if}

<form method="POST" action="?/create" class="card">
  <h2>Lehrkraft anlegen</h2>
  <div class="row" style="align-items:flex-start">
    <label style="flex:1;min-width:12rem">Name <input name="displayName" required /></label>
    <label style="flex:1;min-width:12rem">Benutzername <input name="username" required autocomplete="off" /></label>
    <label style="flex:1;min-width:10rem">Rolle
      <select name="role"><option value="teacher">Lehrkraft</option><option value="admin">Schuladmin</option></select>
    </label>
  </div>
  <button class="primary">Anlegen</button>
</form>

<div class="table-wrap">
  <table>
    <thead><tr><th>Name</th><th>Benutzername</th><th>Rolle</th><th>Aktionen</th></tr></thead>
    <tbody>
      {#each data.users as u (u.id)}
        <tr>
          <td>{u.display_name}{u.active ? '' : ' (deaktiviert)'}</td>
          <td>{u.username}</td>
          <td>{u.role === 'admin' ? 'Schuladmin' : 'Lehrkraft'}</td>
          <td>
            <div class="row">
              <form method="POST" action="?/reset"><input type="hidden" name="id" value={u.id} /><button>Passwort zurücksetzen</button></form>
              {#if u.id !== data.selfId}
                <form method="POST" action="?/toggle"><input type="hidden" name="id" value={u.id} /><button>{u.active ? 'Deaktivieren' : 'Aktivieren'}</button></form>
              {/if}
              {#if data.classes.length}
                <form method="POST" action="?/assign" class="row">
                  <input type="hidden" name="id" value={u.id} />
                  <select name="classId" aria-label="Klasse für {u.display_name}" style="width:auto">
                    {#each data.classes as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
                  </select>
                  <button>Zuordnen</button>
                </form>
              {/if}
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
