import { Link } from 'react-router-dom';
import ScrambleText from '../../components/ScrambleText';
import { PROJECTS } from '../../data/projects';

// GRID VIEW — three cards across the middle three grid columns (3–5),
// name + short category under each card, year on the right, and a small
// red "+" wherever an inner grid line crosses the gap between two rows.
const COLS = 3;
const lastRow = Math.floor((PROJECTS.length - 1) / COLS);

export default function WorkGrid() {
  return (
    <section className="work-grid grid-row">
      <div className="work-grid-cards">
        {PROJECTS.map((p, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const showPlus = col < COLS - 1 && row < lastRow; // inner lines, between rows only
          const inner = (
            <>
              <div
                className="grid-card-image"
                style={(p.square || p.image) ? { backgroundImage: `url('${p.square || p.image}')` } : undefined}
              >
                {!(p.square || p.image) && <span className="work-image-index">{String(i + 1).padStart(2, '0')}</span>}
              </div>
              {/* everything between this image and the next row's images */}
              <div className="grid-card-below">
                <div className="grid-card-caption">
                  <span className="grid-card-name"><ScrambleText text={p.name} /></span>
                  <span className="grid-card-year">{p.year}</span>
                  <span className="grid-card-category">{p.short || p.category}</span>
                </div>
                <div className="grid-card-gap" aria-hidden="true" />
                {/* halfway between the image rows, on the grid line */}
                {showPlus && <img className="grid-plus" src="/images/icons/grid-plus.svg" width="11" height="11" alt="" aria-hidden="true" />}
              </div>
            </>
          );
          return p.to ? (
            <Link key={p.name} to={p.to} className="grid-card">{inner}</Link>
          ) : (
            <div key={p.name} className="grid-card">{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
