import { useEffect, useRef, useState } from 'react';
import ScrambleText from './ScrambleText';
import { EMAIL } from '../data/contact';
import './CopyEmail.css';

// Clicking copies the email address and briefly says so.
// If copying isn't allowed (old browsers), it falls back to opening the mail app.
export default function CopyEmail({ label = 'email', className = '', hover = true }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <a href={`mailto:${EMAIL}`} onClick={copy} className={`copy-email ${className}`} title={`copy ${EMAIL}`}>
      <ScrambleText key={copied ? 'c' : 'n'} text={copied ? 'email copied!' : label} hover={hover} />
      <span className="copy-email-sr" aria-live="polite">{copied ? `${EMAIL} copied to clipboard` : ''}</span>
    </a>
  );
}
