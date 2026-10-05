import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ScrambleText from '../../components/ScrambleText';
import { PROJECTS } from '../../data/projects';

// LIST VIEW — names fixed on the left, images scrolling through the centre,
// category/year fixed on the right.
//
// Endless scroll: the list is rendered three times in a row. You always
// scroll inside the middle copy; when you drift into the first or last copy
// the page silently jumps by exactly one copy, so it looks identical and
// never ends. (Phones get a single plain list instead.)
const N = PROJECTS.length;
const COPIES = 3;
const LOOP = Array.from({ length: N * COPIES }, (_, i) => ({ ...PROJECTS[i % N], idx: i }));
const isDesktop = () => window.innerWidth > 900;

export default function WorkList() {
  const [active, setActive] = useState(N); // first project of the middle copy
  const [instant, setInstant] = useState(true); // true = move the name list without sliding
  const [offset, setOffset] = useState(0);
  const viewportRef = useRef(null);
  const rowRefs = useRef([]);
  const imageRefs = useRef([]);
  const activeRef = useRef(N);

  // Centre line everything lines up on: the middle of the name-list box,
  // which is where the active project name sits.
  const centreLine = () => {
    const v = viewportRef.current?.getBoundingClientRect();
    return v && isDesktop() ? v.top + v.height / 2 : window.innerHeight / 2;
  };

  // Height of one full copy of the list.
  const copyHeight = () => {
    const a = imageRefs.current[0];
    const b = imageRefs.current[N];
    return a && b ? b.getBoundingClientRect().top - a.getBoundingClientRect().top : 0;
  };

  // Put the first project of the middle copy exactly on the centre line.
  const scrollToStart = () => {
    const first = imageRefs.current[N];
    if (!first) return;
    const r = first.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top + r.height / 2 - centreLine());
  };

  useLayoutEffect(() => {
    scrollToStart();
    document.fonts?.ready.then(() => { if (imageRefs.current[N]) scrollToStart(); }); // header height changes once fonts load
  }, []);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      if (!imageRefs.current[0]) return;
      let jumped = false;

      // Keep the scroll inside the middle copy (desktop only).
      if (isDesktop()) {
        const S = copyHeight();
        const firstTop = imageRefs.current[0].getBoundingClientRect().top + window.scrollY;
        const y = window.scrollY - firstTop; // scroll measured from the first copy
        if (S > 0 && y < S * 0.5) { window.scrollTo(0, window.scrollY + S); jumped = true; }
        else if (S > 0 && y > S * 1.5) { window.scrollTo(0, window.scrollY - S); jumped = true; }
      }

      // Whichever image's centre is closest to the centre line is active.
      const line = centreLine();
      let best = activeRef.current;
      let bestDist = Infinity;
      imageRefs.current.forEach((el, i) => {
        if (!el || el.offsetParent === null) return; // skip hidden copies on phones
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - line);
        if (d < bestDist) { bestDist = d; best = i; }
      });

      if (best !== activeRef.current) {
        activeRef.current = best;
        setInstant(jumped); // a loop jump must not animate the name list
        setActive(best);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    const onResize = () => { scrollToStart(); onScroll(); };

    update();
    const raf = requestAnimationFrame(() => setInstant(false));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Slide the name list so the active row sits in the middle of its box.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const row = rowRefs.current[active];
    if (!viewport || !row) return;
    setOffset(viewport.clientHeight / 2 - (row.offsetTop + row.offsetHeight / 2));
  }, [active]);

  // After an instant (loop) move, turn the slide animation back on.
  useEffect(() => {
    if (!instant) return;
    const raf = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(raf);
  }, [instant, active]);

  // Hovering a name scrolls its image to the centre line.
  const focusProject = (i) => {
    const el = imageRefs.current[i];
    if (!el) return;
    const r = el.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - centreLine(), behavior: 'smooth' });
  };

  const current = PROJECTS[active % N];
  const copyClass = (i) => (i < N || i >= 2 * N ? ' loop-copy' : ''); // hidden on phones

  return (
    <>
      <div className="work-list-viewport" ref={viewportRef}>
        <div
          className={`work-fixed-list${instant ? ' no-anim' : ''}`}
          style={{ transform: `translateY(${offset}px)` }}
        >
          {LOOP.map((p, i) => {
            const props = {
              ref: (el) => (rowRefs.current[i] = el),
              className: `work-row${i === active ? ' active' : ''}${copyClass(i)}`,
              onMouseEnter: () => focusProject(i),
            };
            const label = <span className="name"><ScrambleText text={p.name} /></span>;
            return p.to
              ? <Link key={i} to={p.to} {...props}>{label}</Link>
              : <a key={i} {...props}>{label}</a>;
          })}
        </div>
      </div>

      <div className="work-fixed-meta">
        <span className="category">{current.category}</span>
        <span className="year">{current.year}</span>
      </div>

      <section className="work-body grid-row">
        <div className="work-images-col">
          {LOOP.map((p, i) => {
            // Images link to their project, same as the names do.
            const props = {
              ref: (el) => (imageRefs.current[i] = el),
              className: `work-image-item${i === active ? ' active' : ''}${copyClass(i)}`,
            };
            const frame = (
              <div
                className="work-image-frame"
                style={p.image ? { backgroundImage: `url('${p.image}')` } : undefined}
              >
                {!p.image && <span className="work-image-index">{String((i % N) + 1).padStart(2, '0')}</span>}
              </div>
            );
            return p.to ? (
              <Link key={i} to={p.to} aria-label={p.name} {...props}>{frame}</Link>
            ) : (
              <div key={i} {...props}>{frame}</div>
            );
          })}
        </div>
      </section>
    </>
  );
}
