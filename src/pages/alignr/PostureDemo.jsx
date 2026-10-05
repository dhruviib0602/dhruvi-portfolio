import { useEffect, useRef, useState } from 'react';
import './PostureDemo.css';

// Side view of someone at a desk with AlignR on their upper back.
// 1. calibrate (already done here)  2. track the lean  3. wait 6 s past the line  4. buzz
// The "slouch line" is illustrative: it isn't the real threshold angle.

const MAX = 38;          // furthest the figure can lean, in degrees
const OVER = 16;         // how far past "upright" counts as a slouch (illustrative)
const HOLD = 6000;       // ms a slouch has to last before the buzz
const HIP = { x: 170, y: 200 };
const TORSO = 96;

const rad = (d) => (d * Math.PI) / 180;
const along = (deg, len, from = HIP) => ({ x: from.x + Math.sin(rad(deg)) * len, y: from.y - Math.cos(rad(deg)) * len });

const STEPS = [
  ['set', 'Calibrate', 'Sit up straight once and AlignR saves that angle as your good posture.'],
  ['track', 'Track the lean', 'A motion sensor follows how far your upper back tips forward from there.'],
  ['wait', 'Wait before reacting', 'Leaning in for a moment is normal. Only a slouch that lasts more than 6 seconds counts.'],
  ['buzz', 'A gentle nudge', 'A short buzz reminds you to sit up. Sit up and it goes quiet again.'],
];

export default function PostureDemo() {
  const [lean, setLean] = useState(4);
  const ref = 4;                              // calibrated straight-back angle (set by default)
  const [held, setHeld] = useState(0);        // 0..1 of the 6 s
  const [buzz, setBuzz] = useState(false);
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const over = ref != null && lean - ref > OVER;

  // the 6-second timer while slouched
  useEffect(() => {
    if (!over) { setHeld(0); setBuzz(false); return; }
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / HOLD);
      setHeld(k);
      if (k >= 1) setBuzz(true);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [over]);

  // drag the figure with the pointer (left/right = lean)
  const fromPointer = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 400;
    setLean(Math.max(0, Math.min(MAX, ((x - 150) / 150) * MAX)));
  };

  const step = ref == null ? 'set' : buzz ? 'buzz' : over ? 'wait' : 'track';

  const sh = along(lean, TORSO);
  const head = along(lean + 14, 26, sh);
  // the spine curves (hunches) more the further you lean
  const bend = lean * 0.55;
  const mid = along(lean, TORSO / 2);
  const ctrl = { x: mid.x - Math.cos(rad(lean)) * bend, y: mid.y - Math.sin(rad(lean)) * bend };
  const q = (t, a, b2, c2) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b2 + t * t * c2;
  const patch = { x: q(0.74, HIP.x, ctrl.x, sh.x), y: q(0.74, HIP.y, ctrl.y, sh.y) };
  const back = { x: patch.x - Math.cos(rad(lean)) * 7, y: patch.y - Math.sin(rad(lean)) * 7 };
  const refEnd = ref != null ? along(ref, 132) : null;
  const lineEnd = ref != null ? along(ref + OVER, 132) : null;
  const ringLen = 2 * Math.PI * 13;

  return (
    <div className="pd">
      <div className="pd-stage">
        <svg
          ref={svgRef}
          viewBox="0 0 400 290"
          className={`pd-svg${buzz ? ' is-buzz' : ''}`}
          onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
          onPointerMove={(e) => dragging.current && fromPointer(e)}
          onPointerUp={() => { dragging.current = false; }}
          role="img"
          aria-label="A seated figure leaning towards a desk with a sensor on the upper back"
        >
          {/* floor, chair, desk */}
          <line x1="20" y1="268" x2="390" y2="268" className="pd-line" />
          <path d="M118 112 V206 H222 M128 206 V268 M212 206 V268" className="pd-line" />
          <path d="M268 172 H392 M380 172 V268" className="pd-line" />
          <path d="M300 172 L318 150 L352 150 L344 172" className="pd-line pd-laptop" />

          {/* reference + slouch line */}
          {ref != null && (
            <g>
              <line x1={HIP.x} y1={HIP.y} x2={refEnd.x} y2={refEnd.y} className="pd-ref" />
              <text x={refEnd.x - 6} y={refEnd.y - 6} className="pd-t" textAnchor="middle">good posture</text>
              <line x1={HIP.x} y1={HIP.y} x2={lineEnd.x} y2={lineEnd.y} className="pd-thr" />
              <text x={lineEnd.x + 4} y={lineEnd.y - 6} className="pd-t pd-t-r">slouch line</text>
            </g>
          )}

          {/* the person */}
          <g className={`pd-body${over ? ' over' : ''}`}>
            <path d={`M${HIP.x} ${HIP.y} L240 ${HIP.y + 4} L240 266`} className="pd-limb" />
            <path d={`M${sh.x} ${sh.y} Q ${(sh.x + 300) / 2} ${Math.max(sh.y, 150) + 26} 300 168`} className="pd-limb" />
            <path d={`M${HIP.x} ${HIP.y} Q ${ctrl.x} ${ctrl.y} ${sh.x} ${sh.y}`} className="pd-torso" />
            <line x1={sh.x} y1={sh.y} x2={head.x} y2={head.y} className="pd-limb" />
            <circle cx={head.x} cy={head.y} r="15" className="pd-head" />
          </g>

          {/* the patch, its 6-second ring and the buzz */}
          <g transform={`translate(${back.x} ${back.y})`} className="pd-patch">
            {buzz && <><circle r="10" className="pd-pulse" /><circle r="10" className="pd-pulse d2" /></>}
            <circle r="13" className="pd-ring-bg" />
            <circle r="13" className="pd-ring" strokeDasharray={ringLen} strokeDashoffset={ringLen * (1 - held)} transform="rotate(-90)" />
            <rect x="-4.5" y="-6.5" width="9" height="13" rx="3" className="pd-dot" />
          </g>
        </svg>
        {buzz && <span className="pd-bzz">bzz</span>}
      </div>

      <div className="pd-side">
        <div className="pd-controls">
          <label className="pd-k" htmlFor="pd-lean">lean</label>
          <input id="pd-lean" type="range" min="0" max={MAX} step="0.5" value={lean} onChange={(e) => setLean(+e.target.value)} />
        </div>
        <p className="pd-read">
          {buzz ? 'Slouched for 6 seconds: AlignR buzzes. Lean back to stop it.'
              : over ? `Past the slouch line… ${Math.ceil(6 - held * 6)}s`
                : 'Tracking. Lean in a little: nothing happens until you cross the line.'}
        </p>
        <ol className="pd-steps">
          {STEPS.map(([k, t, d], i) => (
            <li key={k} className={k === step ? 'on' : ''}>
              <span className="pd-n">{i + 1}</span>
              <div><b>{t}</b><span>{d}</span></div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
