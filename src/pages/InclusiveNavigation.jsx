import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GridLines from '../components/GridLines';
import ScrambleText from '../components/ScrambleText';
import { Ink, SectionPill, Stats, TldrCards } from '../components/CaseStudyKit';
import WayfindingMap from './inclusive/WayfindingMap';
import Observations from './inclusive/Observations';
import { TokenCards, RailPlan } from './inclusive/OutcomeVisuals';
import './InclusiveNavigation.css';
import useTitle from '../hooks/useTitle';

// ======================= edit the case study here =======================
// To swap a placeholder for a real image, put the file in
// public/images/inclusive-navigation/ and set its `image` path, e.g.
//   hero: { image: '/images/inclusive-navigation/corridor.jpg', label: … }

const IMG = (f) => `/images/inclusive-navigation/${f}`;

const CONTENT = {
  title: 'Inclusive Navigation for Neurodivergent Children',
  hero: { image: IMG('poster-square.jpg'), alt: 'Inclusive Navigation poster: a child walking down a corridor following floor symbols' },
  meta: [
    ['Team:', '5 people'],
    ['My role:', 'Research / Concept Design'],
    ['Timeline:', '2 weeks'],
  ],
  year: '2025',

  // tl;dr as three cards; `mark` gets the red pen (circled on the middle card)
  tldrCards: [
    { n: '01', title: 'what we studied', text: 'How neurodivergent children find their way around school, from interviews with kids, parents and therapists.', mark: 'find their way around school' },
    { n: '02', title: 'what we found', text: 'Adults step in before kids get the chance to try, and overwhelm hits hardest in the in-between spaces, not the classroom.', mark: 'in-between spaces' },
    { n: '03', title: 'what we made', text: 'A system of colour, symbols and a sensory support room that makes getting around school feel calmer and more independent.', mark: 'calmer and more independent' },
  ],

  tldr: 'A study of how neurodivergent children navigate school — through interviews with kids, parents, and therapists, and visits to real classrooms — that led to a system of colour, symbols, and a sensory support room, built to make getting around school feel calmer and more independent.',

  overview: 'Neurodivergent children move through school every day — corridors, classrooms, playgrounds — spaces most of us stop noticing after the first week. But for a child who processes sound, light, and space differently, those same corridors can be genuinely hard to be in. Our goal was to understand what navigation actually feels like for these kids, not just where they get lost, and to design a system that makes school feel less overwhelming and more like a place they can move through on their own.',

  question: 'How can spatial, sensory, and visual cues be designed into a school so that neurodivergent children stop depending on an adult to help them navigate it?',

  process: [
    'We started broad, looking at everyone who struggles with navigation — people with physical mobility challenges, people with cognitive differences — before narrowing in on neurodivergent children specifically, and schools as the one place they can\'t opt out of.',
    'From there, we went into the field. We visited schools and occupational therapy centres and spoke with doctors, therapists, parents, and the children themselves — 19 people in total, including 5 kids directly. We asked kids what parts of their day feel hard, what sounds or lights bother them, what helps them calm down. We asked parents what their child\'s mornings look like, and what a good day versus a bad day is made of. We asked teachers how they already adapt their classrooms, and where they run out of ideas.',
    'Alongside the interviews, we ran spatial surveys of an actual school — Global International School — mapping its corridors, staircases, and classrooms to see how the existing navigation system was working for the kids who use it every day.',
    'Everything we heard and saw got grouped using affinity mapping, sorted into recurring themes, and each theme was pushed until it became something we could actually design for, not just a description of a problem.',
  ],

  // numbers under the process (they count up on scroll)
  stats: [
    { value: 19, label: 'people interviewed' },
    { value: 5, label: 'of them children' },
    { value: 1, label: 'school mapped in detail' },
    { value: 2, label: 'weeks' },
  ],

  // red-pen underlines: each phrase must appear exactly in its paragraph
  marks: {
    tldr: ['calmer and more independent'],
    overview: ['what navigation actually feels like'],
    question: ['stop depending on an adult'],
    closing: ['inclusive by default'],
  },

  // four small field-research photos
  fieldPhotos: [
    { image: IMG('field-classroom.jpg'), where: 'school visit', alt: 'A primary classroom with small coloured desks' },
    { image: IMG('field-ramp.jpg'), where: 'school visit', alt: 'A ramp and stairs between floors' },
    { image: IMG('field-corridor.jpg'), where: 'school visit', alt: 'A long corridor with a staircase at the end' },
    { image: IMG('field-therapy.jpg'), where: 'therapy centre', alt: 'Toys and puzzles on a shelf at an occupational therapy centre' },
  ],
  fieldCaption: 'From our field visits: Global International School and an occupational therapy centre.',

  // "what we saw": the wayfinding problems we circled at the school
  observationsIntro: 'Walking through the school, we circled every spot where finding your way broke down.',
  observations: [
    { title: 'The ceiling and floor have zero guidance', photos: ['ceiling-1', 'ceiling-2', 'floor-1', 'floor-2'] },
    { title: 'Signs are text-heavy and too far', photos: ['sign-1', 'sign-2', 'sign-3', 'sign-4'] },
    { title: 'Doors and rooms look too similar', photos: ['door-1'] },
  ].map((g) => ({ ...g, photos: g.photos.map((p) => ({ image: IMG(`obs-${p}.jpg`), alt: `${g.title} (photo from the school visit)` })) })),

  insights: [
    ['Independence is rarely offered. It\'s assumed away.', 'Adults consistently step in to guide or help, assuming a child can\'t manage alone. It comes from care, not neglect, but it quietly removes the exact experiences that would let a child build confidence and find their own way.'],
    ['The school isn\'t broken. It\'s just built for one kind of learner.', 'Identical corridors, unannounced layout changes, and crowded intersections aren\'t obstacles to a neurotypical child. To a child who relies on routine and visual structure, they\'re invisible walls.'],
    ['Overwhelm doesn\'t wait for a hard moment. It hits in the in-between ones.', 'The classroom or the playground rarely caused the most distress. It was the transition spaces, assembly lines, crowded bag racks, sudden shifts between activities, where overstimulation could spike without warning, and without anyone seeing it coming.'],
  ],

  concept: null, // add { image: IMG('concept.jpg') } to show an overview image here

  outcomeIntro: 'We designed a navigation and support system built around visual cues instead of verbal instruction, made up of four parts that work together.',
  outcome: [
    { title: 'Visual token matching', visual: 'tokens', desc: 'Every space in the school — classrooms, the library, the playground, support rooms — gets its own simple symbol. A child picks the badge for where they\'re headed, carries it along the route, and places it on a matching board when they arrive. No verbal instructions to process, no one to ask — just a symbol to follow and a small, physical action to complete.' },
    { title: 'Colour-coded pathways', image: IMG('outcome-paths.jpg'), fit: 'contain', alt: 'A school corridor with coloured route lines on the floor', desc: 'Floors, walls, or ceilings carry colour-based routes tied to categories of space, so a child who thinks visually always has a consistent cue to orient by, without singling anyone out. Every student benefits from it, which is part of the point.' },
    { title: 'A guiding rail for overwhelm', visual: 'rail', desc: 'When a child is too overwhelmed to process visual cues at all, a rail or sturdy thread along the wall leads them directly to a helper or the sensory regulation room. Nothing to read, nothing to decide — just something to hold and follow.' },
    { title: 'A sensory regulation room', desc: 'A calm space with soft seating, adjustable lighting, weighted materials, and calming textures, always staffed by a trained adult, where a child can rest until they\'re ready to go back to class.' },
  ],
  outcomeClosing: 'The whole system is meant to be inclusive by default rather than a special accommodation bolted on afterward — usable by every student, easy for a school to maintain, and adaptable to different building layouts.',

  prev: { title: 'Kakori Kaand', to: '/work/kakori-kaand' },
  next: { title: 'Thela, Thaila, Thikana', to: '/work/thela-thaila-thikana' },
};
// ========================================================================

