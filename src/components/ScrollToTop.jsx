import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Jump back to the top whenever the route changes. Runs as a layout effect
// so it happens BEFORE a page positions its own scroll (e.g. the work page).
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    // Braces matter: newer Chrome returns a Promise from scrollTo, and an
    // effect must not return anything except a cleanup function.
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
