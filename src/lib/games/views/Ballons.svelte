<script lang="ts">
  import { onDestroy } from 'svelte';
  import { DIGITS, LETTERS, pick, rand, shuffle } from '#lib/content/data';
  import { useGame } from '../context.svelte';

  interface Balloon {
    id: number;
    symbol: string;
    left: number;
    duration: number;
    color: string;
    state: 'fly' | 'pop' | 'wrong';
  }

  const COLORS = ['#ff8a8e', '#ffd866', '#b5e36b', '#7cc4ee', '#c9a6e8', '#ffb27a', '#f59bd3'];
  const ctx = useGame();
  const pool = ctx.level === 1 ? DIGITS : ctx.level === 2 ? LETTERS : LETTERS.map((l) => l.toLowerCase());

  let target = $state('');
  let balloons = $state<Balloon[]>([]);
  let nextId = 0;
  let tries = 0;
  let spawnTimer: ReturnType<typeof setInterval> | undefined;

  const say = (s: string) => (ctx.level === 1 ? `die ${s}` : `das ${s}`);
  const distractor = () => pick(pool.filter((p) => p !== target));
  const make = (symbol: string): Balloon => ({
    id: nextId++,
    symbol,
    left: 4 + rand(82),
    duration: 9 + Math.random() * 5,
    color: pick(COLORS),
    state: 'fly'
  });

  function newTarget() {
    target = ctx.choose(pool, (x) => x);
    ctx.tell(`Lass alle Ballons mit ${say(target)} platzen!`);
    if (ctx.calm) refill();
  }

  /** Ruhemodus: acht stehende Ballons, mindestens zwei davon richtig. */
  function refill() {
    const symbols = [target, target, ...Array.from({ length: 6 }, () => (Math.random() < 0.25 ? target : distractor()))];
    balloons = shuffle(symbols).map(make);
  }

  function spawn() {
    if (ctx.finished || balloons.length >= 8) return;
    balloons.push(make(Math.random() < 0.45 ? target : distractor()));
  }

  const setState = (b: Balloon, state: Balloon['state']) => {
    const live = balloons.find((x) => x.id === b.id);
    if (live) live.state = state;
  };
  const remove = (b: Balloon) => (balloons = balloons.filter((x) => x.id !== b.id));

  function afterHit() {
    tries = 0;
    if (ctx.solved % 4 === 0) newTarget();
    else if (ctx.calm && !balloons.some((b) => b.symbol === target && b.state === 'fly')) refill();
  }

  function hit(b: Balloon) {
    if (b.state !== 'fly' || ctx.finished) return;
    if (b.symbol === target) {
      setState(b, 'pop');
      ctx.sound.pop();
      ctx.complete({ item: target, wrongTries: tries, hints: 0 }, afterHit, { instant: true });
    } else {
      tries++;
      setState(b, 'wrong');
      ctx.sound.error();
      ctx.tell(`Das ist ${say(b.symbol)}. Suche ${say(target)}.`);
      setTimeout(() => setState(b, 'fly'), 400);
    }
  }

  newTarget();
  if (!ctx.calm) {
    spawn();
    spawnTimer = setInterval(spawn, 1300);
  }
  onDestroy(() => clearInterval(spawnTimer));
</script>

<div class="symbol" data-testid="target">{target}</div>
<div class="sky" class:calm={ctx.calm}>
  {#each balloons as b (b.id)}
    <button
      type="button"
      class="balloon"
      class:pop={b.state === 'pop'}
      class:shake={b.state === 'wrong'}
      data-symbol={b.symbol}
      style:left={ctx.calm ? undefined : `${b.left}%`}
      style:background={b.color}
      style:animation-duration="{b.duration}s"
      onclick={() => hit(b)}
      onanimationend={(e) => {
        if (e.animationName.includes('rise')) remove(b);
      }}
    >{b.symbol}</button>
  {/each}
</div>
