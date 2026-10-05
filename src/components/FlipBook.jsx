import { useEffect, useRef, useState } from 'react';
import DoodleCanvas from './DoodleCanvas';
import './FlipBook.css';

// A zine you can page through.
//  - desktop: an open book; click the right page (or →) to turn forward,
//    the left page (or ←) to go back. Pages turn with a 3D flip.
//  - phones: one page at a time, swipe or tap the arrows.
//  - "read closer" opens it full screen.
//
//  pages: array of image paths, in reading order (front cover first,
//         back cover last). An even number of pages works best.
//  ratio: width / height of ONE page.
//  drawPages: page numbers (1 = front cover) that get a pen to doodle on.
//             Doodles are never saved; a refresh clears them.
const TURN_MS = 700;

export default function FlipBook({ pages, ratio = 0.705, label = 'zine', drawPages = [] }) {
  const leaves = Math.ceil(pages.length / 2);
  const [flipped, setFlipped] = useState(0);        // how many leaves are turned
  const [turning, setTurning] = useState(null);     // leaf mid-turn (drawn on top)
  const [single, setSingle] = useState(false);      // phone layout
  const [page, setPage] = useState(0);              // phone: current page
  const [full, setFull] = useState(false);
  const [seen, setSeen] = useState(3);              // leaves whose images may load
  const [pen, setPen] = useState(false);            // pen picked up?
  const [inked, setInked] = useState(0);            // bumps when doodles change
  const doodles = useRef({});                       // page number -> strokes
  const strokesFor = (n) => (doodles.current[n] ||= []);
  const rootRef = useRef(null);
  const timer = useRef(0);

  // phone or desktop layout
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)');
    const set = () => setSingle(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  const turn = (dir) => {
    const next = flipped + dir;
    setPen(false);
    if (next < 0 || next > leaves) return;
    setTurning(dir > 0 ? flipped : flipped - 1);
    setFlipped(next);
    setSeen((s) => Math.max(s, next + 3));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTurning(null), TURN_MS);
  };
  const go = (dir) => {
    setPen(false);
    if (single) setPage((p) => Math.min(pages.length - 1, Math.max(0, p + dir)));
    else turn(dir);
  };

  // arrow keys while the book is on screen; Escape leaves full screen
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && full) { setFull(false); return; }
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const r = rootRef.current.getBoundingClientRect();
      if (!full && (r.bottom < 0 || r.top > window.innerHeight)) return;
      e.preventDefault();
      go(e.key === 'ArrowRight' ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // lock page scroll while full screen
  useEffect(() => {
    document.body.style.overflow = full ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [full]);

  // swipe
  const touch = useRef(null);
  const onTouchStart = (e) => { touch.current = pen ? null : e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touch.current = null;
  };

  // where the closed book sits: centred on the cover / back cover
  const shift = flipped === 0 ? '-25%' : flipped === leaves ? '25%' : '0%';

  // counter text
  const counter = single
    ? `${page + 1} / ${pages.length}`
    : flipped === 0
      ? 'cover'
      : flipped === leaves
        ? 'back cover'
        : `${flipped * 2}–${flipped * 2 + 1} / ${pages.length}`;

  // is a doodle page open right now? (1-based page numbers)
  const visiblePages = single ? [page + 1] : [flipped * 2, flipped * 2 + 1];
  const drawPage = turning === null ? drawPages.find((n) => visiblePages.includes(n)) : undefined;
  const drawSide = single ? 'single' : drawPage % 2 === 0 ? 'left' : 'right';
  const hasInk = drawPage !== undefined && strokesFor(drawPage).length > 0;
  const clearInk = () => { strokesFor(drawPage).length = 0; setInked((v) => v + 1); };

  const penTool = drawPage !== undefined && (
    <div className={`fb-pen fb-pen-${drawSide}${pen ? ' on' : ''}`}>
      <button className="fb-pen-btn" onClick={() => setPen((v) => !v)} aria-pressed={pen}>
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path d="M4 20l1.2-4.4L16.6 4.2a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.4 18.8z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M14.8 6l3.2 3.2M4 20l4.4-1.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span>{pen ? 'done' : 'doodle here'}</span>
      </button>
      {hasInk && <button className="fb-pen-clear" onClick={clearInk}>clear</button>}
    </div>
  );

  const doodle = (n) =>
    drawPages.includes(n) && (
      <DoodleCanvas
        strokes={strokesFor(n)}
        active={pen && n === drawPage}
        version={inked}
        onDraw={() => setInked((v) => v + 1)}
      />
    );

  const atStart = single ? page === 0 : flipped === 0;
  const atEnd = single ? page === pages.length - 1 : flipped === leaves;

  return (
    <div className={`flipbook${full ? ' is-full' : ''}${single ? ' is-single' : ''}`} ref={rootRef}>
      <div className="fb-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {single ? (
          <div className="fb-single" style={{ aspectRatio: ratio }}>
            {pages.map((src, i) => (
              <img
                key={src}
                className={i === page ? 'on' : ''}
                src={Math.abs(i - page) <= 2 ? src : undefined}
                alt={`${label}, page ${i + 1}`}
              />
            ))}
            {doodle(page + 1)}
            {penTool}
          </div>
        ) : (
          <div className="fb-book" style={{ aspectRatio: ratio * 2, width: `min(100%, calc(var(--fb-h) * ${ratio * 2}))`, transform: `translateX(${shift})` }}>
            {/* click zones: left half goes back, right half goes forward */}
            <button className={`fb-zone fb-zone-prev${pen && drawSide === 'left' ? ' off' : ''}`} onClick={() => turn(-1)} aria-label="Previous page" disabled={atStart} />
            <button className={`fb-zone fb-zone-next${pen && drawSide === 'right' ? ' off' : ''}`} onClick={() => turn(1)} aria-label="Next page" disabled={atEnd} />
            {penTool}

            {Array.from({ length: leaves }, (_, i) => {
              const isFlipped = i < flipped;
              const z = i === turning ? 100 : isFlipped ? i + 1 : leaves - i;
              const load = i < seen;
              const front = pages[i * 2];
              const back = pages[i * 2 + 1];
              return (
                <div key={i} className={`fb-leaf${isFlipped ? ' flipped' : ''}`} style={{ zIndex: z }}>
                  <div className="fb-face fb-front">
                    {front && <img src={load ? front : undefined} alt={`${label}, page ${i * 2 + 1}`} draggable="false" />}
                    {doodle(i * 2 + 1)}
                  </div>
                  <div className="fb-face fb-back">
                    {back && <img src={load ? back : undefined} alt={`${label}, page ${i * 2 + 2}`} draggable="false" />}
                    {doodle(i * 2 + 2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fb-controls">
        <button onClick={() => go(-1)} disabled={atStart} aria-label="Previous page">←</button>
        <span className="fb-count">{counter}</span>
        <button onClick={() => go(1)} disabled={atEnd} aria-label="Next page">→</button>
        <button className="fb-full" onClick={() => setFull((f) => !f)}>
          {full ? 'close ✕' : 'read closer'}
        </button>
      </div>
    </div>
  );
}
