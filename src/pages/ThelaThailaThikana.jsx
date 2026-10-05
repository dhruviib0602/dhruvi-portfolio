import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import FlipBook from '../components/FlipBook';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GridLines from '../components/GridLines';
import ScrambleText from '../components/ScrambleText';
import useInView from '../hooks/useInView';
import {
  META, TLDR, MARKET, PEOPLE, QUESTION, METHODS, THEMES, PERSONAS,
  STAKEHOLDERS, DAY, SHADOWING, CARDS, INSIGHTS, OUTCOME, NAV,
} from './thela/content';
import './InclusiveNavigation.css'; // shared case-study layout (hero, labels in column 2)
import './ThelaThailaThikana.css';
import useTitle from '../hooks/useTitle';

// All text lives in ./thela/content.js

/* ------------------------------------------------------------------ helpers */

// dashed placeholder box, or the real image once `image` is set
function Media({ className = '', image, label = 'image placeholder', sub, alt = '' }) {
  if (image) return <img className={`${className} media-img`} src={image} alt={alt} />;
  return (
    <div className={`${className} media-empty`}>
      <span className="placeholder-label">{label}{sub && <span className="placeholder-sub">{sub}</span>}</span>
    </div>
  );
}

// "label." in column 2, content beside it — same as the other case studies
function Section({ id, label, className = '', children }) {
  return (
    <section id={id} className={`section grid-row ${className}`}>
      <div className="label">{label}</div>
      {children}
    </section>
  );
}

// red pen: a hand-drawn underline / circle / strike-through that draws itself in
const PEN_PATHS = {
  underline: 'M2 34 C 28 30, 62 38, 98 31',
  circle: 'M10 24 C 6 6, 90 0, 95 18 C 100 36, 22 42, 6 28 C 0 18, 30 6, 62 8',
  strike: 'M0 22 C 30 17, 68 26, 100 19',
};
function Pen({ kind = 'underline', on, children }) {
  // underline + strike are drawn per line in CSS so they follow text that wraps;
  // only the circle (used on short phrases) needs the SVG
  if (kind !== 'circle') return <span className={`pen pen-${kind}${on ? ' on' : ''}`}>{children}</span>;
  return (
    <span className={`pen pen-${kind}${on ? ' on' : ''}`}>
      {children}
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
        <path d={PEN_PATHS[kind]} pathLength="1" />
      </svg>
    </span>
  );
}
// put the pen on one phrase inside a sentence
function Marked({ text, mark, kind, on }) {
  const i = text.indexOf(mark);
  if (i < 0) return text;
  return <>{text.slice(0, i)}<Pen kind={kind} on={on}>{mark}</Pen>{text.slice(i + mark.length)}</>;
}

// a number that counts up the first time it's seen
function CountUp({ value, prefix = '', suffix = '', on }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return; }
    let raf, t0;
    const from = value >= 1000 ? Math.round(value * 0.9) : 0;   // years don't count from 0
    const step = (t) => {
      t0 ??= t;
      const k = Math.min(1, (t - t0) / 1200);
      setN(Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [on, value]);
  const shown = value >= 7000 ? n.toLocaleString('en-IN') : n;
  return <>{prefix}{shown}{suffix}</>;
}

