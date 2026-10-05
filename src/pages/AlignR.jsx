import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GridLines from '../components/GridLines';
import ScrambleText from '../components/ScrambleText';
import { Ink, Media, SectionPill, TldrCards } from '../components/CaseStudyKit';
import PostureDemo from './alignr/PostureDemo';
import ExploreIllo from './alignr/ExploreIllo';
import './InclusiveNavigation.css'; // shares the case-study layout
import './AlignR.css';
import useTitle from '../hooks/useTitle';

// ======================= edit the case study here =======================
// Images go in public/images/alignr/. To fill a placeholder, give it an
// `image` (or `video`), e.g. hero: { image: '/images/alignr/patch.jpg' }.
// [brackets] = still to fill in.

const CONTENT = {
  title: 'AlignR',
  hero: { image: '/images/alignr/poster-square.jpg', alt: 'AlignR poster: front view, side view and upper back placement of the device' },
  meta: [
    ['Team:', '5 people'],
    ['My role:', 'Electronics & Code'],
    ['Timeline:', '3 weeks'],
  ],
  year: '2025',

  // tl;dr cards; `mark` gets the red pen (circled on the middle card)
  tldr: [
    { n: '01', title: 'what it is', text: 'A small wearable that sticks to your upper back and notices when you slouch.', mark: 'notices when you slouch' },
    { n: '02', title: 'what we found', text: "Posture isn't ignored, it's unnoticed. People don't fix it because they don't feel it change.", mark: 'unnoticed' },
    { n: '03', title: 'what it does', text: 'A gentle buzz when a slouch lasts too long, so good posture becomes a habit, not an effort.', mark: 'a habit, not an effort' },
  ],

  context: 'This project came out of a design module that asked us to find a common, easy-to-miss problem and design something that works. We looked at everyday physical habits, and kept coming back to one: how we sit. Hours at a desk have made slouching normal. That isn\'t because people don\'t care. It\'s because nobody notices the moment it happens.',
  contextMarks: ['nobody notices the moment it happens'],

  problem: "Poor posture builds up quietly. You start upright, lean in to read something, and twenty minutes later you're folded over your keyboard without ever deciding to be. The solutions that exist mostly fall into three groups: braces that feel bulky, apps that are easy to swipe away, and advice that only works if you keep remembering it.",

  challenge: 'How might we help desk-bound people notice their posture as it happens, so they can avoid long-term back problems without it getting in the way of their work?',
  challengeMarks: ['notice their posture as it happens'],

  audience: [
    ['mainly', ['desk workers', 'office professionals', 'students']],
    ['also', ['gamers', 'older users']],
  ],
  audienceNote: 'Anyone who sits for hours at a time.',

  insight: "Posture is not ignored, it's unnoticed.",
  insightMore: "So the design didn't need to lecture anyone. It just needed to make an invisible habit visible at the right moment.",

  explorationsIntro: 'We tried two ways of keeping the sensor on the body before landing on the third.',
  explorations: [
    { tag: 'tried', title: 'Neckband', text: "It rested around the neck, close to the upper spine, but it didn't stay in contact with the body. Every time you leaned or turned it lifted away, so the sensor was tracking the band instead of your back.", why: "didn't stay in contact", illo: 'neckband' },
    { tag: 'tried', title: 'Strapped module', text: 'A module held against the back with straps. It kept the sensor in place, but the straps restricted movement.', why: 'restricted movement', illo: 'strap' },
    { tag: 'final', title: 'Adhesive patch', text: "A small patch that sticks directly to the upper back with silicone adhesive. It stays pressed against the spine whichever way you move, and there's nothing to strap on or adjust.", illo: 'patch' },
  ],

  outcome: "AlignR is a small device worn on the upper back. It tracks the angle of your spine as you sit, recognises when you've slouched for a while, and nudges you upright with a quick buzz. There's no screen to check and no app to open; it just quietly lets you know.",
  // 3D renders of the casing: closed, top, and opened up to show the inside
  renders: [1, 2, 3, 4, 5, 6].map((n) => `/images/alignr/render-${n}.jpg`),

  howIntro: 'Inside is an MPU6050, a small motion sensor that measures tilt and rotation. Try it: drag the figure (or use the slider) to slouch, and hold it there.',
  howClosing: "The calibration and the 6-second wait are what keep it from nagging. It reacts to real slouches, not every movement.",
  video: '-rb_0nzve3Y', // YouTube id of the walkthrough

  prev: { title: 'Mori', to: '/work/mori' },
  next: { title: 'Kakori Kaand', to: '/work/kakori-kaand' },
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

const PILL = [['context', 'context'], ['problem', 'problem'], ['explorations', 'explorations'], ['how', 'how it works']];

export default function AlignR() {
  useTitle('AlignR');
  const c = CONTENT;
  const heroRef = useRef(null);
  const baselineRef = useRef(null);
  useTitleBaseline(heroRef, baselineRef);

  return (
    <div className="page inclusive alignr">
      <GridLines />
      <Header fixed />

      <section className="project-hero grid-row" ref={heroRef}>
        <h1 className="project-title">
          {c.title}
          <span className="baseline-marker" ref={baselineRef} aria-hidden="true" />
        </h1>
        <Media className="hero-media" {...c.hero} />
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
      <Section id="context" label="context."><Ink className="body-copy" text={c.context} marks={c.contextMarks} /></Section>
      <Section id="problem" label="the problem."><p className="body-copy">{c.problem}</p></Section>
      <Section label="the challenge." className="research-question">
        <Ink className="rq-copy" text={c.challenge} marks={c.challengeMarks} />
      </Section>

      <Section label="who it's for.">
        <div className="ar-aud">
          {c.audience.map(([k, list]) => (
            <div key={k} className="ar-aud-row">
              <span className="ar-aud-k">{k}</span>
              <div className="ar-chips">{list.map((x) => <span key={x} className="ar-chip">{x}</span>)}</div>
            </div>
          ))}
          <p className="ar-note">{c.audienceNote}</p>
        </div>
      </Section>

      <Section label="insight.">
        <div className="ar-insight">
          <Ink as="p" className="ar-insight-big" text={c.insight} marks={['unnoticed']} />
          <p className="body-copy ar-insight-more">{c.insightMore}</p>
        </div>
      </Section>

      <Section id="explorations" label="explorations.">
        <div className="ar-ex">
          <p className="ar-ex-intro">{c.explorationsIntro}</p>
          <div className="ar-ex-cards">
            {c.explorations.map((e, i) => (
              <div key={e.title} className={`ar-ex-card${e.tag === 'final' ? ' final' : ''}`}>
                {e.illo ? <ExploreIllo kind={e.illo} /> : <Media className="ar-ex-media" {...e.media} />}
                <div className="ar-ex-body">
                  <span className={`ar-tag${e.tag === 'final' ? ' on' : ''}`}>{String(i + 1).padStart(2, '0')} / {e.tag}</span>
                  <p className="ar-ex-title">{e.title}</p>
                  <p className="ar-ex-text">{e.text}</p>
                  {e.why && <span className="ar-why">✕ {e.why}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="outcome" label="outcome.">
        <p className="body-copy">{c.outcome}</p>
        <div className="ar-renders">
          {c.renders.map((src, i) => <img key={src} src={src} alt={`3D render of the AlignR casing, view ${i + 1}`} loading="lazy" />)}
        </div>
      </Section>

      <Section id="how" label="how it works.">
        <p className="body-copy">{c.howIntro}</p>
        <PostureDemo />
        <p className="body-copy ar-closing">{c.howClosing}</p>
      </Section>

      <section className="media-block grid-row">
        <iframe
          className="ar-video"
          src={`https://www.youtube-nocookie.com/embed/${c.video}?rel=0`}
          title="AlignR walkthrough video"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
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
