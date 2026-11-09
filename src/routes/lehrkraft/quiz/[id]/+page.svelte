<script lang="ts">
  let { data, form } = $props();
</script>

<p><a href="/lehrkraft/quiz">← Alle Quizze</a></p>
<h1>{data.title}</h1>
{#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
{#if form?.message}<p class="notice" role="status">{form.message}</p>{/if}

{#each data.questions as q, i (q.id)}
  <section class="card">
    <div class="row spread">
      <strong>{i + 1}. {q.emoji} {q.prompt}</strong>
      <form method="POST" action="?/removeQuestion"><input type="hidden" name="id" value={q.id} /><button class="danger">Entfernen</button></form>
    </div>
    <ul>{#each q.answers as a, j}<li>{j === q.correct ? '✓ ' : ''}{a}</li>{/each}</ul>
    {#if q.explanation}<p class="small muted">{q.explanation}</p>{/if}
  </section>
{/each}

{#if data.questions.length < data.max}
  <form method="POST" action="?/add" class="card">
    <h2>Neue Frage</h2>
    <label>Frage <input name="prompt" required maxlength="200" /></label>
    <label>Symbol (optional) <input name="emoji" maxlength="16" placeholder="🕐" /></label>
    <fieldset style="border:none;padding:0">
      <legend><strong>Antworten</strong> (mindestens 2, richtige markieren)</legend>
      {#each [0, 1, 2, 3] as i}
        <div class="row" style="margin:.3rem 0;flex-wrap:nowrap">
          <input type="radio" name="correct" value={i} aria-label="Antwort {i + 1} ist richtig" checked={i === 0} />
          <input name="answer{i}" maxlength="80" aria-label="Antwort {i + 1}" />
        </div>
      {/each}
    </fieldset>
    <label>Erklärung (optional) <input name="explanation" maxlength="300" /></label>
    <button class="primary">Hinzufügen</button>
  </form>
{/if}

<form method="POST" action="?/remove"><button class="danger">Quiz löschen</button></form>
