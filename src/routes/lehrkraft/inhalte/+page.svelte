<script lang="ts">
  import { onMount } from 'svelte';
  import { initAudio, say } from '#lib/client/audio';
  import { WORDS } from '#lib/content/data';
  import { SOUND_WORDS, SPOKEN_SOUNDS, SYLLABLE_WORDS } from '#lib/content/phonics';
  import { READING_TEXTS } from '#lib/content/reading';
  import { PICTURE_SENTENCES, RHYME_PAIRS } from '#lib/content/sentences';

  let { data } = $props();
  onMount(() => initAudio({ speech: true, server: data.serverSpeech }));

  const sounds = (parts: string[]) => parts.map((s) => `${SPOKEN_SOUNDS[s]}.`).join(' ');
  const levels = ['Stufe 1', 'Stufe 2', 'Stufe 3'];
</script>

{#snippet play(text: string, label = 'Anhören')}
  <button type="button" class="small" onclick={() => say(text)} aria-label="{label}: {text}" title={text}>🔊</button>
{/snippet}

<h1>Inhalte prüfen</h1>
<p class="muted">
  Alle Wörter, Laute und Texte der Lese- und Sprachspiele. Bitte vor dem Einsatz fachlich durchsehen und anhören.
  {data.serverSpeech ? 'Es spricht die Server-Stimme (Piper), wie bei den Kindern.' : 'Kein Sprachdienst eingerichtet: Es spricht die Stimme dieses Geräts.'}
  Änderungen erfolgen im Quellcode unter <code>src/lib/content/</code>.
</p>

<section class="card">
  <h2>Lautbrücke: einzelne Laute</h2>
  <p class="small muted">Jeder Laut soll gedehnt klingen, nicht wie der Buchstabenname („mmm“, nicht „em“). Die Schreibweise steht in <code>SPOKEN_SOUNDS</code>.</p>
  <div class="row" data-testid="sounds">
    {#each Object.entries(SPOKEN_SOUNDS) as [sound, spoken] (sound)}
      <span class="sound-chip"><strong>{sound}</strong> <span class="muted small">„{spoken}“</span> {@render play(`${spoken}.`, `Laut ${sound}`)}</span>
    {/each}
  </div>
</section>

<section class="card">
  <h2>Lautbrücke: Wörter</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Bild</th><th>Wort</th><th>Laute</th><th>Vorgesprochen</th></tr></thead>
      <tbody>
        {#each SOUND_WORDS as w (w.word)}
          <tr><td>{w.emoji}</td><td>{w.word}</td><td>{w.sounds.join(' – ')}</td><td>{@render play(sounds(w.sounds))} {@render play(w.word, 'Ganzes Wort')}</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<section class="card">
  <h2>Silbenklatschen</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Bild</th><th>Wort</th><th>Silben</th><th>Anhören</th></tr></thead>
      <tbody>
        {#each SYLLABLE_WORDS as w (w.word)}
          <tr><td>{w.emoji}</td><td>{w.word}</td><td>{w.syllables.join(' – ')}</td><td>{@render play(w.word)} {@render play(w.syllables.map((s) => `${s}.`).join(' '), 'Silbenweise')}</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<section class="card">
  <h2>Reimpaare</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Wort</th><th>Reimt sich auf</th><th>Anhören</th></tr></thead>
      <tbody>
        {#each RHYME_PAIRS as [a, b] (a.word)}
          <tr><td>{a.emoji} {a.word}</td><td>{b.emoji} {b.word}</td><td>{@render play(`${a.word}. ${b.word}.`)}</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<section class="card">
  <h2>Wörter bauen und Anfangsbuchstaben</h2>
  <div class="row">
    {#each Object.values(WORDS) as w (w.word)}
      <span class="sound-chip">{w.emoji} {w.word} {@render play(w.word)}</span>
    {/each}
  </div>
</section>

<section class="card">
  <h2>Bild oder Quatsch?</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Stufe</th><th>Bild</th><th>Passt</th><th>Quatsch</th></tr></thead>
      <tbody>
        {#each PICTURE_SENTENCES as level, i (i)}
          {#each level as s (s.fits)}
            <tr><td>{levels[i]}</td><td>{s.picture}</td><td>{s.fits} {@render play(s.fits)}</td><td>{s.nonsense} {@render play(s.nonsense)}</td></tr>
          {/each}
        {/each}
      </tbody>
    </table>
  </div>
</section>

<section class="card">
  <h2>Lesezeit</h2>
  <p class="small muted">Die erste Antwort ist jeweils die richtige; im Spiel erscheinen sie gemischt.</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Stufe</th><th>Text</th><th>Frage</th><th>Antworten</th></tr></thead>
      <tbody>
        {#each READING_TEXTS as t (t.id)}
          <tr><td>{levels[t.level - 1]}</td><td>{t.text} {@render play(t.text)}</td><td>{t.question}</td><td><strong>{t.answers[0]}</strong> · {t.answers[1]} · {t.answers[2]}</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
