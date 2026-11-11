<script lang="ts">
  import { FINGER_LEVELS, fingerPhrase } from '#lib/content/fingers';
  import FingerKeyboard from '../FingerKeyboard.svelte';
  import { useGame } from '../context.svelte';

  const ctx = useGame();
  const pool = FINGER_LEVELS[ctx.level - 1] ?? FINGER_LEVELS[0];
  const practiced = new Set(pool);
  /** Auf der letzten Stufe erscheint die Fingerhilfe erst nach einem Fehler. */
  const alwaysHelp = ctx.level < FINGER_LEVELS.length;
  const START = [
    'Lege die Zeigefinger auf F und J. Die Tasten haben kleine Striche zum Fühlen.',
    'Lege die Finger auf die mittlere Reihe: links A S D F, rechts J K L.',
    'Die Finger liegen auf A S D F und J K L. Für die obere Reihe streckst du den Finger nach oben und kommst zurück.',
    'Finger auf A S D F und J K L. Jetzt kommen alle Buchstaben.'
  ];

  let target = $state('');
  let flash = $state('');
  let tries = $state(0);
  let busy = false;
  let first = true;
  const help = $derived(alwaysHelp || tries > 0);

  function next() {
    target = ctx.choose(pool, (x) => x);
    tries = 0;
    busy = false;
    flash = '';
    const task = alwaysHelp ? `Tippe das ${target} ${fingerPhrase(target)}.` : `Tippe das ${target}.`;
    ctx.tell(first ? `${START[ctx.level - 1] ?? START[0]} ${task}` : task);
    first = false;
  }

  function press(letter: string) {
    if (busy || ctx.finished) return;
    if (letter === target) {
      busy = true;
      ctx.complete({ item: target, wrongTries: tries, hints: 0 }, next);
    } else {
      tries++;
      flash = letter;
      ctx.sound.error();
      ctx.tell(`Das war das ${letter}. Das ${target} tippst du ${fingerPhrase(target)}.`);
      setTimeout(() => (flash = ''), 400);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || !/^[a-zA-Z]$/.test(e.key)) return;
    press(e.key.toUpperCase());
  }

  next();
</script>

<svelte:window onkeydown={onKey} />

<div class="symbol" data-testid="target">{target}</div>

<FingerKeyboard goal={target} {help} {flash} {practiced} onpress={press} />
