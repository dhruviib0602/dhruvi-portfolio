import { useState } from 'react';
import './Observations.css';

// "what we saw": the wayfinding problems we circled on the school visit.
// Pick an issue on the left; its photos show on the right.
// groups: [{ title, photos: [{ image, alt }] }]
export default function Observations({ groups }) {
  const [cur, setCur] = useState(0);
  const g = groups[cur];
  return (
    <div className="ob">
      <ol className="ob-list">
        {groups.map((x, i) => (
          <li key={x.title}>
            <button className={`cs-btn ob-item${i === cur ? ' on' : ''}`} onClick={() => setCur(i)} onMouseEnter={() => setCur(i)}>
              <span className="ob-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="ob-t">{x.title}</span>
              <span className="ob-c">{x.photos.length}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className={`ob-photos n${Math.min(g.photos.length, 4)}`} key={cur}>
        {g.photos.map((p, i) => (
          <img key={p.image} src={p.image} alt={p.alt} loading="lazy" style={{ animationDelay: `${i * 70}ms` }} />
        ))}
      </div>
    </div>
  );
}
