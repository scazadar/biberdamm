import type { Action } from 'svelte/action';

export interface DragOptions {
  disabled?: boolean;
  onDrop?: (zone: string | null) => void;
  onTap?: () => void;
}

/**
 * Macht ein Element per Maus oder Finger ziehbar. Beim Loslassen wird das Element mit
 * `data-zone` unter dem Mittelpunkt gemeldet. Ein Tippen ohne Bewegung löst `onTap` aus.
 */
export const draggable: Action<HTMLElement, DragOptions> = (node, initial) => {
  let opts = initial;
  let origin: { x: number; y: number } | null = null;
  let moved = false;
  node.classList.add('draggable');

  const down = (e: PointerEvent) => {
    if (opts.disabled || e.button > 0) return;
    node.setPointerCapture(e.pointerId);
    origin = { x: e.clientX, y: e.clientY };
    moved = false;
    node.classList.add('dragging');
  };
  const move = (e: PointerEvent) => {
    if (!origin) return;
    const x = e.clientX - origin.x;
    const y = e.clientY - origin.y;
    if (Math.hypot(x, y) > 8) moved = true;
    node.style.transform = `translate(${x}px, ${y}px) scale(1.08)`;
  };
  const reset = () => {
    origin = null;
    node.style.transform = '';
    node.classList.remove('dragging');
  };
  const up = () => {
    if (!origin) return;
    const r = node.getBoundingClientRect();
    reset();
    if (!moved) {
      opts.onTap?.();
      return;
    }
    const zone = document
      .elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      .map((n) => n.closest('[data-zone]'))
      .find((z) => z && !node.contains(z));
    opts.onDrop?.(zone?.getAttribute('data-zone') ?? null);
  };
  // Tastaturbedienung: Enter/Leertaste lösen bei Buttons einen click ohne Pointer aus.
  const click = (e: MouseEvent) => {
    if (e.detail === 0 && !opts.disabled) opts.onTap?.();
  };

  node.addEventListener('pointerdown', down);
  node.addEventListener('pointermove', move);
  node.addEventListener('pointerup', up);
  node.addEventListener('pointercancel', reset);
  node.addEventListener('click', click);
  return {
    update: (o) => (opts = o),
    destroy() {
      node.removeEventListener('pointerdown', down);
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerup', up);
      node.removeEventListener('pointercancel', reset);
      node.removeEventListener('click', click);
    }
  };
};
