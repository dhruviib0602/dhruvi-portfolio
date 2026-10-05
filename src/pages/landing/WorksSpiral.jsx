import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// "selected works": as you scroll, the project covers come out of the
// centre, swing round the label in a spiral, then drop into a row of cards.
// The section is tall and its content sticks to the screen while the
// animation plays, so scrolling drives it (and scrolling back rewinds it).

const clamp = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);                 // ease-out
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function WorksSpiral({ works }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const labelRef = useRef(null);
  const slotRefs = useRef([]);
  const cardRefs = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const n = works.length;
    let raf = 0;

    const render = () => {
      raf = 0;
      const narrow = window.innerWidth <= 900;
      const r = section.getBoundingClientRect();
      const run = r.height - window.innerHeight;                 // scroll distance while pinned
      const p = reduce || narrow ? 1 : clamp(-r.top / (run * 0.85)); // finish a bit before unpinning

      const st = stage.getBoundingClientRect();
      const lab = labelRef.current.getBoundingClientRect();
      const cx = lab.left + lab.width / 2 - st.left;
      const cy = lab.top + lab.height / 2 - st.top;
      const R = Math.min(st.width * 0.3, st.height * 0.42);

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const slot = slotRefs.current[i].getBoundingClientRect();
        const fx = slot.left - st.left + slot.width / 2;
        const fy = slot.top - st.top + slot.height / 2;

        // each card starts a little after the one before it
        const t = clamp((p - i * (0.55 / n)) / 0.45);
        // spiral round the label: angle keeps turning, radius grows
        const a = -Math.PI / 2 + t * Math.PI * 2.2;          // every card follows the same path
        const rad = R * ease(Math.min(1, t * 1.15));
        const sx = cx + Math.cos(a) * rad * 1.6;
        const sy = cy + Math.sin(a) * rad;
        // in the last stretch, drop from the spiral into the row
        const land = easeIO(clamp((t - 0.55) / 0.45));
        const x = sx + (fx - sx) * land;
        const y = sy + (fy - sy) * land;
        const s = (0.08 + 0.32 * ease(Math.min(1, t * 1.6))) * (1 - land) + land; // small while flying, full size once landed
        const rot = (1 - land) * (i % 2 ? 8 : -8) * Math.sin(t * Math.PI);

        card.style.width = `${slot.width}px`;
        card.style.height = `${slot.height}px`;
        card.style.transform = `translate3d(${x - slot.width / 2}px, ${y - slot.height / 2}px, 0) rotate(${rot}deg) scale(${s})`;
        card.style.opacity = String(Math.min(1, t * 6));
        card.classList.toggle('landed', land > 0.98);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(render); };

    render();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.fonts?.ready.then(render);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [works]);

  return (
    <section className="works-spiral" ref={sectionRef}>
      <div className="ws-stage" ref={stageRef}>
        <div className="ws-label" ref={labelRef}>selected works</div>

        {/* invisible row that marks where each card lands */}
        <div className="ws-row grid-row" aria-hidden="true">
          <div className="ws-slots">
            {works.map((w, i) => <div key={w.name} className="ws-slot" ref={(el) => (slotRefs.current[i] = el)} />)}
          </div>
        </div>

        {works.map((w, i) => (
          <Link
            key={w.name}
            to={w.to || '/work'}
            className="ws-card"
            ref={(el) => (cardRefs.current[i] = el)}
          >
            <img src={w.image} alt={w.name} draggable="false" />
            <span className="ws-cap">
              <span className="ws-name">{w.name}</span>
              <span className="ws-meta">
                <span className="ws-cat">{w.category}</span>
                {w.year && <span className="ws-year">{w.year}</span>}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
