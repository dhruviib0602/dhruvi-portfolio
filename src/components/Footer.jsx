import ScrambleText from './ScrambleText';
import Mark from './Mark';
import useInView from '../hooks/useInView';
import CopyEmail from './CopyEmail';
import { LINKEDIN } from '../data/contact';

// links live in src/data/contact.js

export default function Footer({ className = '' }) {
  const [markRef, inView] = useInView(0.2);

  return (
    <footer className={`site-footer grid-row ${className}`}>
      <div ref={markRef} className={`footer-mark${inView ? ' in-view' : ''}`}>
        <Mark className="footer-logo-svg" />
      </div>
      <div className="footer-social">
        <CopyEmail className="underline-left-right" />
        <a className="underline-right-left" href={LINKEDIN} target="_blank" rel="noopener noreferrer">
          <ScrambleText text="linkedIn" hover />
        </a>
      </div>
      <div className="made-with-hate">
        <ScrambleText text="made with hate" reveal />
      </div>
    </footer>
  );
}
