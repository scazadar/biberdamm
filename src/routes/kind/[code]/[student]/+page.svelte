<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  let chosen = $state<number[]>([]);
  let formEl: HTMLFormElement;

  function tap(i: number) {
    if (chosen.length >= data.length || chosen.includes(i)) return;
    chosen.push(i);
    if (chosen.length === data.length) setTimeout(() => formEl.requestSubmit(), 150);
  }
</script>

<main class="kid">
  <div class="kid-main" style="text-align:center;padding-top:1.5rem">
    <h1>Hallo {data.name}!</h1>
    {#if form?.error === 'locked'}
      <p class="error" role="alert">🔒 Zu viele Versuche. Bitte frage deine Lehrkraft.</p>
    {:else if form?.error === 'wrong'}
      <p class="error" role="alert">Das waren nicht deine Bilder. Versuch es nochmal!</p>
    {:else}
      <p>Tippe deine drei Bilder.</p>
    {/if}
    <div class="picture-slots" aria-label="Gewählte Bilder">
      {#each Array(data.length) as _, i}<span>{chosen[i] !== undefined ? data.pictures[chosen[i]] : ''}</span>{/each}
    </div>
    <div class="picture-grid">
      {#each data.pictures as p, i}
        <button type="button" data-picture={i} disabled={chosen.includes(i)} onclick={() => tap(i)}>{p}</button>
      {/each}
    </div>
    <form
      method="POST"
      bind:this={formEl}
      use:enhance={() =>
        async ({ update }) => {
          chosen = [];
          await update({ reset: false });
        }}
    >
      <input type="hidden" name="pictures" value={chosen.join(',')} />
    </form>
    <div class="row" style="justify-content:center">
      <button type="button" onclick={() => (chosen = [])}>🧽 Nochmal</button>
      <a class="btn" href="/kind/{data.code}">Das bin ich nicht</a>
    </div>
  </div>
</main>
