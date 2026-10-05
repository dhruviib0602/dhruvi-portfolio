import { useEffect, useRef, useState } from 'react';
import useInView from '../hooks/useInView';
import './CaseStudyKit.css';

// Small shared pieces for the case-study pages, so every project speaks the
// same visual language: red-pen marks, a floating section index, numbers
// that count up, and a before/after slider.

// ---------------------------------------------------------------- red pen
// <Ink text="…" marks={['phrase one', 'phrase two']} />
// Draws a hand-drawn red underline under each phrase the first time the
// paragraph scrolls into view. Phrases must appear in `text` exactly.
export function Ink({ text, marks = [], className = '', as: Tag = 'p' }) {
  const [ref, on] = useInView(0.5);
  const parts = [];
  let rest = text;
  let k = 0;
  // split the text around each phrase, in order of appearance
  const ordered = marks
    .map((m) => ({ m, i: text.indexOf(m) }))
    .filter((x) => x.i >= 0)
    .sort((a, b) => a.i - b.i);
  ordered.forEach(({ m }, n) => {
    const i = rest.indexOf(m);
    if (i < 0) return;
    parts.push(rest.slice(0, i));
    parts.push(
      <span key={k++} className={`ink${on ? ' on' : ''}`} style={{ transitionDelay: `${0.25 + n * 0.35}s` }}>{m}</span>
    );
    rest = rest.slice(i + m.length);
  });
  parts.push(rest);
  return <Tag ref={ref} className={className}>{parts}</Tag>;
}

// ------------------------------------------------------ section index pill
// items: [['section-id', 'label'], …]. Appears once you pass the hero and
// hides again near the previous/next links at the bottom.
export function SectionPill({ items }) {
  const [cur, setCur] = useState(null);
  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.4;
      let c = null;
      items.forEach(([id]) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < mid) c = id;
      });
      const end = document.querySelector('.project-nav')?.getBoundingClientRect().top < window.innerHeight * 0.8;
      setCur(end ? null : c);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [items]);
  return (
    <nav className={`cs-pill${cur ? ' on' : ''}`} aria-label="Sections">
      {items.map(([id, name]) => (
        <button key={id} className={cur === id ? 'cur' : ''} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}>
          {name}
        </button>
      ))}
    </nav>
  );
}

// ------------------------------------------------------------ count-up row
// items: [{ value: 19, label: 'people interviewed' }, …]
export function Stats({ items, className = '' }) {
  const [ref, on] = useInView(0.5);
  return (
    <div className={`cs-stats ${className}`} ref={ref}>
      {items.map((s) => (
        <div key={s.label} className="cs-stat">
          <span className="cs-stat-n"><Count value={s.value} on={on} /></span>
          <span className="cs-stat-l">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
function Count({ value, on }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return; }
    let raf, t0;
    const step = (t) => {
      t0 ??= t;
      const k = Math.min(1, (t - t0) / 1100);
      setN(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [on, value]);
  return n;
}

// ------------------------------------------------------ placeholder / media
export function Media({ className = '', video, image, label = 'image placeholder', sub, alt = '' }) {
  if (video) return <video className={`${className} media-img`} src={video} autoPlay muted loop playsInline />;
  if (image) return <img className={`${className} media-img`} src={image} alt={alt} />;
  return (
    <div className={`${className} media-empty`}>
      <span className="placeholder-label">
        {label}
        {sub && <span className="placeholder-sub">{sub}</span>}
      </span>
    </div>
  );
}

// ------------------------------------------------------ before / after
// Drag (or use arrow keys on) the handle to wipe between two images.
// before / after: { image, label, sub } — placeholders until images are set.
export function Compare({ before, after, tags = ['before', 'after'], className = '', ratio }) {
  const [pos, setPos] = useState(50);
  const [ref, on] = useInView(0.5);
  const box = useRef(null);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  // a small nudge the first time it's seen, so people know it moves
  useEffect(() => {
    if (!on || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const seq = [35, 65, 50];
    const ts = seq.map((p, i) => setTimeout(() => { if (!dragging.current) setPos(p); }, 300 + i * 450));
    return () => ts.forEach(clearTimeout);
  }, [on]);

  const move = (clientX) => {
    const r = box.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  const down = (e) => { dragging.current = true; setIsDragging(true); box.current.setPointerCapture?.(e.pointerId); move(e.clientX); };
  const drag = (e) => { if (dragging.current) move(e.clientX); };
  const up = () => { dragging.current = false; setIsDragging(false); };

  return (
    <div ref={ref} className={`cs-compare ${className}`}>
      <div
        ref={box}
        className={`cs-compare-box${isDragging ? ' dragging' : ''}`}
        style={ratio ? { aspectRatio: ratio } : undefined}
        onPointerDown={down} onPointerMove={drag} onPointerUp={up} onPointerCancel={up}
      >
        <Media className="cs-compare-layer" {...after} />
        <div className="cs-compare-top" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Media className="cs-compare-layer" {...before} />
        </div>
        <span className="cs-compare-tag l">{tags[0]}</span>
        <span className="cs-compare-tag r">{tags[1]}</span>
        <div
          className="cs-compare-handle" style={{ left: `${pos}%` }}
          role="slider" tabIndex={0} aria-label={`${tags[0]} / ${tags[1]}`}
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5));
            if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5));
          }}
        >
          <span className="cs-compare-knob">↔</span>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------- tl;dr cards
// Three paper cards, same format as Thela: "01 / title" in red, then a line
// with one phrase marked in red pen. The middle card circles its phrase.
// cards: [{ n: '01', title: 'what we studied', text: '…', mark: 'phrase' }, …]
export function TldrCards({ cards }) {
  const [ref, on] = useInView(0.4);
  return (
    <div className="cs-tldr" ref={ref}>
      {cards.map((c, i) => {
        const at = c.text.indexOf(c.mark);
        const kind = i === 1 ? 'circle' : 'underline';
        return (
          <div key={c.n} className="cs-card">
            <div className="cs-card-n">{c.n} / {c.title}</div>
            <p>
              {at < 0 ? c.text : (
                <>
                  {c.text.slice(0, at)}
                  {kind === 'circle' ? (
                    <span className={`cs-circle${on ? ' on' : ''}`}>
                      {c.mark}
                      <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M10 24 C 6 6, 90 0, 95 18 C 100 36, 22 42, 6 28 C 0 18, 30 6, 62 8" pathLength="1" />
                      </svg>
                    </span>
                  ) : (
                    <span className={`ink${on ? ' on' : ''}`} style={{ transitionDelay: `${0.3 + i * 0.25}s` }}>{c.mark}</span>
                  )}
                  {c.text.slice(at + c.mark.length)}
                </>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}