// Dashed placeholder box — or the real image once `image` is set.
function Media({ className, image, label = 'image placeholder', sub, alt = '' }) {
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

// "label." on the left, content on the right — the pattern every section uses.
function Section({ id, label, className = 'section', children }) {
  return (
    <section id={id} className={`${className} grid-row`}>
      <div className="label">{label}</div>
      {children}
    </section>
  );
}

// Measures where the title's LAST line of text sits (its baseline) and hands
// that to the CSS as --title-baseline, so the hero image starts exactly
// there — even if the title wraps onto more lines or its wording changes.
function useTitleBaseline(heroRef, markerRef) {
  useLayoutEffect(() => {
    const measure = () => {
      const hero = heroRef.current;
      const marker = markerRef.current;
      if (!hero || !marker) return;
      const title = marker.parentElement.getBoundingClientRect();
      const baseline = marker.getBoundingClientRect().bottom;
      hero.style.setProperty('--title-baseline', `${baseline - title.top}px`);
    };
    measure();
    document.fonts?.ready.then(measure); // Jost changes the line positions once loaded
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [heroRef, markerRef]);
}

const PILL = [['overview', 'overview'], ['process', 'research'], ['observations', 'what we saw'], ['insights', 'insights'], ['outcome', 'outcome']];

export default function InclusiveNavigation() {
  useTitle('Inclusive Navigation');
  const c = CONTENT;
  const heroRef = useRef(null);
  const baselineRef = useRef(null);
  useTitleBaseline(heroRef, baselineRef);

  return (
    <div className="page inclusive">
      <GridLines />
      <Header fixed />

      <section className="project-hero grid-row" ref={heroRef}>
        <h1 className="project-title">
          {c.title}
          {/* zero-size marker that sits on the last line's baseline */}
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

      <Section id="tldr" label="tl;dr."><TldrCards cards={c.tldrCards} /></Section>
      <Section id="overview" label="overview."><Ink className="body-copy" text={c.overview} marks={c.marks.overview} /></Section>
      <Section label="research question." className="research-question">
        <Ink className="rq-copy" text={c.question} marks={c.marks.question} />
      </Section>
      <Section id="process" label="process." className="process">
        <div className="process-copy">
          {c.process.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <Stats className="in-stats" items={c.stats} />
      </Section>

      <section className="media-block grid-row">
        <div className="field-photos">
          {c.fieldPhotos.map((m, i) => (
            <figure key={i} className="field-fig">
              <Media className="field-photo" {...m} />
              <span className="field-tag">{m.where}</span>
            </figure>
          ))}
        </div>
        <p className="field-cap">{c.fieldCaption}</p>
      </section>

      <Section id="observations" label="what we saw.">
        <p className="body-copy in-obs-intro">{c.observationsIntro}</p>
        <Observations groups={c.observations} />
      </Section>

      <Section id="insights" label="insights." className="insights">
        <div className="insights-list">
          {c.insights.map(([title, desc]) => (
            <div className="insight-row" key={title}>
              <p className="insight-title">{title}</p>
              <p className="insight-desc">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {c.concept && (
        <section className="media-block grid-row">
          <Media className="media-placeholder" {...c.concept} />
        </section>
      )}

      <Section id="outcome" label="outcome." className="outcome">
        <p className="outcome-intro">{c.outcomeIntro}</p>
        <WayfindingMap />
        <div className="stacked-rows">
          {c.outcome.map((o) => (
            <div className="insight-row" key={o.title}>
              <p className="insight-title">{o.title}</p>
              <p className="insight-desc">{o.desc}</p>
              {o.visual === 'tokens' && <TokenCards />}
              {o.visual === 'rail' && <RailPlan />}
              {o.image && <Media className={`outcome-media${o.fit === 'contain' ? ' contain' : ''}`} image={o.image} alt={o.alt} />}
            </div>
          ))}
        </div>
        <Ink className="outcome-closing" text={c.outcomeClosing} marks={c.marks.closing} />
      </Section>

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
