import { useEffect, useRef } from 'react';
import Mark from './Mark';
import ScrambleText from './ScrambleText';

// ---------- tweak the hero here ----------
const IMAGE = '/images/landing/leaves.jpg';
const TINT = 'rgba(191, 53, 53, 0.47)'; // the red layer (window + trail)
const CELL = 14;       // size of one "pixel" in the trail (px)
const RADIUS = 64;     // how wide the brush is (px)
const LIFE = 1100;     // how long a revealed spot takes to fade back (ms)
// -----------------------------------------

// Full-screen photo, faded to 38%. A small window in column 4 has a
// red layer. Moving the mouse paints a blocky red trail that slowly
// fades; inside the window the trail does the opposite and clears
// the red away.
export default function MountainHero() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const windowRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0, h = 0, dpr = 1;
    let hole = { x: 0, y: 0, w: 0, h: 0 };
    const cells = new Map(); // "cx,cy" -> life (1 → 0)
    let last = null;
    let visible = true;
    let raf = 0;
    let prevT = performance.now();

    const resize = () => {
      const r = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const wr = windowRef.current.getBoundingClientRect();
      hole = { x: wr.left - r.left, y: wr.top - r.top, w: wr.width, h: wr.height };
    };

    // stamp a round, ragged-edged brush of cells at (x, y)
    const stamp = (x, y) => {
      const n = Math.ceil(RADIUS / CELL);
      const gx = Math.floor(x / CELL), gy = Math.floor(y / CELL);
      for (let i = -n; i <= n; i++) {
        for (let j = -n; j <= n; j++) {
          const cx = gx + i, cy = gy + j;
          const d = Math.hypot((cx + 0.5) * CELL - x, (cy + 0.5) * CELL - y);
          if (d > RADIUS) continue;
          const edge = d / RADIUS;
          if (edge > 0.55 && Math.random() > (1 - edge) / 0.45) continue; // ragged edge
          const key = `${cx},${cy}`;
          const life = edge > 0.55 ? 0.75 : 1;
          if ((cells.get(key) || 0) < life) cells.set(key, life);
        }
      }
    };

    const onMove = (e) => {
      if (reduceMotion) return;
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (last) {
        const dist = Math.hypot(x - last.x, y - last.y);
        const steps = Math.max(1, Math.floor(dist / (CELL * 0.8)));
        for (let s = 1; s <= steps; s++) stamp(last.x + ((x - last.x) * s) / steps, last.y + ((y - last.y) * s) / steps);
      } else {
        stamp(x, y);
      }
      last = { x, y };
    };
    const onLeave = () => { last = null; };

    const draw = (t) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(64, t - prevT);
      prevT = t;
      if (!visible) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);
      // age the trail
      const decay = dt / LIFE;
      const live = [];
      for (const [key, life] of cells) {
        const next = life - decay;
        if (next <= 0) { cells.delete(key); continue; }
        cells.set(key, next);
        const [cx, cy] = key.split(',').map(Number);
        live.push([cx * CELL, cy * CELL, Math.min(1, next * 1.6)]); // stays, then fades
      }

      // the trail paints red…
      ctx.fillStyle = TINT;
      for (const [x, y, a] of live) {
        ctx.globalAlpha = a;
        ctx.fillRect(x, y, CELL, CELL);
      }
      ctx.globalAlpha = 1;

      // …except inside the window, which is red and the trail clears it
      ctx.save();
      ctx.beginPath();
      ctx.rect(hole.x, hole.y, hole.w, hole.h);
      ctx.clip();
      ctx.clearRect(hole.x, hole.y, hole.w, hole.h);
      ctx.fillRect(hole.x, hole.y, hole.w, hole.h);
      ctx.globalCompositeOperation = 'destination-out';
      for (const [x, y, a] of live) {
        ctx.fillStyle = `rgba(0,0,0,${a})`;
        ctx.fillRect(x, y, CELL, CELL);
      }
      ctx.restore();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(hero);
    window.addEventListener('scroll', resize, { passive: true });
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    io.observe(hero);
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('scroll', resize);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <section className="mountain-hero" ref={heroRef}>
      <img className="mh-photo" src={IMAGE} alt="" />
      <canvas className="mh-tint" ref={canvasRef} aria-hidden="true" />

      <div className="mh-inner grid-row">
        <div className="mh-col">
          <Mark className="mh-logo" />
          <div className="mh-window" ref={windowRef}>
            <p className="mh-tagline">
              <span className="w1" style={{ left: '-20%' }}><ScrambleText text="Systems," /></span>
              <span className="w1" style={{ right: '4%' }}><ScrambleText text="experiences," /></span>
              <span className="w1" style={{ left: '103%' }}><ScrambleText text="stories" /></span>
              <span className="w2" style={{ left: '-20%' }}><ScrambleText text="and" /></span>
              <span className="w2" style={{ left: '20%' }}><ScrambleText text="everything" /></span>
              <span className="w2" style={{ left: '88%' }}><ScrambleText text="in between." /></span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
