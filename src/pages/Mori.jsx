import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GridLines from '../components/GridLines';
import ScrambleText from '../components/ScrambleText';
import { SectionPill, TldrCards } from '../components/CaseStudyKit';
import './InclusiveNavigation.css'; // shares the case-study layout
import useInView from '../hooks/useInView';
import './Mori.css';
import useTitle from '../hooks/useTitle';

// ======================= edit the case study here =======================
// Images live in public/images/mori/. [brackets] = still to fill in.

const IMG = (f) => `/images/mori/${f}`;

const CONTENT = {
  title: 'Mori',
  hero: IMG('hero.jpg'),
  meta: [
    ['My role:', 'Brand Identity'],
    ['Type:', 'Individual project'],
  ],
  year: '2025',

  // tl;dr cards; `mark` gets the red pen (circled on the middle card)
  tldr: [
    { n: '01', title: 'what it is', text: 'A brand identity for Mori, a matcha café.', mark: 'brand identity' },
    { n: '02', title: 'the name', text: '森, mori, means forest in Japanese: slow, green and grounded.', mark: 'forest' },
    { n: '03', title: 'what we made', text: 'A logo, colours, icons, type, packaging and print, all brewed from the tea itself.', mark: 'brewed from the tea itself' },
  ],

  name: 'Mori means forest, written 森 in Japanese. The name sets the mood for everything else: calm, green and a little bit of nature in a cup.',

  logo: 'Soft, rounded letters that look like they\'ve been poured.',

  // colours: [name, hex, colour the logo takes on top of it]
  colours: [
    ['matcha', '#98A97B', '#F4EEDC'],
    ['moss', '#6F7F4E', '#F4EEDC'],
    ['cream', '#F4EEDC', '#6F7F4E'],
    ['tile blue', '#B7CFE3', '#6F7F4E'],
    ['blush', '#F1D1D9', '#6F7F4E'],
  ],
  colourNote: 'Five colours: three greens and creams from the tea, plus tile blue and blush.',

  type: {
    name: 'Laila',
    note: 'The typeface used on the packaging labels.',
    sample: 'Yuzu Matcha Powder',
  },

  icons: 'Three tools of a matcha ceremony: the whisk (chasen), its stand and the bowl (chawan). Used as stamps, stickers and on the loyalty card.',

  prev: { title: 'How to be Human', to: '/work/how-to-be-human' },
  next: { title: 'AlignR', to: '/work/alignr' },
};
// ========================================================================

function Section({ id, label, className = 'section', children }) {
  return (
    <section id={id} className={`${className} grid-row`}>
      <div className="label">{label}</div>
      {children}
    </section>
  );
}

