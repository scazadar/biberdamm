<script lang="ts">
  import { FOREST, FOREST_DECOR, FOREST_QUESTIONS, type ForestQuestion, type ForestThing } from '#lib/content/nature';
  import { useGame } from '../context.svelte';

  const ctx = useGame();
  let mode = $state<'explore' | 'quiz'>('explore');
  let collected = $state<string[]>([]);
  let question = $state<ForestQuestion | null>(null);
  let flash = $state<{ id: string; ok: boolean } | null>(null);
  let busy = false;
  let tries = 0;
  const things = $derived(FOREST.filter((t) => !collected.includes(t.id)));

  function ask() {
    const litterLeft = FOREST.some((t) => t.litter && !collected.includes(t.id));
    const pool = FOREST_QUESTIONS.filter((q) => q.answer !== 'litter' || litterLeft);
    question = ctx.choose(pool, (q) => q.answer);
    tries = 0;
    busy = false;
    flash = null;
    ctx.tell(question.question);
  }

  function startQuiz() {
    mode = 'quiz';
    ask();
  }

  function tap(t: ForestThing) {
    if (busy || ctx.finished) return;
    if (mode === 'explore') {
      if (t.litter) {
        collected = [...collected, t.id];
        ctx.sound.success();
        ctx.tell(t.fact);
      } else {
        ctx.sound.click(4);
        ctx.tell(`Das ist ${t.name}. ${t.fact}`);
      }
      return;
    }
    const q = question!;
    const right = q.answer === 'litter' ? !!t.litter : q.answer === t.id;
    flash = { id: t.id, ok: right };
    if (right) {
      busy = true;
      if (t.litter) collected = [...collected, t.id];
      ctx.complete({ item: q.answer, wrongTries: tries, hints: 0 }, ask, { message: `Richtig! ${t.fact}` });
    } else {
      tries++;
      ctx.sound.error();
      ctx.tell(`Das ist ${t.name}. ${q.question}`);
      setTimeout(() => (flash = null), 600);
    }
  }

  ctx.tell('Willkommen im Wald! Tippe auf alles, was du siehst. Wenn du bereit bist, starte das Quiz.');
</script>

<div class="scene">
  {#each FOREST_DECOR as d}
    <span aria-hidden="true" style:left="{d.x}%" style:top="{d.y}%" style:font-size="{d.size * 1.6}cqw">{d.emoji}</span>
  {/each}
  {#each things as t (t.id)}
    <button
      type="button"
      aria-label={mode === 'explore' ? t.name : 'Antwort im Bild'}
      data-thing={t.id}
      class:right={flash?.id === t.id && flash.ok}
      class:wrong={flash?.id === t.id && !flash.ok}
      style:left="{t.x}%"
      style:top="{t.y}%"
      style:font-size="{t.size * 1.6}cqw"
      onclick={() => tap(t)}
    >{t.emoji}</button>
  {/each}
</div>
{#if mode === 'explore'}
  <button type="button" class="primary" onclick={startQuiz}>🎯 Quiz starten</button>
{/if}
