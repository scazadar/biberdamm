<script lang="ts">
  import { onDestroy } from 'svelte';
  import { FINGER_LEVELS, TYPING_WORDS, fingerPhrase } from '#lib/content/fingers';
  import FingerKeyboard from '../FingerKeyboard.svelte';
  import { useGame } from '../context.svelte';

  const ctx = useGame();
  const words = ctx.level >= 3;
  const letters = ctx.level === 1 ? FINGER_LEVELS[1] : FINGER_LEVELS[3];
  const practiced = words ? undefined : new Set(letters);
  const OBSTACLES = ['🪨', '🪵', '🍄', '🌾', '🪨', '🪵'];
  const JUMP_MS = 750;

  interface Obstacle {
    id: number;
    emoji: string;
    /** Was auf dem Schild steht, z. B. „F“ oder „Hund“. */
    text: string;
    picture: string;
  }

  let obstacle = $state<Obstacle | null>(null);
  let typed = $state(0);
  let tries = $state(0);
  let flash = $state('');
  let jumping = $state(false);
  let busy = false;
  let first = true;
  let nextId = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const goal = $derived(obstacle && !jumping ? obstacle.text[typed]?.toUpperCase() ?? '' : '');
  const help = $derived(!words || tries > 0);

  function next() {
    tries = 0;
    typed = 0;
    flash = '';
    jumping = false;
    busy = false;
    const emoji = OBSTACLES[nextId % OBSTACLES.length];
    let task: string;
    if (words) {
      const w = ctx.choose(TYPING_WORDS, (x) => x.word);
      obstacle = { id: nextId++, emoji, text: w.word, picture: w.emoji };
      task = `Tippe das Wort ${w.word}.`;
    } else {
      const l = ctx.choose(letters, (x) => x);
      obstacle = { id: nextId++, emoji, text: l, picture: '' };
      task = `Tippe das ${l} ${fingerPhrase(l)}.`;
    }
    ctx.tell(first ? `Hilf Bruno über die Hindernisse zu seinem Damm! ${task}` : task);
    first = false;
  }

  function press(letter: string) {
    if (busy || ctx.finished || !obstacle || !goal) return;
    if (letter === goal) {
      ctx.sound.click(typed);
      typed++;
      if (typed < obstacle.text.length) return;
      busy = true;
      jumping = true;
      const attempt = { item: obstacle.text, wrongTries: tries, hints: 0 };
      timer = setTimeout(() => ctx.complete(attempt, next, { instant: true }), ctx.calm ? 0 : JUMP_MS);
    } else {
      tries++;
      flash = letter;
      ctx.sound.error();
      ctx.tell(`Das war das ${letter}. Das ${goal} tippst du ${fingerPhrase(goal)}.`);
      setTimeout(() => (flash = ''), 400);
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || !/^[a-zA-Z]$/.test(e.key)) return;
    press(e.key.toUpperCase());
  }

  onDestroy(() => clearTimeout(timer));
  next();
</script>

<svelte:window onkeydown={onKey} />

<div class="path" class:still={ctx.calm} class:moving={jumping}>
  <div class="wood" aria-label="Gesammeltes Holz: {ctx.solved}">🪵 {ctx.solved}</div>
  <div class="dam" aria-hidden="true">🏞️</div>
  <img class="bruno" class:jump={jumping} src="/logo-head.png" alt="Bruno" width="72" height="72" />
  {#if obstacle}
    {#key obstacle.id}
      <div class="obstacle" class:leave={jumping}>
        <div class="sign" data-testid="target" data-next={goal} data-text={obstacle.text}>
          {#if obstacle.picture}<span class="pic" aria-hidden="true">{obstacle.picture}</span>{/if}
          <span class="text" class:word={words}>
            {#each obstacle.text as ch, i}
              <span class:done={i < typed} class:now={i === typed && !jumping}>{ch}</span>
            {/each}
          </span>
        </div>
        <div class="post" aria-hidden="true"></div>
        <div class="thing" aria-hidden="true">{obstacle.emoji}</div>
      </div>
    {/key}
  {/if}
</div>

<FingerKeyboard {goal} {help} {flash} {practiced} onpress={press} />

<style>
  .path {
    position: relative; width: 100%; height: 15rem; margin-bottom: .6rem; overflow: hidden; border-radius: 18px;
    background:
      linear-gradient(90deg, #8cc56d 0 2rem, #7dba5f 2rem 4rem) 0 100% / 4rem 3.2rem repeat-x,
      linear-gradient(#bfe6fa, #e4f4fb);
  }
  .path.moving:not(.still) { animation: scroll .75s linear; }
  @keyframes scroll { to { background-position: -4rem 100%, 0 0; } }

  .wood { position: absolute; top: .6rem; right: .8rem; padding: .2rem .7rem; border-radius: 999px; background: #fff; font-weight: 800; font-size: 1.2rem; }
  .dam { position: absolute; right: .4rem; bottom: 2.6rem; font-size: 2.6rem; }

  .bruno { position: absolute; left: 12%; bottom: 2.9rem; width: 4.5rem; height: 4.5rem; border-radius: 50%; }
  .bruno.jump { animation: jump .75s ease-in-out; }
  .still .bruno.jump { animation: none; }
  @keyframes jump { 50% { transform: translateY(-6.5rem) rotate(-8deg); } }

  .obstacle { position: absolute; left: 52%; bottom: 2.7rem; display: flex; flex-direction: column; align-items: center; animation: enter .6s ease-out; }
  .still .obstacle { animation: none; }
  .obstacle.leave { animation: leave .75s linear forwards; }
  .still .obstacle.leave { animation: none; }
  @keyframes enter { from { left: 105%; } }
  @keyframes leave { to { left: -30%; } }

  .sign { display: flex; align-items: center; gap: .4rem; padding: .3rem .8rem; background: #f1d6a7; border: 3px solid #9c6b35; border-radius: 10px; }
  .pic { font-size: 2rem; }
  .text { font-size: 2.6rem; font-weight: 800; letter-spacing: .05em; line-height: 1.1; }
  .text.word { font-size: 2.2rem; }
  .text .done { color: var(--ok); }
  .text .now { text-decoration: underline 4px; text-underline-offset: 6px; }
  .post { width: .5rem; height: 1.2rem; background: #9c6b35; }
  .thing { font-size: 3rem; line-height: 1; }
</style>