function useTitleBaseline(heroRef, markerRef) {
  useLayoutEffect(() => {
    const measure = () => {
      const hero = heroRef.current;
      const marker = markerRef.current;
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

// the wordmark on a coloured panel; click the panel to "whisk" up some foam
// construction lines over the wordmark (in the wordmark's own units: 547 × 151)
function Guides() {
  const H = [0, 24, 86, 148];            // i-dot top, x-height, middle, baseline
  const V = [0, 230, 360, 491, 547];     // letter edges
  return (
    <svg className="mo-guides" viewBox="0 0 547 151" aria-hidden="true">
      {H.map((y) => <line key={`h${y}`} x1="-700" x2="1250" y1={y} y2={y} pathLength="1" />)}
      {V.map((x) => <line key={`v${x}`} x1={x} x2={x} y1="-400" y2="560" pathLength="1" />)}
      <circle cx="292" cy="86" r="63" pathLength="1" />
      <circle cx="519" cy="19" r="20" pathLength="1" />
      {V.flatMap((x) => [24, 148].map((y) => <rect key={`p${x}-${y}`} className="pt" x={x - 2.5} y={y - 2.5} width="5" height="5" />))}
    </svg>
  );
}

function LogoStage({ bg, fg, className = '', guides = false }) {
  const [foam, setFoam] = useState([]);
  const [ref, seen] = useInView(0.5);
  const whisk = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const now = Date.now();
    const bubbles = Array.from({ length: 7 }, (_, i) => ({
      id: `${now}-${i}`,
      size: 20 + Math.random() * 60,
      x: e.clientX - r.left + (Math.random() - 0.5) * 140,
      y: e.clientY - r.top + (Math.random() - 0.5) * 90,
      delay: i * 60,
    }));
    setFoam((f) => [...f, ...bubbles]);
    setTimeout(() => setFoam((f) => f.filter((b) => !bubbles.includes(b))), 1700);
  };
  return (
    <div ref={ref} className={`mo-stage ${className}${seen ? ' seen' : ''}`} style={{ background: bg }} onClick={whisk}>
      <div className="mo-mark" style={{ color: fg }}>
        <div className="mo-wordmark" style={{ background: fg }} role="img" aria-label="Mori wordmark" />
        {guides && <Guides />}
      </div>
      {foam.map((b) => (
        <span key={b.id} className="mo-foam" style={{ width: b.size, height: b.size, left: b.x - b.size / 2, top: b.y - b.size / 2, animationDelay: `${b.delay}ms` }} />
      ))}
    </div>
  );
}

const PILL = [['name', 'name'], ['logo', 'logo'], ['colour', 'colour'], ['type', 'type'], ['in-use', 'in use']];

export default function Mori() {
  useTitle('Mori');
  const c = CONTENT;
  const heroRef = useRef(null);
  const baselineRef = useRef(null);
  useTitleBaseline(heroRef, baselineRef);
  const [pick, setPick] = useState(0);
  const [, bg, fg] = c.colours[pick];

  return (
    <div className="page inclusive mori">
      <GridLines />
      <Header fixed />

      <section className="project-hero grid-row" ref={heroRef}>
        <h1 className="project-title">
          {c.title}
          <span className="baseline-marker" ref={baselineRef} aria-hidden="true" />
        </h1>
        <img className="hero-media media-img" src={c.hero} alt="Mori wordmark over a bowl of matcha being whisked" />
        <div className="project-meta">
          {c.meta.map(([k, v]) => (
            <div className="meta-item" key={k}>
              <span className="meta-label">{k}</span>
              <span className="meta-value">{v}</span>
            </div>
          ))}
          <span className="meta-year">{c.year}</span>
        </div>
      </section>

      <Section id="tldr" label="tl;dr."><TldrCards cards={c.tldr} /></Section>

      <Section id="name" label="the name.">
        <div className="mo-name">
          <div className="mo-kanji" title="mori · forest">森</div>
          <div>
            <p className="mo-copy">{c.name}</p>
            <p className="mo-trees"><span>森</span><span>mori</span><span>forest</span></p>
          </div>
        </div>
      </Section>

      {/* lookbook moment: the packaging, big */}
      <section className="mo-look grid-row">
        <div className="mo-cap"><b>packaging</b>yuzu matcha, 30g</div>
        <img className="mo-big" src={IMG('packaging.jpg')} alt="Two Mori matcha bottles, green and cream labels" loading="lazy" />
      </section>

      <Section id="logo" label="the logo.">
        <div className="mo-block">
          <LogoStage bg={bg} fg={fg} guides />
          <p className="mo-hint">{c.logo} <i>Hover to hide the guides, click to whisk.</i></p>
        </div>
      </Section>

      <Section id="colour" label="colour.">
        <div className="mo-block">
          <p className="mo-copy">{c.colourNote} Click a colour to see the logo in it.</p>
          <div className="mo-palette">
            {c.colours.map(([name, hex, on], i) => (
              <button key={hex} className={`mo-swatch${i === pick ? ' on' : ''}`} style={{ background: hex, color: on }} onClick={() => setPick(i)}>
                <b>{name}</b>{hex}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section id="type" label="type.">
        <div className="mo-block mo-type">
          <div className="mo-type-big">Aa</div>
          <div className="mo-type-r">
            <div className="mo-type-name">{c.type.name}</div>
            <div className="mo-type-sample">{c.type.sample}</div>
            <div className="mo-type-chars">abcdefghijklm nopqrstuvwxyz<br />0123456789 · 30g · Uji, Kyoto</div>
            <p className="mo-hint">{c.type.note}</p>
          </div>
        </div>
      </Section>

      <Section label="icons.">
        <div className="mo-block">
          <img className="mo-icons" src={IMG('icons.jpg')} alt="Icons: whisk, whisk stand and bowl" loading="lazy" />
          <p className="mo-hint">{c.icons}</p>
        </div>
      </Section>

      {/* lookbook rows: the identity in use */}
      <section id="in-use" className="mo-look grid-row mo-pair">
        <img className="mo-a" src={IMG('loyalty-card.jpg')} alt="Mori loyalty card" loading="lazy" />
        <img className="mo-b" src={IMG('posters.jpg')} alt="Mori posters on a tiled café wall" loading="lazy" />
        <div className="mo-cap mo-cap-r"><b>print</b>loyalty card &amp; posters</div>
      </section>
      <section className="mo-look grid-row mo-pair2">
        <div className="mo-cap"><b>the cup</b>takeaway</div>
        <img className="mo-c" src={IMG('cup.jpg')} alt="Mori takeaway cup" loading="lazy" />
        <LogoStage bg={bg} fg={fg} className="mo-d" />
      </section>

      <section className="project-nav grid-row">
        <Link className="prev-project underline-right-left" to={c.prev.to}>
          <span className="nav-label">← previous project</span>
          <span className="nav-title"><ScrambleText text={c.prev.title} hover /></span>
        </Link>
        <Link className="next-project underline-left-right" to={c.next.to}>
          <span className="nav-label">next project →</span>
          <span className="nav-title"><ScrambleText text={c.next.title} hover /></span>
        </Link>
      </section>

      <SectionPill items={PILL} />
      <Footer />
    </div>
  );
}
