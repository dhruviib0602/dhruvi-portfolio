import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// "playground" — one window.
// Scattered images sit around the label. As you scroll, all but one fly
// past you; the last one glides into a small window in column 4 and stays.
// Once it has landed, the window slowly cycles through the playground photos,
// with a counter, and clicking it (or "enter →") opens the playground page.

const clamp = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const CYCLE_MS = 1100; // how long each photo stays in the window

export default function PlaygroundZoom({ scattered, keep = 4, gallery }) {
  const sectionRef = useRef(null);
  const slotRef = useRef(null);
  const stageRef = useRef(null);
  const imgsRef = useRef([]);
  const labelRef = useRef(null);
  const [landed, setLanded] = useState(false);
  const [shown, setShown] = useState(0); // index into gallery

  useEffect(() => {
    const section = sectionRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    const render = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = reduce ? 1 : clamp(-r.top / (run * 0.8));
      const vw = window.innerWidth / 100;
      const st = stageRef.current.getBoundingClientRect();
      const cx = st.width / 2;
      const cy = st.height / 2;
      const sr = slotRef.current.getBoundingClientRect();
      const slot = { left: sr.left - st.left, top: sr.top - st.top, width: sr.width, height: sr.height };
      const n = scattered.length;

      scattered.forEach(({ x, y }, i) => {
        const img = imgsRef.current[i];
        if (!img) return;
        const w0 = 8.7 * vw, h0 = w0 * 1.25;
        const x0 = cx + x * vw, y0 = cy + y * vw;
        if (i === keep) {
          // the one that stays: glide from its spot into the window
          const k = ease(clamp((p - 0.25) / 0.6));
          const w = w0 + (slot.width - w0) * k;
          const h = h0 + (slot.height - h0) * k;
          const px = x0 + (slot.left + slot.width / 2 - x0) * k;
          const py = y0 + (slot.top + slot.height / 2 - y0) * k;
          img.style.transform = `translate3d(${px - w / 2}px, ${py - h / 2}px, 0)`;
          img.style.width = `${w}px`;
          img.style.height = `${h}px`;
          img.style.opacity = '1';
        } else {
          // the rest fly towards you and past the edges
          const start = 0.04 + 0.03 * Math.abs(i - (n - 1) / 2);
          const k = ease(clamp((p - start) / 0.6));
          const s = 1 + k * 5;
          const px = cx + x * vw * (1 + k * 3.2);
          const py = cy + y * vw * (1 + k * 3.2);
          img.style.transform = `translate3d(${px - (w0 * s) / 2}px, ${py - (h0 * s) / 2}px, 0)`;
          img.style.width = `${w0 * s}px`;
          img.style.height = `${h0 * s}px`;
          img.style.opacity = String(1 - clamp((k - 0.6) / 0.4));
        }
      });
      labelRef.current.style.opacity = String(1 - clamp(p * 4));
      setLanded(p >= 0.86);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(render); };

    render();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [scattered, keep]);

  // once landed, cycle the photos in the window
  useEffect(() => {
    if (!landed) { setShown(0); return; }
    const id = setInterval(() => setShown((s) => (s + 1) % gallery.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [landed, gallery.length]);

  // preload the gallery so the swaps don't flicker
  useEffect(() => { gallery.forEach((src) => { const im = new Image(); im.src = src; }); }, [gallery]);

  const keeper = scattered[keep];
  return (
    <section className={`playground-zoom${landed ? ' is-landed' : ''}`} ref={sectionRef}>
      <div className="pz-stage" ref={stageRef}>
        {/* the window in column 4 the last image lands in */}
        <div className="pz-row grid-row">
          <Link to="/archive" className="pz-slot" ref={slotRef} aria-label="Enter archive" tabIndex={landed ? 0 : -1}>
            {gallery.map((src, i) => (
              <img key={src} src={src} alt="" className={landed && i === shown ? 'on' : ''} draggable="false" />
            ))}
          </Link>
          <div className="pz-caption">
            <span className="pz-title">archive</span>
            <Link to="/archive" className="pz-enter">enter →</Link>
            <span className="pz-count">{String(shown + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="pz-label" ref={labelRef}>archive</div>

        <div className="pz-fly" aria-hidden="true">
          {scattered.map(({ src }, i) => (
            <img
              key={src}
              src={i === keep ? keeper.src : src}
              alt=""
              className={i === keep ? 'pz-keeper' : ''}
              ref={(el) => (imgsRef.current[i] = el)}
              draggable="false"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
