<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { initAudio } from '#lib/client/audio';
  import { syncResults } from '#lib/client/queue';
  let { data, children } = $props();

  onMount(() => {
    const { student, settings } = untrack(() => data);
    initAudio({ speech: settings.speech, server: settings.serverSpeech });
    const sync = () => void syncResults(student.id);
    sync();
    window.addEventListener('online', sync);
    const timer = setInterval(sync, 30_000);
    return () => {
      window.removeEventListener('online', sync);
      clearInterval(timer);
    };
  });
</script>

{@render children()}
