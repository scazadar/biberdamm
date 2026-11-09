<script lang="ts">
  let { data, form } = $props();
</script>

<h1>Eigene Quizze</h1>
{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
<ul>
  {#each data.quizzes as q (q.id)}
    <li><a href="/lehrkraft/quiz/{q.id}">{q.title}</a> <span class="muted small">({q.question_count} Fragen)</span></li>
  {:else}
    <li class="muted">Noch keine Quizze.</li>
  {/each}
</ul>
<form method="POST" action="?/create" class="card row">
  <label style="flex:1;margin:0">Neues Quiz <input name="title" required maxlength="80" placeholder="z. B. Die Uhr" /></label>
  <button class="primary">Anlegen</button>
</form>
