<script lang="ts">
  import { useGame } from '../context.svelte';

  type Point = [number, number];
  interface Shape {
    name: string;
    emoji: string;
    color: string;
    points: Point[];
  }

  const star = (): Point[] =>
    Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 === 0 ? 42 : 18;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      return [50 + r * Math.cos(a), 54 + r * Math.sin(a)];
    });

  const heart = (): Point[] =>
    Array.from({ length: 12 }, (_, i) => {
      const t = (i / 12) * 2 * Math.PI;
      const x = 16 * Math.sin(t) ** 3;
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      return [50 + x * 2.6, 46 - y * 2.6];
    });

  const SHORT: Shape[] = [
    { name: 'ein Haus', emoji: '🏠', color: '#f4a261', points: [[22, 90], [22, 50], [50, 18], [78, 50], [78, 90]] },
    { name: 'einen Drachen', emoji: '🪁', color: '#c9a6e8', points: [[50, 8], [80, 40], [50, 92], [20, 40]] },
    { name: 'ein Zelt', emoji: '⛺', color: '#ffd166', points: [[50, 12], [88, 85], [12, 85]] },
    { name: 'ein Boot', emoji: '⛵', color: '#7cc4ee', points: [[12, 55], [88, 55], [70, 85], [30, 85]] },
    { name: 'ein Geschenk', emoji: '🎁', color: '#f59bd3', points: [[20, 20], [80, 20], [80, 80], [20, 80]] }
  ];
  const LONG: Shape[] = [
    { name: 'einen Stern', emoji: '⭐', color: '#ffd166', points: star() },
    { name: 'ein Herz', emoji: '❤️', color: '#ef8a9f', points: heart() },
    { name: 'einen Fisch', emoji: '🐟', color: '#48cae4', points: [[10, 30], [28, 50], [10, 70], [35, 62], [55, 76], [80, 64], [92, 50], [80, 36], [55, 24], [35, 38]] },
    { name: 'einen Tannenbaum', emoji: '🎄', color: '#74c69d', points: [[50, 8], [72, 40], [61, 40], [82, 72], [56, 72], [56, 92], [44, 92], [44, 72], [18, 72], [39, 40], [28, 40]] }
  ];

  const ctx = useGame();
  const pool = ctx.level === 1 ? SHORT : [...SHORT, ...LONG];
  const step = ctx.level === 3 ? 2 : 1;
  const label = (i: number) => (i + 1) * step;

  let shape = $state<Shape>(SHORT[0]);
  let index = $state(0);
  let wrong = $state<number | null>(null);
  let tries = 0;
  const complete = $derived(index >= shape.points.length);
  const path = $derived(shape.points.slice(0, index).map((p) => p.join(',')).join(' '));

  function next() {
    shape = ctx.choose(pool, (s) => s.name);
    index = 0;
    tries = 0;
    wrong = null;
    ctx.tell(`Verbinde die Punkte. Fang bei ${label(0)} an!`);
  }

  function tap(i: number) {
    if (complete || ctx.finished) return;
    if (i === index) {
      index = i + 1;
      wrong = null;
      ctx.sound.click(i * 2);
      if (index >= shape.points.length) {
        ctx.complete({ item: shape.name, wrongTries: tries, hints: 0 }, next, { message: `Toll! Du hast ${shape.name} gemalt!` });
      } else {
        ctx.tell(`Tippe auf die ${label(index)}.`);
      }
    } else if (i > index) {
      tries++;
      wrong = i;
      ctx.sound.error();
      ctx.tell(`Das ist die ${label(i)}. Suche die ${label(index)}.`);
      setTimeout(() => (wrong = null), 500);
    }
  }

  next();
</script>

<svg class="dots" viewBox="0 0 100 100" role="group" aria-label="Punktebild">
  {#if complete}
    <polygon points={shape.points.map((p) => p.join(',')).join(' ')} fill={shape.color} stroke="#2b2a26" stroke-width="1" />
  {:else}
    <polyline points={path} fill="none" stroke="#2f6f5e" stroke-width="1.2" stroke-linecap="round" />
  {/if}
  {#each shape.points as p, i}
    <g
      role="button"
      tabindex="0"
      aria-label="Punkt {label(i)}"
      data-dot={i}
      style="cursor:pointer"
      onclick={() => tap(i)}
      onkeydown={(e) => e.key === 'Enter' && tap(i)}
    >
      <circle cx={p[0]} cy={p[1]} r="5" fill="transparent" />
      <circle cx={p[0]} cy={p[1]} r="1.8" fill={wrong === i ? '#b3261e' : i < index ? '#2f6f5e' : '#2b2a26'} />
      <text x={p[0] + 2.4} y={p[1] - 2.2} font-size="4" font-weight="700" fill="#2b2a26">{label(i)}</text>
    </g>
  {/each}
</svg>
