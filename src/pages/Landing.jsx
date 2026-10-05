import { useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GridLines from '../components/GridLines';
import KoiAscii from '../components/KoiAscii';
import WorksSpiral from './landing/WorksSpiral';
import PlaygroundZoom from './landing/PlaygroundZoom';
import LeanWords from './landing/LeanWords';
import './Landing.css';
import useTitle from '../hooks/useTitle';

// ======================= edit the landing page here =======================

// hero intro — the words in `highlight` turn red
const INTRO = {
  hello: "I'm Dhruvi,",
  before: "an Interaction Design student, I'm curious about ",
  highlight: 'visuals, people, technology',
  after: ', and the weird little space where they overlap. I like turning ideas into things you can see, feel, and interact with.',
};

// selected works: the 5 covers that spiral out and land as cards
// (name, category and year show under a card when you hover it)
const WORKS = [
  { name: 'How to be Human', category: 'Graphic Design', year: '2025', image: '/images/work/how-to-be-human.jpg', to: '/work/how-to-be-human' },
  { name: 'Mori', category: 'Brand Identity', year: '2025', image: '/images/work/mori.jpg', to: '/work/mori' },
  { name: 'Kakori Kaand', category: 'VR Experience', year: '2025', image: '/images/work/kakori-kaand.jpg', to: '/work/kakori-kaand' },
  { name: 'Thela, Thaila, Thikana', category: 'Ethnographic Study', year: '2025', image: '/images/thela/zine/01.jpg', to: '/work/thela-thaila-thikana' },
  { name: 'Inclusive Navigation', category: 'Research / Concept Design', year: '2025', image: '/images/work/inclusive-navigation.jpg', to: '/work/inclusive-navigation' },
];

// playground: images scattered round the label (x / y = offset from the
// centre, in % of screen width). The 5th one (keep: 4) is the one that stays
// and lands in the window; the window then cycles through PG_GALLERY.
const PG_SCATTER = [
  { src: '/images/playground/1.jpg', x: -8.8, y: -7.5 },
  { src: '/images/playground/2.jpg', x: 8.3, y: -7.5 },
  { src: '/images/playground/3.jpg', x: -22.3, y: 4.7 },
  { src: '/images/playground/5.jpg', x: 17.8, y: 3.3 },
  { src: '/images/playground/9.jpg', x: -6.2, y: 11.6 },
  { src: '/images/playground/10.jpg', x: 5.5, y: 11.1 },
];
// first one = the image that lands, then the rest in order
const PG_GALLERY = [9, 1, 2, 3, 4, 5, 6, 7, 8, 10].map((n) => `/images/playground/${n}.jpg`);

// ==========================================================================

export default function Landing() {
  useTitle();
  const entered = true; // (the intro animation was removed)

  // koi swim faster while you scroll, and drift up slower than the page
  const koiBoost = useRef(1);
  const koiRef = useRef(null);
  useEffect(() => {
    if (!entered) return;
    let lastY = window.scrollY, lastT = performance.now(), raf = 0;
    const tick = () => {
      const now = performance.now();
      const y = window.scrollY;
      const v = Math.abs(y - lastY) / Math.max(16, now - lastT); // px per ms
      lastY = y; lastT = now;
      const target = 1 + Math.min(5, v * 6);                    // up to 6× while flicking
      koiBoost.current += (target - koiBoost.current) * (target > koiBoost.current ? 0.3 : 0.04);
      if (koiRef.current) koiRef.current.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [entered]);

  return (
    <div className="page landing">
      {entered && (
        <>
          <GridLines />
          <Header fixed />

          <section className="hero2">
            <div className="hero2-koi" ref={koiRef} aria-hidden="true">
              <KoiAscii topInset={60} scale={1.15} speed={1.1} boost={koiBoost} follow />
            </div>
            <div className="hero2-text grid-row">
              <div className="hero2-copy">
                {/* words lean away from the cursor */}
                <p className="hero2-hello"><LeanWords parts={[INTRO.hello]} /></p>
                <p>
                  <LeanWords parts={[INTRO.before, { text: INTRO.highlight, red: true }, INTRO.after]} />
                </p>
              </div>
            </div>
          </section>

          <WorksSpiral works={WORKS} />

          <PlaygroundZoom scattered={PG_SCATTER} keep={4} gallery={PG_GALLERY} />

          <Footer />
        </>
      )}
    </div>
  );
}
