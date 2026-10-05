import { useEffect, useState } from 'react';

// Returns true when the header should slide away (scrolling down past 80px).
export default function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      // Ignore huge jumps (the work page's endless-scroll loop, jump links)
      // so the header doesn't flicker; only real scrolling shows/hides it.
      if (Math.abs(delta) > 1000) { lastY = y; ticking = false; return; }
      if (y <= 80) setHidden(false);
      else if (delta > 5) setHidden(true);
      else if (delta < -5) setHidden(false);
      lastY = Math.max(0, y);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return hidden;
}
