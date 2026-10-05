import { useEffect, useRef } from 'react';

// Letter-scramble text effect, ported from the original pages.
//  - With `hover`, re-scrambles every time its parent link is hovered,
//    and types itself in the first time it scrolls into view (nav, footer).
//  - `reveal` turns on just the scroll-in typing without the hover.
//  - Otherwise the text simply shows, no animation.
//
// Usage: <ScrambleText text="selected works" />      (plain)
//        <ScrambleText text="work" hover />         (nav / footer links)

function scrambleIn(el, speed = 25, trail = 5) {
  const original = el.dataset.text;
  const pool = [...new Set(original.replace(/\s/g, ''))];
  let revealed = 0;
  clearInterval(el._t);
  el._t = setInterval(() => {
    let out = '';
    for (let i = 0; i < original.length; i++) {
      if (i < revealed) out += original[i];
      else if (i < revealed + trail) out += pool[Math.floor(Math.random() * pool.length)];
    }
    el.textContent = out;
    revealed++;
    if (revealed > original.length) {
      clearInterval(el._t);
      el.textContent = original;
    }
  }, speed);
}

function scrambleHover(el, speed = 50, maxIterations = 8) {
  const original = el.dataset.text;
  const pool = [...new Set(original.replace(/\s/g, ''))];
  const step = original.length / maxIterations;
  let iteration = 0;
  clearInterval(el._t);
  el._t = setInterval(() => {
    el.textContent = original
      .split('')
      .map((ch, i) => (i < iteration ? original[i] : pool[Math.floor(Math.random() * pool.length)]))
      .join('');
    if (iteration >= original.length) {
      clearInterval(el._t);
      el.textContent = original;
    }
    iteration += step;
  }, speed);
}

export default function ScrambleText({ text, hover = false, reveal = hover }) {
  const ref = useRef(null);
  const chunks = text.split(/(\s+)/).filter(Boolean);

  useEffect(() => {
    const container = ref.current;
    if (!container || (!hover && !reveal)) return;
    const words = () => container.querySelectorAll('.scramble-word');
    const timers = [];

    // Respect reduced-motion: just show the text.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      words().forEach((w) => (w.textContent = w.dataset.text));
      return;
    }

    const io = reveal && new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          words().forEach((w, i) => timers.push(setTimeout(() => scrambleIn(w), i * 50)));
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );
    if (io) {
      words().forEach((w) => (w.textContent = ''));
      io.observe(container);
    }

    let link = null;
    const onEnter = () =>
      words().forEach((w, i) => timers.push(setTimeout(() => scrambleHover(w), i * 40)));
    if (hover) {
      link = container.closest('a, button');
      link?.addEventListener('mouseenter', onEnter);
    }

    return () => {
      io?.disconnect();
      link?.removeEventListener('mouseenter', onEnter);
      timers.forEach(clearTimeout);
      // Reset to blank (not the full word) so a re-run — React runs effects
      // twice in development — types the word in once, cleanly, instead of
      // flashing the full text first and then scrambling it again.
      words().forEach((w) => {
        clearInterval(w._t);
        w.textContent = reveal ? '' : w.dataset.text;
      });
    };
  }, [text, hover, reveal]);

  return (
    <span className="scramble-text" ref={ref} aria-label={text}>
      {chunks.map((chunk, i) =>
        /^\s+$/.test(chunk) ? (
          chunk
        ) : (
          <span key={i} className="scramble-word" data-text={chunk} aria-hidden="true">
            {reveal ? null : chunk}
          </span>
        )
      )}
    </span>
  );
}
