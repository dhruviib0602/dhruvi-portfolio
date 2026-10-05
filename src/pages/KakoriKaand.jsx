import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GridLines from '../components/GridLines';
import ScrambleText from '../components/ScrambleText';
import { Ink, SectionPill, Compare, Media, TldrCards } from '../components/CaseStudyKit';
import './InclusiveNavigation.css'; // shares the case-study layout
import './KakoriKaand.css';
import useTitle from '../hooks/useTitle';

// ======================= edit the case study here =======================
// Videos / images go in public/images/kakori-kaand/. To fill a placeholder,
// give it a `video` (mp4/webm — plays muted on loop) or an `image`, e.g.
//   hero: { video: '/images/kakori-kaand/walkthrough.mp4', label: … }

const IMG = (f) => `/images/kakori-kaand/${f}`;

const CONTENT = {
  title: 'Kakori Kaand',
  hero: { image: IMG('poster-square.jpg'), alt: 'Kakori Kaand poster: a person in a VR headset above a 1925 steam train' },
  meta: [
    ['Team:', '5 people'],
    ['My role:', '3D Modelling & Environment Design'],
    ['Timeline:', '2 weeks'],
  ],
  year: '2025',

  // tl;dr as three cards; `mark` gets the red pen (circled on the middle card)
  tldrCards: [
    { n: '01', title: 'what it is', text: "A VR simulation of the 1925 Kakori train robbery, one of the boldest acts of India's freedom struggle.", mark: '1925 Kakori train robbery' },
    { n: '02', title: 'who you are', text: 'A fictional fifth revolutionary: a clumsy but well-meaning recruit trusted with small, critical tasks.', mark: 'fifth revolutionary' },
    { n: '03', title: 'what you feel', text: 'The pressure of the mission, firsthand. History you live through, not just read about.', mark: 'firsthand' },
  ],

  tldr: 'A VR simulation that puts you inside the 1925 Kakori train robbery as a fictional fifth revolutionary: a slightly clumsy but well-meaning recruit who follows orders, fumbles through small but critical tasks, and feels the pressure of the mission firsthand.',

  whatItIs: "Kakori Kaand is an immersive VR simulation of the 1925 Kakori train robbery, one of the boldest acts of India's freedom struggle. You play a fictional fifth revolutionary, working alongside the four known members of the team. They give you instructions, rely on you for small but critical tasks, and react to what you do, so the story plays out around your actions instead of in front of you.",

  why: "Most of us learn about Kakori the way we learn most history: a paragraph in a textbook, a few names, a date to memorise. It's easy to know what happened and still have no sense of what it was like to be there: the nerves, the cramped train, the split-second decisions, the trust between people risking everything. We wanted to close that gap. VR can put you inside a space in a way no textbook or film can, so it felt like the right medium to turn a historical fact into something you actually feel.",

  goal: 'To create an experience that makes a well-known moment in history feel personal and present, without turning it into a game or changing the history itself. We wanted people to leave having felt the pressure, chaos and camaraderie of the mission, not just knowing more facts about it.',

  challenge: 'How do we let someone take part in a real historical event, feeling its tension and its human moments, while staying true to what actually happened?',

  // process is split around the Blender asset images
  processBefore: [
    'We started with the story itself, studying the sequence of events at Kakori and working out where a fifth revolutionary could believably fit without changing what happened. From there we mapped every user action and the flow of commands between the characters.',
    'Next came the world. The train compartments, props, weapons, the funds chest and the lanterns were all modelled and textured in Blender, with close attention to wear, materials and how cramped the space felt, so it would carry the mood of the era. Every asset was then optimised to run in real time in VR.',
  ],
  // three Blender assets, each as a before/after slider (drag to compare).
  // before = rough grey model (shapes only), after = final render with textures & lighting.
  assets: [
    { name: 'train interior', wide: true, ratio: '1600 / 543', before: { image: IMG('train-rough.jpg'), alt: 'Train interior, untextured Blender model' }, after: { image: IMG('train-final.jpg'), alt: 'Train interior, final render with lanterns lit' } },
    { name: 'funds chest', before: { image: IMG('chest-rough.jpg'), alt: 'Funds chest, untextured model' }, after: { image: IMG('chest-final.jpg'), alt: 'Funds chest, final render' } },
    { name: 'radio', before: { image: IMG('radio-rough.jpg'), alt: 'Radio, untextured model' }, after: { image: IMG('radio-final.jpg'), alt: 'Radio, final render' } },
  ],
  processAfter: [
    "The four revolutionaries became guides, each with their own cues, voice lines and actions triggered by what the user does. The recruit's role was built through scripted moments: firing a gun into the air, breaking open the chest, moving through the cabin.",
    'Inside the VR workspace, we added lighting, spatial audio, animation and interactions, all focused on presence, smooth movement, and the feeling that something could go wrong at any moment.',
    'Finally, user testing helped us fix timing, make interactions easier to understand, and find the right balance between tension and playfulness.',
  ],

  outcomeIntro: 'The result is a short, guided VR experience where the story moves at the pace of your actions.',
  // the three moments, shown as stops along the train.
  // To add a clip later, give a stop `clip: { video: '/images/kakori-kaand/….mp4' }`.
  outcome: [
    { title: 'Joining the mission', desc: "You're briefed and brought on board by the four revolutionaries." },
    { title: 'Holding the crowd', desc: "You're urged to fire into the air to keep panic from spreading." },
    { title: 'The chest', desc: "You're handed a hammer and left to break open the funds chest, awkwardly." },
  ],
  // one video at the end of the page
  finalVideo: null, // add { video: '/images/kakori-kaand/walkthrough.mp4' } to show a walkthrough here
  outcomeClosing: 'By letting people step into a role that never existed, the simulation lets them feel the chaos, pressure and human moments of Kakori while still respecting what it means historically.',

  // red-pen underlines: each phrase must appear exactly in its paragraph
  marks: {
    tldr: ['fictional fifth revolutionary'],
    why: ['something you actually feel'],
    goal: ['without turning it into a game'],
    challenge: ['staying true to what actually happened'],
    closing: ['a role that never existed'],
  },

  prev: { title: 'AlignR', to: '/work/alignr' },
  next: { title: 'Inclusive Navigation', to: '/work/inclusive-navigation' },
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

// hero media starts on the baseline of the title's last line
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

// The three moments of the experience as stops along a railway line.
// Click (or hover) a stop; the train moves there and its clip shows.
function Mission({ stops }) {
  const [cur, setCur] = useState(0);
  const s = stops[cur];
  const x = (i) => (stops.length === 1 ? 50 : 10 + (i * 80) / (stops.length - 1));
  return (
    <div className="kk-mission">
      <div className="kk-track" role="tablist" aria-label="Moments in the experience">
        <div className="kk-rails" />
        <div className="kk-train" style={{ left: `${x(cur)}%` }} aria-hidden="true">
          <svg viewBox="0 0 64 26"><rect x="1" y="3" width="62" height="17" rx="3" /><rect x="7" y="7" width="9" height="6" /><rect x="21" y="7" width="9" height="6" /><rect x="35" y="7" width="9" height="6" /><rect x="49" y="7" width="9" height="6" /><circle cx="14" cy="22" r="3" /><circle cx="50" cy="22" r="3" /></svg>
        </div>
        {stops.map((st, i) => (
          <button
            key={st.title}
            role="tab"
            aria-selected={i === cur}
            className={`cs-btn kk-stop${i === cur ? ' on' : ''}${i < cur ? ' past' : ''}`}
            style={{ left: `${x(i)}%` }}
            onClick={() => setCur(i)}
            onMouseEnter={() => setCur(i)}
          >
            <span className="kk-dot" />
            <span className="kk-stop-n">{String(i + 1).padStart(2, '0')}</span>
            <span className="kk-stop-t">{st.title}</span>
          </button>
        ))}
      </div>
      <div className={`kk-scene${s.clip ? '' : ' no-clip'}`} key={cur}>
        <div className="kk-scene-text">
          <p className="insight-title">{s.title}</p>
          <p className="insight-desc">{s.desc}</p>
          <div className="kk-scene-nav">
            <button className="cs-btn" disabled={cur === 0} onClick={() => setCur(cur - 1)}>← previous stop</button>
            <button className="cs-btn" disabled={cur === stops.length - 1} onClick={() => setCur(cur + 1)}>next stop →</button>
          </div>
        </div>
        {s.clip && <Media className="kk-clip" {...s.clip} />}
      </div>
    </div>
  );
}

const PILL = [['tldr', 'about'], ['why', 'why'], ['process', 'process'], ['outcome', 'the mission']];

export default function KakoriKaand() {
  useTitle('Kakori Kaand');
  const c = CONTENT;
  const heroRef = useRef(null);
  const baselineRef = useRef(null);
  useTitleBaseline(heroRef, baselineRef);

  return (
    <div className="page inclusive kakori">
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

      <Section id="tldr" label="tl;dr."><TldrCards cards={c.tldrCards} /></Section>
      <Section label="what it is."><p className="body-copy">{c.whatItIs}</p></Section>
      <Section id="why" label="why."><Ink className="body-copy" text={c.why} marks={c.marks.why} /></Section>
      <Section label="our goal."><Ink className="body-copy" text={c.goal} marks={c.marks.goal} /></Section>
      <Section label="the challenge." className="research-question">
        <Ink className="rq-copy" text={c.challenge} marks={c.marks.challenge} />
      </Section>

      <Section id="process" label="process." className="process">
        <div className="process-copy">
          {c.processBefore.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </Section>

      <section className="media-block grid-row">
        <div className="asset-photos">
          {c.assets.map((a) => (
            <figure key={a.name} className={`asset${a.wide ? ' wide' : ''}`}>
              <Compare before={a.before} after={a.after} ratio={a.ratio} tags={['rough model', 'final render']} />
              <figcaption>{a.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="process process-more grid-row">
        <div className="process-copy">
          {c.processAfter.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>

      <Section id="outcome" label="outcome." className="outcome">
        <p className="outcome-intro">{c.outcomeIntro}</p>
        <Mission stops={c.outcome} />
        <Ink className="outcome-closing" text={c.outcomeClosing} marks={c.marks.closing} />
      </Section>

      {c.finalVideo && (
        <section className="media-block grid-row">
          <Media className="media-placeholder" {...c.finalVideo} />
        </section>
      )}

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
