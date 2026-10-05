import { useEffect, useRef } from 'react';

// A see-through drawing layer that sits on top of a zine page.
// Strokes are kept in memory only (in `strokes`, owned by the parent),
// so doodles survive page turns but disappear on refresh. Nothing is saved.
//
//  strokes: array — each stroke is a list of [x, y] points (0–1 of the page)
//  active:  true while the pen is picked up
export default function DoodleCanvas({ strokes, active, color = '#5a7fbf', onDraw, version = 0 }) {
  const ref = useRef(null);
  const onDrawRef = useRef(onDraw);
  onDrawRef.current = onDraw;

  // (re)size the canvas to the page and redraw everything
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const redraw = () => {
      const { width: w, height: h } = canvas.getBoundingClientRect();
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.5, w * 0.006);
      strokes.forEach((s) => {
        ctx.beginPath();
        s.forEach(([x, y], i) => (i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)));
        if (s.length === 1) ctx.lineTo(s[0][0] * w + 0.1, s[0][1] * h);
        ctx.stroke();
      });
    };
    canvas._redraw = redraw;
    redraw();
    const ro = new ResizeObserver(redraw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [strokes, color, version]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let current = null;

    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
    };
    const down = (e) => {
      if (!active) return;
      e.preventDefault();
      e.stopPropagation();
      canvas.setPointerCapture(e.pointerId);
      current = [point(e)];
      strokes.push(current);
      if (strokes.length === 1) onDrawRef.current?.(); // first ink: show 'clear'
      const r = canvas.getBoundingClientRect();
      const [x, y] = current[0];
      ctx.beginPath();
      ctx.moveTo(x * r.width, y * r.height);
      ctx.lineTo(x * r.width + 0.1, y * r.height);
      ctx.stroke();
    };
    const move = (e) => {
      if (!current) return;
      const r = canvas.getBoundingClientRect();
      const [px, py] = current[current.length - 1];
      const p = point(e);
      current.push(p);
      ctx.beginPath();
      ctx.moveTo(px * r.width, py * r.height);
      ctx.lineTo(p[0] * r.width, p[1] * r.height);
      ctx.stroke();
    };
    const up = () => { current = null; };

    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    return () => {
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
    };
  }, [active, strokes]);

  return <canvas ref={ref} className={`fb-doodle${active ? ' is-drawing' : ''}`} aria-hidden="true" />;
}
