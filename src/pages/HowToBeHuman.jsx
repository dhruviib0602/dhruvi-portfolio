import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GridLines from '../components/GridLines';
import ScrambleText from '../components/ScrambleText';
import FlipBook from '../components/FlipBook';
import './InclusiveNavigation.css'; // shares the case-study layout
import './HowToBeHuman.css';
import useTitle from '../hooks/useTitle';

// ======================= edit the case study here =======================
// Zine pages live in public/images/how-to-be-human/01.jpg … 32.jpg
// (front cover first, back cover last). Delete any section below by
// removing its text here and its block further down.

const PAGE_COUNT = 32;
// pages visitors can draw on with the little pen (nothing is saved)
const DOODLE_PAGES = [21]; // "doodle your hearts out here"

const PAGES = Array.from({ length: PAGE_COUNT }, (_, i) => `/images/how-to-be-human/${String(i + 1).padStart(2, '0')}.jpg`);

const CONTENT = {
  title: 'How to be Human',
  cover: '/images/how-to-be-human/01.jpg',
  meta: [
    ['Role:', 'Graphic Design'],
    ['Team:', 'Individual'],
  ],
  year: '2025',

  about: [
    'This zine is my playful take on the idea that humans need a manual.',
    'I turned all the confusing, funny and chaotic parts of life into a set of fake instructions.',
    "It's part satire, part self roast and part reminder that no one really knows what they're doing.",
    "Mostly, it's just me having fun with the idea of teaching people how to be human.",
  ],

  origin: "It started with a simple thought: everything comes with a manual except us. Appliances, furniture, even toothpaste has instructions. Life doesn't. So I wrote one. Or rather, not a guidebook on how to survive in the era of validation, overstimulation, and a very bad sleep schedule.",

  closing: "bro, it's not that deep.",

  prev: { title: 'Thela, Thaila, Thikana', to: '/work/thela-thaila-thikana' },
  next: { title: 'Mori', to: '/work/mori' },
};
// ========================================================================

// same as the Inclusive Navigation page: the cover starts on the
// baseline of the title's last line
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

function Section({ label, className = 'section', children }) {
  return (
    <section className={`${className} grid-row`}>
      <div className="label">{label}</div>
      {children}
    </section>
  );
}

export default function HowToBeHuman() {
  useTitle('How to be Human');
  const c = CONTENT;
  const heroRef = useRef(null);
  const baselineRef = useRef(null);
  useTitleBaseline(heroRef, baselineRef);

  return (
    <div className="page inclusive human">
      <GridLines />
      <Header fixed />

      <section className="project-hero grid-row" ref={heroRef}>
        <h1 className="project-title">
          {c.title}
          <span className="baseline-marker" ref={baselineRef} aria-hidden="true" />
        </h1>
        <img className="hero-media media-img" src={c.cover} alt="How to be Human zine, front cover" />
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

      <Section label="about.">
        <div className="about-lines">
          {c.about.map((line) => <p key={line}>{line}</p>)}
        </div>
      </Section>

      <Section label="where it came from."><p className="body-copy">{c.origin}</p></Section>

      <section className="zine-block grid-row">
        <div className="zine-wrap">
          <FlipBook pages={PAGES} ratio={1119 / 1588} label="How to be Human zine" drawPages={DOODLE_PAGES} />
        </div>
      </section>

      <section className="closing grid-row">
        <p>{c.closing}</p>
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

      <Footer />
    </div>
  );
}
