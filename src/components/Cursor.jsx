import { useEffect, useRef } from 'react';
import './Cursor.css';

// A tiny red dot that replaces the mouse pointer.
// Over anything you can click it grows and turns "negative": it inverts
// whatever is underneath it. Only on devices with a real mouse.
const HOVER = 'a, button, [role="button"], [role="slider"], [role="tab"], input, select, textarea, label, summary, .ws-card, .pz-slot, .tt-card, .ar-ex-card, .cs-card, .wf-room, .mo-stage, .kk-stop';

export default function Cursor() {
  const dot = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const el = dot.current;
    document.documentElement.classList.add('has-cursor');

    let x = -100, y = -100, raf = 0;
    const draw = () => { raf = 0; el.style.transform = `translate3d(${x}px, ${y}px, 0)`; };
    const move = (e) => {
      x = e.clientX; y = e.clientY;
      el.classList.add('on');
      if (!raf) raf = requestAnimationFrame(draw);
      const t = e.target;
      el.classList.toggle('hover', !!(t && t.closest && t.closest(HOVER)));
    };
    const leave = () => el.classList.remove('on');
    const down = () => el.classList.add('down');
    const up = () => el.classList.remove('down');

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div className="cursor" ref={dot} aria-hidden="true"><span /></div>;
}
