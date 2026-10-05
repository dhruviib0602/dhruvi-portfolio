import { useEffect, useRef, useState } from 'react';
import useInView from '../../hooks/useInView';
import './WayfindingMap.css';

// A line-drawn school plan that walks through the four parts of the system:
//   1. pick a badge (visual token)  2. follow its colour (colour-coded path)
//   3. too much? hold the rail       4. it leads to the sensory room
// Rooms / colours are illustrative, not the real school plan.

const COLOURS = { learning: '#6F8FAF', play: '#7FA27A', support: '#C9A25A' };

const ROOMS = [
  { id: 'classroom', name: 'classroom', cat: 'learning', x: 110, y: 40, w: 180, h: 120, door: 200, top: true, sym: 'triangle' },
  { id: 'library', name: 'library', cat: 'learning', x: 310, y: 40, w: 180, h: 120, door: 400, top: true, sym: 'square' },
  { id: 'sensory', name: 'sensory room', cat: 'support', x: 510, y: 40, w: 230, h: 120, door: 625, top: true, sym: 'wave' },
  { id: 'playground', name: 'playground', cat: 'play', x: 440, y: 220, w: 300, h: 110, door: 590, top: false, sym: 'circle' },
];
const ENTRY = { x: 40, y: 180 };
const routeFor = (r) => `M${ENTRY.x} ${ENTRY.y} H${r.door} V${r.y + r.h / 2}`;
const SENSORY = ROOMS.find((r) => r.id === 'sensory');
const RAIL = `M${ENTRY.x} 166 H${SENSORY.door - 10} V${SENSORY.y + 40}`;

const PARTS = [
  ['token', 'visual token matching'],
  ['path', 'colour-coded pathways'],
  ['rail', 'a guiding rail'],
  ['room', 'sensory regulation room'],
];

function Symbol({ type, cx, cy, r, fill, stroke }) {
  const p = { fill, stroke, strokeWidth: 1.5, strokeLinejoin: 'round' };
  if (type === 'triangle') return <polygon {...p} points={`${cx},${cy - r} ${cx + r},${cy + r * 0.8} ${cx - r},${cy + r * 0.8}`} />;
  if (type === 'square') return <rect {...p} x={cx - r * 0.85} y={cy - r * 0.85} width={r * 1.7} height={r * 1.7} />;
  if (type === 'circle') return <circle {...p} cx={cx} cy={cy} r={r * 0.9} />;
  // wave: a calm squiggle
  return <path {...p} fill="none" strokeWidth={2} strokeLinecap="round" d={`M${cx - r} ${cy} q${r / 2} ${-r} ${r} 0 t${r} 0`} />;
}

// animate t from 0 to 1 whenever `key` changes
function useProgress(key, ms = 1600) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (key == null) { setT(0); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setT(1); return; }
    let raf, t0;
    setT(0);
    const step = (now) => {
      t0 ??= now;
      const k = Math.min(1, (now - t0) / ms);
      setT(k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [key, ms]);
  return t;
}

