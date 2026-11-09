<script lang="ts">
  import { onMount } from 'svelte';
  import { LETTERS } from '#lib/content/data';
  import { useGame } from '../context.svelte';

  const SIZE = 500;
  const BRUSH = 34;
  const GRID = 6;
  const NEEDED = 0.8;
  /** Der Pinselrand ragt beim sauberen Nachspuren über das Zeichen hinaus und zählt nicht als Fehler. */
  const TOLERANCE = BRUSH * 0.75;
  const MESSY_RATIO = 0.8;
  const FONT = `bold ${SIZE * 0.78}px Arial, Helvetica, sans-serif`;

  const ctx = useGame();
  const pool =
    ctx.level === 1 ? '0123456789'.split('') : ctx.level === 2 ? LETTERS : LETTERS.map((l) => l.toLowerCase());

  let guide: HTMLCanvasElement;
  let inkCanvas: HTMLCanvasElement;
  let ink: CanvasRenderingContext2D;
  let symbol = $state('');
  let percent = $state(0);
  let solved = false;
  let drawing = false;
  let last: [number, number] | null = null;
  let hue = 0;
  let tries = 0;
  let samples: [number, number][] = [];
  /** Rasterzellen auf dem Zeichen oder innerhalb der Pinselbreite daneben. */
  let allowed = new Set<number>();

  function next() {
    symbol = ctx.choose(pool, (x) => x);
    solved = false;
    tries = 0;
    percent = 0;
    ink.clearRect(0, 0, SIZE, SIZE);
    drawGuide();
    ctx.tell(ctx.level === 1 ? `Male die ${symbol} nach.` : `Male das ${symbol} nach.`);
  }

  function drawGuide() {
    const c = guide.getContext('2d', { willReadFrequently: true })!;
    c.clearRect(0, 0, SIZE, SIZE);
    c.font = FONT;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const y = SIZE / 2 + SIZE * 0.04;
    c.fillStyle = '#000';
    c.fillText(symbol, SIZE / 2, y);
    const data = c.getImageData(0, 0, SIZE, SIZE).data;
    samples = [];
    for (let py = 0; py < SIZE; py += GRID) {
      for (let px = 0; px < SIZE; px += GRID) {
        if (data[(py * SIZE + px) * 4 + 3] > 128) samples.push([px, py]);
      }
    }
    allowed = new Set();
    const reach = Math.ceil(TOLERANCE / GRID);
    for (const [px, py] of samples) {
      for (let dy = -reach; dy <= reach; dy++) {
        for (let dx = -reach; dx <= reach; dx++) {
          if (dx * dx + dy * dy <= reach * reach) allowed.add((py + dy * GRID) * SIZE + px + dx * GRID);
        }
      }
    }
    c.clearRect(0, 0, SIZE, SIZE);
    c.fillStyle = '#e6e0ff';
    c.fillText(symbol, SIZE / 2, y);
    c.setLineDash([10, 8]);
    c.lineWidth = 3;
    c.strokeStyle = '#7a68c9';
    c.strokeText(symbol, SIZE / 2, y);
  }

  function pos(e: PointerEvent): [number, number] {
    const r = inkCanvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * SIZE, ((e.clientY - r.top) / r.height) * SIZE];
  }

  function stroke(a: [number, number], b: [number, number]) {
    hue = (hue + 2) % 360;
    ink.strokeStyle = `hsl(${hue}, 85%, 55%)`;
    ink.lineWidth = BRUSH;
    ink.lineCap = 'round';
    ink.lineJoin = 'round';
    ink.beginPath();
    ink.moveTo(...a);
    ink.lineTo(...b);
    ink.stroke();
  }

  function down(e: PointerEvent) {
    if (solved || e.button > 0) return;
    inkCanvas.setPointerCapture(e.pointerId);
    drawing = true;
    last = pos(e);
    stroke(last, last);
  }

  function move(e: PointerEvent) {
    if (!drawing || !last) return;
    const p = pos(e);
    stroke(last, p);
    last = p;
  }

  function up() {
    if (!drawing) return;
    drawing = false;
    last = null;
    evaluate();
  }

  function evaluate() {
    const data = ink.getImageData(0, 0, SIZE, SIZE).data;
    const inked = (x: number, y: number) => data[(y * SIZE + x) * 4 + 3] > 0;
    const covered = samples.filter(([x, y]) => inked(x, y)).length;
    const coverage = samples.length ? covered / samples.length : 0;
    percent = Math.min(100, Math.round((coverage / NEEDED) * 100));

    let outside = 0;
    for (let y = 0; y < SIZE; y += GRID) {
      for (let x = 0; x < SIZE; x += GRID) {
        if (inked(x, y) && !allowed.has(y * SIZE + x)) outside++;
      }
    }

    if (outside > samples.length * MESSY_RATIO) {
      tries++;
      ctx.tell('Versuch, auf dem Zeichen zu bleiben! Mit Löschen fängst du neu an.');
    } else if (coverage >= NEEDED) {
      solved = true;
      ctx.complete({ item: symbol, wrongTries: Math.min(tries, 2), hints: 0 }, next, { message: 'Super gemalt!' });
    }
  }

  function clear() {
    if (solved) return;
    ink.clearRect(0, 0, SIZE, SIZE);
    percent = 0;
  }

  onMount(() => {
    ink = inkCanvas.getContext('2d', { willReadFrequently: true })!;
    next();
  });
</script>

<div class="drawing">
  <canvas bind:this={guide} width={SIZE} height={SIZE}></canvas>
  <canvas
    bind:this={inkCanvas}
    width={SIZE}
    height={SIZE}
    aria-label="Malfläche"
    data-testid="ink"
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
  ></canvas>
</div>
<div class="row">
  <span aria-live="off">{percent} %</span>
  <button type="button" onclick={clear}>🧽 Löschen</button>
  <button type="button" onclick={() => !solved && next()}>⏭️ Anderes Zeichen</button>
</div>