// hero media starts on the baseline of the title's last line (as on the other case studies)
function useTitleBaseline(heroRef, markerRef) {
  useLayoutEffect(() => {
    const measure = () => {
      const hero = heroRef.current, marker = markerRef.current;
      if (!hero || !marker) return;
      const title = marker.parentElement.getBoundingClientRect();
      hero.style.setProperty('--title-baseline', `${marker.getBoundingClientRect().bottom - title.top}px`);
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [heroRef, markerRef]);
}

/* ------------------------------------------------------------------ sections */

function Tldr() {
  const [ref, on] = useInView(0.4);
  return (
    <Section id="tldr" label="tl;dr.">
      <div className="tt-tldr" ref={ref}>
        {TLDR.map((c, i) => (
          <div key={c.n} className="tt-card" style={{ transitionDelay: `${i * 0.25}s` }}>
            <div className="tt-card-n">{c.n} / {c.title}</div>
            <p><Marked text={c.text} mark={c.mark} kind={i === 1 ? 'circle' : 'underline'} on={on} /></p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// line-drawn plan of the market (drawn from the research notes, not to scale)
function MarketPlan({ active, setActive }) {
  const z = (id) => ({
    className: `zone${active === id ? ' on' : ''}`,
    onMouseEnter: () => setActive(id),
    onClick: () => setActive(id),
  });
  return (
    <svg className="tt-plan" viewBox="0 0 600 380" role="img" aria-label="Plan of Municipal Market">
      <g {...z('road')}><rect x="0" y="336" width="600" height="44" /><text x="300" y="363">C.G. ROAD</text></g>
      <g {...z('north')}><rect x="130" y="28" width="440" height="40" /><text x="350" y="53">shops · north</text>
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1={130 + (i + 1) * 40} y1="28" x2={130 + (i + 1) * 40} y2="68" />)}</g>
      <g {...z('east')}><rect x="530" y="68" width="40" height="204" /><text x="550" y="175" transform="rotate(90 550 175)">shops · east</text>
        {Array.from({ length: 4 }, (_, i) => <line key={i} x1="530" y1={68 + (i + 1) * 41} x2="570" y2={68 + (i + 1) * 41} />)}</g>
      <g {...z('south')}><rect x="130" y="272" width="440" height="40" /><text x="350" y="297">cafés & shops · south</text>
        {Array.from({ length: 16 }, (_, i) => <line key={i} x1={130 + (i + 1) * 40} y1="272" x2={130 + (i + 1) * 40} y2="312" />)}</g>
      <g {...z('court')}><rect x="160" y="92" width="350" height="158" className="dash" />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} className="car" x={176 + (i % 7) * 46} y={i < 7 ? 108 : 190} width="26" height="44" rx="6" />)}
        <text x="335" y="175">parking courtyard</text></g>
      <g {...z('west')}>
        <rect x="18" y="40" width="92" height="272" className="dash" />
        {[[44, 80], [80, 110], [40, 150], [84, 186], [48, 226], [82, 262]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" className="stall" />)}
        <text x="64" y="30">food stalls</text></g>
      <g {...z('temple')}><rect x="22" y="318" width="44" height="14" /><text x="88" y="329" className="small">temple</text></g>
    </svg>
  );
}

function Market() {
  const [active, setActive] = useState('court');
  const [ref, on] = useInView(0.3);
  const zone = MARKET.zones.find((zz) => zz.id === active);
  return (
    <Section id="context" label="the market.">
      <p className="body-copy">{MARKET.copy}</p>
      <div className="tt-market" ref={ref}>
        <div className="tt-plan-wrap">
          <MarketPlan active={active} setActive={setActive} />
          <div className="tt-zone-card" key={active}>
            <span className="tag">{zone.tag}</span>
            <p>{zone.text}</p>
          </div>
          <div className="tt-hint">hover the plan</div>
        </div>
        <div className="tt-numbers">
          {MARKET.numbers.map((n) => (
            <div key={n.label} className={`tt-num${n.red ? ' red' : ''}`}>
              <div className="tt-num-v">{n.text ?? <CountUp value={n.value} prefix={n.prefix} suffix={n.suffix} on={on} />}</div>
              <div className="tt-num-l">{n.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function ChipGroup({ title, items, active, setActive }) {
  return (
    <>
      <div className="tt-small">{title}</div>
      <div className="tt-chips">
        {items.map((it) => (
          <button key={it.name} className={`chip${active === it.name ? ' on' : ''}`}
            onMouseEnter={() => setActive(it.name)} onClick={() => setActive(it.name)}>{it.name}</button>
        ))}
      </div>
    </>
  );
}

function People() {
  const [ref, on] = useInView(0.35);
  const all = [...PEOPLE.sellers, ...PEOPLE.buyers, ...PEOPLE.economy];
  const [active, setActive] = useState('street food vendors');
  const cur = all.find((a) => a.name === active);
  // origin points on a simplified outline (not to scale)
  const pts = { Nepal: [262, 46], Rajasthan: [128, 104], Bihar: [296, 96], 'Uttar Pradesh': [210, 80] };
  return (
    <Section id="people" label="who's there.">
      <p className="body-copy">{PEOPLE.copy}</p>
      <div className="tt-people" ref={ref}>
        <div className="tt-origins">
          <svg viewBox="0 0 400 300" className={on ? 'on' : ''} aria-label="Where vendors come from">
            <path className="outline" d="M70 40 L170 20 L260 30 L330 70 L360 120 L300 170 L250 260 L215 290 L185 240 L130 180 L70 150 L40 100 Z" />
            {PEOPLE.origins.map((o, i) => {
              const [x, y] = pts[o];
              return (
                <g key={o}>
                  <path className="route" style={{ transitionDelay: `${0.3 + i * 0.25}s` }} d={`M${x} ${y} Q ${(x + 105) / 2 + 20} ${(y + 165) / 2 - 30} 105 165`} pathLength="1" />
                  <circle cx={x} cy={y} r="3.5" className="pt" /><text x={x + 8} y={y + 4}>{o}</text>
                </g>
              );
            })}
            <circle cx="105" cy="165" r="6" className="home" />
          </svg>
          <span className="tag tt-ahd">Ahmedabad</span>
          <div className="tt-hint">not to scale</div>
        </div>
        <div className="tt-who">
          <ChipGroup title="who sells" items={PEOPLE.sellers} active={active} setActive={setActive} />
          <ChipGroup title="who buys" items={PEOPLE.buyers} active={active} setActive={setActive} />
          <div className="tt-small">economic background</div>
          <div className="tt-econ">
            {PEOPLE.economy.map((e) => (
              <button key={e.name} style={{ flex: e.share }} className={active === e.name ? 'on' : ''}
                onMouseEnter={() => setActive(e.name)} onClick={() => setActive(e.name)}>{e.name}</button>
            ))}
          </div>
          <div className="tt-note" key={active}><span className="tag">{cur.name}</span><p>{cur.note}</p></div>
        </div>
      </div>
    </Section>
  );
}

function Question() {
  const [ref, on] = useInView(0.5);
  return (
    <Section label="research question." className="research-question">
      <p className="rq-copy tt-rq" ref={ref}>
        {QUESTION.map((p, i) => (typeof p === 'string' ? p : <Pen key={i} on={on}>{p.u}</Pen>))}
      </p>
    </Section>
  );
}

function Methods() {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <Section id="research" label="how we listened.">
      <p className="body-copy">Six ways of listening. Pick one to jump to it.</p>
      <div className="tt-methods">
        {METHODS.map((m) => (
          <button key={m.id} className="tt-card tt-method" onClick={() => go(m.id)}>
            <span className="tag">{m.title}</span>
            <span className="tt-card-n">{m.n} / {m.title}</span>
            <span className="tt-desc">{m.desc}</span>
          </button>
        ))}
      </div>
      <div className="tt-photos">
        <Media className="tt-photo" image="/images/thela/stall.jpg" alt="A coconut stall under an orange painted staircase at the Municipal Market" />
        <Media className="tt-photo" image="/images/thela/paan.jpg" alt="A paan seller holding his tray at the market at night" />
        <Media className="tt-photo" image="/images/thela/toys.jpg" alt="A toy seller set up on the pavement at dusk" />
      </div>
    </Section>
  );
}

function Interviews() {
  const [active, setActive] = useState(0);
  const t = THEMES[active];
  return (
    <Section id="interviews" label="01 / interviews.">
      <p className="body-copy">Seven themes kept coming up, ranked by how often we heard them. Hover a bar for the people behind it.</p>
      <div className="tt-themes">
        <div className="tt-bars">
          {THEMES.map((th, i) => (
            <button key={th.name} className={`tt-bar${i === active ? ' on' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)}>
              <span className="tt-bar-fill" style={{ height: `${100 - i * 13}%` }}><span className="tt-bar-n">{String(i + 1).padStart(2, '0')}</span></span>
              <span className="tt-bar-name">{th.name}</span>
            </button>
          ))}
        </div>
        <div className="tt-signs" key={active}>
          <p className="tt-sign-line">{t.line}</p>
          {t.people.map((p, i) => <span key={p} className="sign" style={{ animationDelay: `${i * 0.08}s`, marginLeft: `${(i % 2) * 18}px` }}>{p}</span>)}
        </div>
      </div>
    </Section>
  );
}

function Personas() {
  return (
    <Section id="personas" label="02 / personas.">
      <p className="body-copy">Five people the market depends on, inside it and around it.</p>
      <div className="tt-personas">
        {PERSONAS.map((p) => (
          <div key={p.name} className="tt-persona">
            <div className="tt-persona-img"><img src={p.image} alt={`${p.name}, ${p.role}`} loading="lazy" /></div>
            <div className="tt-persona-n">{p.name}<span>{p.role}</span></div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Stakeholders() {
  const [view, setView] = useState('invisible');
  const [dot, setDot] = useState(1);
  const d = STAKEHOLDERS.dots[dot];
  const q = STAKEHOLDERS.quadrants[d.q];
  return (
    <Section id="stakeholders" label="03 / stakeholders.">
      <div className="tt-stake">
        <div className="tt-stake-l">
          <div className="tt-toggle">
            {['visible', 'invisible'].map((v) => <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{v}</button>)}
          </div>
          <div className="tt-chips" key={view}>
            {STAKEHOLDERS[view].map((s, i) => <span key={s} className={`chip${view === 'invisible' ? ' ghost' : ''} pop`} style={{ animationDelay: `${i * 0.04}s` }}>{s}</span>)}
          </div>
          <p className="tt-line">{STAKEHOLDERS.line}</p>
        </div>
        <div className="tt-grid-wrap">
          <div className="tt-pi">
            {STAKEHOLDERS.quadrants.map((qq, i) => <div key={qq.name} className={`tt-q q${i}${d.q === i ? ' on' : ''}`}>{qq.name}</div>)}
            {STAKEHOLDERS.dots.map((dd, i) => (
              <button key={dd.name} className={`chip tt-dot${i === dot ? ' on' : ''}`} style={{ left: `${dd.x}%`, top: `${dd.y}%` }}
                onMouseEnter={() => setDot(i)} onClick={() => setDot(i)}>{dd.name}</button>
            ))}
            <span className="tt-axis y">power</span><span className="tt-axis x">interest</span>
          </div>
          <div className="tt-note" key={dot}><span className="tag">{d.name} · {q.name}</span><p>{d.note || q.note}</p></div>
        </div>
      </div>
    </Section>
  );
}

function Day() {
  const [h, setH] = useState(21);
  const step = DAY.steps.find((s) => h >= s.start && h < s.end) || DAY.steps[DAY.steps.length - 1];
  const fmt = (x) => { const hh = Math.floor(x) % 24; const ap = hh >= 12 ? 'pm' : 'am'; return `${hh % 12 || 12} ${ap}`; };
  const pct = (x) => ((x - 6) / 18) * 100;
  return (
    <Section id="day" label="04 / a day in the life.">
      <p className="body-copy">{DAY.copy}</p>
      <div className="tt-day tt-card">
        <div className="tt-track">
          {DAY.steps.map((s) => (
            <button key={s.start} className={`seg ${s.kind}${s === step ? ' on' : ''}`} style={{ left: `${pct(s.start)}%`, width: `${pct(s.end) - pct(s.start)}%` }}
              onClick={() => setH(s.start + 0.01)} aria-label={`${fmt(s.start)} to ${fmt(s.end)}`} />
          ))}
          <div className="tt-hand" style={{ left: `${pct(h)}%` }}><span className="tag pt">{fmt(h)} · {step.kind === 'stall' ? 'at the stall' : step.kind === 'source' ? 'buying stock' : 'at home'}</span></div>
          <input type="range" min="6" max="23.99" step="0.05" value={h} onChange={(e) => setH(+e.target.value)} aria-label="time of day" />
          <div className="tt-ticks"><span>6 am</span><span style={{ left: `${pct(13)}%` }}>1 pm</span><span style={{ left: `${pct(17)}%` }}>5 pm</span><span style={{ right: 0 }}>12 am</span></div>
        </div>
        <div className="tt-day-body">
          <div className="tt-step" key={step.start}>
            <div className="tt-small">{fmt(step.start)} – {fmt(step.end)}</div>
            <p>{step.text}</p>
          </div>
          <div>
            <div className="tt-legend"><span className="home">home</span><span className="source">sourcing stock at Kalupur</span><span className="stall">the stall</span></div>
            <p className="tt-line">{DAY.line}</p>
          </div>
        </div>
        <div className="tt-hint">drag along her day</div>
      </div>
    </Section>
  );
}

function Shadowing() {
  const [open, setOpen] = useState(4);
  return (
    <Section id="shadowing" label="05 / shadowing.">
      <p className="body-copy">{SHADOWING.copy}</p>
      <div className={`tt-shadow${SHADOWING.photo ? '' : ' no-photo'}`}>
        {SHADOWING.photo && <Media className="tt-shadow-photo" {...SHADOWING.photo} />}
        <ol className="tt-obs">
          {SHADOWING.notes.map((n, i) => (
            <li key={n.title} className={i === open ? 'on' : ''} onMouseEnter={() => setOpen(i)} onClick={() => setOpen(i)}>
              <span className="tt-obs-n">{String(i + 1).padStart(2, '0')}</span>
              <div><div className="tt-obs-t">{n.title}</div><div className="tt-obs-d">{n.text}</div></div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

function CardSort() {
  const [hl, setHl] = useState('washrooms');
  const [avg, setAvg] = useState(true); // open on the averages
  const [ref, on] = useInView(0.3);
  const averages = useMemo(() => CARDS.problems
    .map((p) => ({ p, v: CARDS.rows.reduce((a, r) => a + r.rank.indexOf(p) + 1, 0) / CARDS.rows.length }))
    .sort((a, b) => a.v - b.v), []);
  return (
    <Section id="cards" label="06 / card sorting.">
      <p className="body-copy">{CARDS.copy}</p>
      <div className="tt-sort" ref={ref}>
        <div className="tt-sort-l">
          <table className={avg ? 'dim' : ''}>
            <thead><tr><th />{['1st', '2nd', '3rd', '4th', '5th'].map((x) => <th key={x}>{x}</th>)}</tr></thead>
            <tbody>
              {CARDS.rows.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}<span>{r.role}</span></td>
                  {r.rank.map((p) => <td key={p} className={p === hl ? 'h' : ''} onMouseEnter={() => setHl(p)}>{p}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="tt-chips">
            {CARDS.problems.map((p) => <button key={p} className={`chip${p === hl ? ' on' : ''}`} onClick={() => setHl(p)} onMouseEnter={() => setHl(p)}>{p}</button>)}
            <button className="tt-link" onClick={() => setAvg((a) => !a)}>{avg ? '← back to the grid' : 'show average →'}</button>
          </div>
        </div>
        <div className="tt-sort-r">
          <div className="tt-small">average rank (lower = bigger problem)</div>
          {averages.map(({ p, v }, i) => (
            <div key={p} className={`tt-avg${p === hl ? ' on' : ''}${i === 0 ? ' top' : ''}`} onMouseEnter={() => setHl(p)}>
              <span>{CARDS.full[p]} · {v.toFixed(1)}</span>
              <i><em style={{ width: on ? `${((5 - v) / 4) * 100}%` : 0, transitionDelay: `${i * 0.1}s` }} /></i>
            </div>
          ))}
          <div className="tt-big"><span><CountUp value={5} on={on} />/5</span>put washrooms first</div>
          <p className="tt-small" style={{ marginTop: 12 }}>{CARDS.parkingNote}</p>
          <div className="tt-cust">
            <div className="tt-small">{CARDS.customers.q}</div>
            <div className="tt-cust-bars">
              {CARDS.customers.bars.map((b, i) => (
                <div key={b.name} className={i === 0 ? 'on' : ''}><i style={{ height: on ? `${(b.first / 5) * 100}%` : 0 }} /><span>{b.name} · {b.first}/5</span></div>
              ))}
            </div>
            <p className="tt-line small">{CARDS.customers.line}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Insights() {
  const [hover, setHover] = useState(null);
  const [ref, seen] = useInView(0.5);
  return (
    <Section id="insights" label="insights.">
      <p className="body-copy">What we saw on the surface, and what was actually going on.</p>
      <div className="tt-insights" ref={ref}>
        {INSIGHTS.map((ins, i) => {
          const on = hover === i;
          return (
            <div key={ins.n} className={`tt-card tt-ins${on ? ' on' : ''}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setHover(on ? null : i)}>
              <div className="tt-ins-surface"><span className="tt-small">on the surface</span><br /><Pen kind="strike" on={on}>“{ins.surface}”</Pen></div>
              <div className="tt-ins-under"><span className="tag">underneath</span><p>{ins.under}</p></div>
              <div className="tt-card-n">{ins.n} / <Pen on={seen}>{ins.title}</Pen></div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// cover + 7 spreads (split into 14 pages) + back cover
const ZINE_PAGES = Array.from({ length: 16 }, (_, i) => `/images/thela/zine/${String(i + 1).padStart(2, '0')}.jpg`);

function Outcome() {
  return (
    <Section id="outcome" label="outcome.">
      <p className="body-copy">{OUTCOME.copy}</p>
      <div className="tt-senses">
        {OUTCOME.senses.map((s) => <div key={s.tag} className="tt-card"><span className="tag">{s.tag}</span><p>{s.text}</p></div>)}
      </div>
      <div className="tt-zine"><FlipBook pages={ZINE_PAGES} ratio={1000 / 1414} label="Thela, Thaila, Thikana zine" /></div>
    </Section>
  );
}

// small floating section index, appears once you're past the hero
const PROGRESS = [['context', 'context'], ['people', 'people'], ['research', 'research'], ['insights', 'insights'], ['outcome', 'outcome']];
function Progress() {
  const [cur, setCur] = useState(null);
  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.4;
      let c = null;
      PROGRESS.forEach(([id]) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < mid) c = id; });
      const out = document.querySelector('.thela .project-nav')?.getBoundingClientRect().top < window.innerHeight * 0.8;
      setCur(out ? null : c);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav className={`tt-progress${cur ? ' on' : ''}`} aria-label="Sections">
      {PROGRESS.map(([id, name]) => (
        <button key={id} className={cur === id ? 'cur' : ''} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}>{name}</button>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ page */

export default function ThelaThailaThikana() {
  useTitle('Thela, Thaila, Thikana');
  const heroRef = useRef(null);
  const baselineRef = useRef(null);
  useTitleBaseline(heroRef, baselineRef);

  return (
    <div className="page inclusive thela">
      <GridLines />
      <Header fixed />

      <section className="project-hero grid-row" ref={heroRef}>
        <h1 className="project-title">
          {META.title}
          <span className="baseline-marker" ref={baselineRef} aria-hidden="true" />
        </h1>
        <Media className="hero-media" {...META.hero} />
        <div className="project-meta">
          {META.meta.map(([k, v]) => (
            <div className="meta-item" key={k}><span className="meta-label">{k}</span><span className="meta-value">{v}</span></div>
          ))}
          <span className="meta-year">{META.year}</span>
        </div>
      </section>

      <Tldr />
      <Market />
      <People />
      <Question />
      <Methods />
      <Interviews />
      <Personas />
      <Stakeholders />
      <Day />
      <Shadowing />
      <CardSort />
      <Insights />
      <Outcome />

      <section className="project-nav grid-row">
        <Link className="prev-project underline-right-left" to={NAV.prev.to}>
          <span className="nav-label">← previous project</span>
          <span className="nav-title"><ScrambleText text={NAV.prev.title} hover /></span>
        </Link>
        <Link className="next-project underline-left-right" to={NAV.next.to}>
          <span className="nav-label">next project →</span>
          <span className="nav-title"><ScrambleText text={NAV.next.title} hover /></span>
        </Link>
      </section>

      <Footer />
      <Progress />
    </div>
  );
}
