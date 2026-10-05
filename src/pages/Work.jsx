import { useLayoutEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import GridLines from '../components/GridLines';
import ScrambleText from '../components/ScrambleText';
import WorkList from './work/WorkList';
import WorkGrid from './work/WorkGrid';
import './Work.css';
import useTitle from '../hooks/useTitle';

// The work page has two views the visitor can switch between:
//   list (default) → /work
//   grid           → /work?view=grid
// Keeping the view in the URL means it survives a refresh, the back button
// works, and you can share a link straight to the grid.
export default function Work() {
  useTitle('work');
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'grid' ? 'grid' : 'list';

  const setView = (v) => {
    if (v === view) return;
    setParams(v === 'grid' ? { view: 'grid' } : {}, { replace: false });
  };

  // The grid starts at the top of the page (the list positions itself).
  useLayoutEffect(() => {
    if (view === 'grid') window.scrollTo(0, 0);
  }, [view]);

  return (
    <div className={`page work work--${view}`}>
      <GridLines />
      <Header />

      <div className="work-view-toggle" role="group" aria-label="Choose layout">
        {['list', 'grid'].map((v) => (
          <button
            key={v}
            type="button"
            className={`underline-center${view === v ? ' current' : ''}`}
            aria-pressed={view === v}
            onClick={() => setView(v)}
          >
            <ScrambleText text={v} hover />
          </button>
        ))}
      </div>

      {view === 'list' ? <WorkList /> : <WorkGrid />}
    </div>
  );
}
