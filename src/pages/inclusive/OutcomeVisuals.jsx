import { useState } from 'react';
import './OutcomeVisuals.css';

const T = (f) => `/images/inclusive-navigation/tokens/${f}.png`;

// the nine room tokens, rebuilt as cards (illustrations are from the original set)
export const TOKENS = [
  ['library', 'library', '#eadec6', 'dark'],
  ['washroom', 'washroom', '#7ed2de', 'dark'],
  ['art', 'art room', '#f69636', 'dark'],
  ['playground', 'playground', '#067242', 'light'],
  ['admin', 'admin office', '#364e96', 'light'],
  ['infirmary', 'infirmary', '#c6362a', 'light'],
  ['music', 'music room', '#7e5a96', 'light'],
  ['canteen', 'canteen', '#d2ae96', 'dark'],
  ['computer', 'computer lab', '#deaed2', 'dark'],
];

export function TokenCards() {
  return (
    <div className="ov-tokens" role="list" aria-label="Room tokens">
      {TOKENS.map(([id, name, colour, tone]) => (
        <div key={id} className="ov-token" role="listitem" style={{ '--c': colour }}>
          <div className="ov-token-art"><img src={T(id)} alt="" loading="lazy" /></div>
          <div className={`ov-token-label ${tone}`}><span>{name}</span></div>
        </div>
      ))}
    </div>
  );
}

// floor plan with the guiding rail; hover the legend (or the plan) to light the rail up
export function RailPlan() {
  const [hl, setHl] = useState(null);
  const KEY = [
    ['rail', 'guiding rail', '#7c3abe', 'runs along the walls'],
    ['help', 'helper / sensory room', null, 'where the rail leads'],
  ];
  return (
    <div className={`ov-rail${hl ? ` hl-${hl}` : ''}`}>
      <div className="ov-rail-plan" onMouseEnter={() => setHl('rail')} onMouseLeave={() => setHl(null)}>
        <img src="/images/inclusive-navigation/outcome-rail.jpg" alt="Floor plan of the school with the guiding rail drawn in purple around the outer walls, leading to two coloured rooms" />
        <img className="ov-rail-glow" src="/images/inclusive-navigation/outcome-rail-purple.png" alt="" aria-hidden="true" />
        <span className="ov-pin" style={{ left: '20%', top: '14%' }}>guiding rail</span>
      </div>
      <ul className="ov-key">
        {KEY.map(([k, label, colour, note]) => (
          <li key={k} onMouseEnter={() => setHl(k)} onMouseLeave={() => setHl(null)} className={hl === k ? 'on' : ''}>
            <span className={`ov-sw ov-sw-${k}`} style={colour ? { background: colour } : undefined} />
            <span><b>{label}</b>{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