export default function WayfindingMap() {
  const [dest, setDest] = useState(null);
  const [rail, setRail] = useState(false);
  const [ref, seen] = useInView(0.4);
  const pathRef = useRef(null);

  // start with the classroom route once the map is on screen
  useEffect(() => { if (seen && dest == null && !rail) setDest('classroom'); }, [seen]); // eslint-disable-line react-hooks/exhaustive-deps

  const room = ROOMS.find((r) => r.id === dest);
  const t = useProgress(rail ? null : dest);
  const tr = useProgress(rail ? 'rail' : null, 2000);
  const arrived = room && t >= 1;

  // where the badge is along the route
  let dot = null;
  if (room && pathRef.current) {
    const len = pathRef.current.getTotalLength();
    dot = pathRef.current.getPointAtLength(len * t);
  }

  const active = rail ? (tr >= 1 ? ['rail', 'room'] : ['rail']) : room ? (arrived ? ['token', 'path'] : ['path']) : [];
  const caption = rail
    ? (tr >= 1
      ? 'Nothing to read, nothing to decide. The rail ends at the sensory room, where a trained adult is always there.'
      : 'Too much to take in? Hold the rail along the wall and follow it.')
    : !room
      ? 'Pick a badge to see the route.'
      : arrived
        ? `Matched. The ${room.name} badge goes on the board by the door. No one to ask, no instructions to process.`
        : `Following the ${room.cat} colour to the ${room.name}…`;

  const pick = (id) => { setRail(false); setDest(id); };

  return (
    <div className="wf" ref={ref}>
      <div className="wf-controls">
        <span className="wf-k">pick a badge</span>
        {ROOMS.map((r) => (
          <button
            key={r.id}
            className={`cs-btn wf-badge${dest === r.id && !rail ? ' on' : ''}`}
            style={{ '--c': COLOURS[r.cat] }}
            onClick={() => pick(r.id)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><Symbol type={r.sym} cx={12} cy={12} r={7} fill="none" stroke="currentColor" /></svg>
            {r.name}
          </button>
        ))}
        <button className={`cs-btn wf-over${rail ? ' on' : ''}`} onClick={() => { setRail((v) => !v); }}>
          {rail ? 'feeling better' : "it's too much"}
        </button>
      </div>

      <svg className={`wf-map${rail ? ' is-rail' : ''}`} viewBox="0 0 780 350" role="img" aria-label="School plan showing a colour-coded route and a guiding rail">
        {/* transition zone, the in-between spaces where overwhelm spikes */}
        <defs>
          <pattern id="wf-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" className="wf-hatch-line" />
          </pattern>
        </defs>
        <g className="wf-zone">
          <rect x="110" y="220" width="310" height="110" fill="url(#wf-hatch)" className="wf-zone-box" />
          <text x="265" y="268" textAnchor="middle" className="wf-t">bag racks &amp; assembly line</text>
          <text x="265" y="288" textAnchor="middle" className="wf-t wf-t-s">a transition zone: where overwhelm spikes</text>
        </g>

        {/* rooms */}
        {ROOMS.map((r) => {
          const lit = (room?.id === r.id && arrived) || (rail && r.id === 'sensory' && tr >= 1);
          const bx = r.x + r.w - 34;
          const by = r.y + 10;
          return (
            <g key={r.id} className={`wf-room${lit ? ' lit' : ''}${rail && r.id !== 'sensory' ? ' dim' : ''}`} style={{ '--c': COLOURS[r.cat] }} onClick={() => pick(r.id)}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} className="wf-room-box" />
              <text x={r.x + 14} y={r.y + 26} className="wf-t">{r.name}</text>
              {/* matching board */}
              <rect x={bx} y={by} width="24" height="24" className="wf-board" />
              <Symbol type={r.sym} cx={bx + 12} cy={by + 12} r={7} fill={lit ? COLOURS[r.cat] : 'none'} stroke={COLOURS[r.cat]} />
            </g>
          );
        })}

        {/* corridor walls with door gaps */}
        <line x1="20" y1="160" x2="760" y2="160" className="wf-wall" />
        <line x1="20" y1="200" x2="760" y2="200" className="wf-wall" />
        {ROOMS.map((r) => <line key={r.id} x1={r.door - 14} x2={r.door + 14} y1={r.top ? 160 : 200} y2={r.top ? 160 : 200} className="wf-door" />)}
        <text x={ENTRY.x - 18} y={ENTRY.y + 4} className="wf-t wf-t-s" textAnchor="end">in</text>
        <path d={`M${ENTRY.x - 14} ${ENTRY.y} h10 m-4 -4 l4 4 l-4 4`} className="wf-arrow" />

        {/* colour-coded route */}
        {room && !rail && (
          <path
            ref={pathRef}
            d={routeFor(room)}
            className="wf-route"
            pathLength="1"
            style={{ stroke: COLOURS[room.cat], strokeDashoffset: 1 - t }}
          />
        )}
        {room && !rail && dot && (
          <g transform={`translate(${dot.x} ${dot.y})`} className="wf-token">
            <circle r="11" className="wf-token-bg" />
            <Symbol type={room.sym} cx={0} cy={0} r={6} fill={COLOURS[room.cat]} stroke={COLOURS[room.cat]} />
          </g>
        )}

        {/* guiding rail */}
        {rail && (
          <g className="wf-rail">
            <path d={RAIL} pathLength="1" style={{ strokeDashoffset: 1 - tr }} />
            {Array.from({ length: 15 }, (_, i) => ENTRY.x + 20 + i * 38).filter((x) => x < SENSORY.door - 20).map((x, i) => (
              <circle key={x} cx={x} cy="166" r="2.5" style={{ opacity: tr > (x - ENTRY.x) / (SENSORY.door - ENTRY.x) ? 1 : 0, transitionDelay: `${i * 10}ms` }} />
            ))}
          </g>
        )}
      </svg>

      <div className="wf-foot">
        <p className="wf-cap" aria-live="polite">{caption}</p>
        <ol className="wf-parts">
          {PARTS.map(([k, name], i) => (
            <li key={k} className={active.includes(k) ? 'on' : ''}><span>{i + 1}</span>{name}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
