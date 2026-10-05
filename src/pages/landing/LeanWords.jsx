import { useEffect, useRef } from 'react';

// Hero text where each word leans gently away from the cursor and
// eases back when it leaves. Pass the text as parts: plain strings, or
// { text, red: true } for the highlighted words.
//
//   <LeanWords parts={["I'm curious about ", { text: 'visuals', red: true }, '.']} />

const RADIUS = 100;  // how close the cursor has to be (px)
const PUSH = 9;      // how far a word moves at most (px)

export default function LeanWords({ parts, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches) return;
    const words = [...root.querySelectorAll('.lean-w')];
    const state = words.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 }));
    let centres = [];
    let mouse = null;
    let raf = 0;

    const measure = () => {
      centres = words.map((w) => {
        const r = w.getBoundingClientRect();
        return { x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY };
      });
    };

    const tick = () => {
      raf = 0;
      let moving = false;
      words.forEach((w, i) => {
        const s = state[i];
        s.tx = 0; s.ty = 0;
        if (mouse) {
          const dx = centres[i].x - mouse.x, dy = centres[i].y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < RADIUS) {
            const f = Math.pow(1 - d / RADIUS, 2) * PUSH;
            s.tx = (dx / (d || 1)) * f;
            s.ty = (dy / (d || 1)) * f;
          }
        }
        s.x += (s.tx - s.x) * 0.16;
        s.y += (s.ty - s.y) * 0.16;
        if (Math.abs(s.x - s.tx) > 0.05 || Math.abs(s.y - s.ty) > 0.05) moving = true;
        w.style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px)`;
      });
      if (moving) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const onMove = (e) => { mouse = { x: e.clientX + window.scrollX, y: e.clientY + window.scrollY }; kick(); };
    const onLeave = () => { mouse = null; kick(); };

    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [parts]);

  // split every part into words, keeping the spaces between them
  let key = 0;
  const nodes = parts.flatMap((part) => {
    const text = typeof part === 'string' ? part : part.text;
    const red = typeof part !== 'string' && part.red;
    return text.split(/(\s+)/).filter(Boolean).map((chunk) =>
      /^\s+$/.test(chunk)
        ? chunk
        : <span key={key++} className={`lean-w${red ? ' hl' : ''}`}>{chunk}</span>
    );
  });

  return <span className={`lean ${className}`} ref={ref}>{nodes}</span>;
}
