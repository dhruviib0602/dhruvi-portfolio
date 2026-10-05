import Header from '../components/Header';
import Footer from '../components/Footer';
import GridLines from '../components/GridLines';
import ScrambleText from '../components/ScrambleText';
import KoiAscii from '../components/KoiAscii';
import CopyEmail from '../components/CopyEmail';
import useTitle from '../hooks/useTitle';
import { LINKEDIN, RESUME } from '../data/contact';
import './About.css';

// ---------- edit your content here ----------

const BIO = [
  "I'm Dhruvi.",
  "I've always liked making things. I spent most of my childhood sketching, collecting ideas, and wondering why certain things felt right while others didn't.",
  "That curiosity never really left. Today, I work across interaction design, visual storytelling, and creative technology. I'm curious about visuals, people, technology, and the weird little space where they overlap. I like using technology as a creative material, not just a tool, to turn ideas into things that feel thoughtful, memorable, and human.",
  'Still learning, still experimenting, and still following the same curiosity, just with a few more tools now.',
];

// email copies on click; the others open in a new tab (links live in src/data/contact.js)
const LINKS = [
  { label: 'linkedIn', href: LINKEDIN },
  { label: 'resume', href: RESUME },
];

// Each line reads "things i like to <verb>". On hover, its image
// slides open between "to" and the verb.
const WHO_LINES = [
  { verb: 'listen', media: '/images/about/listen.gif' },
  { verb: 'watch', media: '/images/about/watch-web.gif' },
];

// ---------------------------------------------

export default function About() {
  useTitle('about');
  return (
    <div className="page about">
      <GridLines />
      <Header />

      <section className="about-hero grid-row">
        {/* big, faded ASCII koi swimming in the empty right-hand columns */}
        <div className="koi-box" aria-hidden="true">
          <KoiAscii topInset={0} scale={0.9} speed={1.4} lanes />
        </div>
        <div className="about-label"><ScrambleText text="about." /></div>

        <div className="about-photo">
          <img className="photo-baby" src="/images/about/baby.jpg" alt="Childhood photo of Dhruvi" />
          <img className="photo-grownup" src="/images/about/grownup.jpg" alt="Dhruvi today" />
        </div>

        <div className="about-bio">
          {BIO.map((para, i) => (
            <p key={i}><ScrambleText text={para} /></p>
          ))}
        </div>

        <div className="about-social-top">
          <CopyEmail />
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
              <ScrambleText text={l.label} hover />
            </a>
          ))}
        </div>
      </section>

      <section className="who-section grid-row">
        <div className="who-label"><ScrambleText text="this is who i am," /></div>
        <div className="who-lines">
          {WHO_LINES.map(({ verb, media }) => (
            <p key={verb} className="who-line-media">
              <ScrambleText text="things i like to" />
              <span className="who-media-box"><img src={media} alt="" /></span>
              <ScrambleText text={verb} />
            </p>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
