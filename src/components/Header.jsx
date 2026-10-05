import { Link, NavLink } from 'react-router-dom';
import ScrambleText from './ScrambleText';
import Mark from './Mark';
import GridLines from './GridLines';
import useHideOnScroll from '../hooks/useHideOnScroll';

// variant="landing" shows "get in touch" on the left; every other page shows the logo.
// fixed=true pins the header to the viewport (landing + case studies);
// otherwise it's sticky inside the page (work, archive, about).
export default function Header({ variant = 'default', fixed = false }) {
  const hidden = useHideOnScroll();
  const navClass = (extra) => ({ isActive }) => `${extra}${isActive ? ' current' : ''}`;

  return (
    <header className={`grid-row${fixed ? ' is-fixed' : ''}${hidden ? ' nav-hidden' : ''}`}>
      {/* the page's grid lines continue through the nav bar */}
      <GridLines inset={fixed ? 20 : 0} className="header-lines" />
      {variant === 'landing' ? (
        <CopyEmail className="get-in-touch" label="get in touch" hover={false} />
      ) : (
        <Link className="top-logo" to="/" aria-label="Home">
          <Mark />
        </Link>
      )}
      <nav className="main-nav">
        <NavLink className={navClass('underline-center')} to="/work">
          <ScrambleText text="work" hover />
        </NavLink>
        <NavLink className={navClass('underline-right-left')} to="/archive">
          <ScrambleText text="archive" hover />
        </NavLink>
        <NavLink className={navClass('underline-left-right')} to="/about">
          <ScrambleText text="about" hover />
        </NavLink>
      </nav>
    </header>
  );
}
