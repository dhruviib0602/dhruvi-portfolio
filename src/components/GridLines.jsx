import { useLayoutEffect, useRef, useState } from 'react';

// The faint vertical lines of the 7-column grid behind every page.
// `inset` = distance of the outer lines from the container edge, in px
// (20 on the page; 0 inside the sticky header, which already sits inside the page padding).
//
// Drawn as an SVG with crisp edges, exactly one screen pixel wide. With display
// scaling (125%, 150%…) ordinary 1px lines land between pixels and get smeared,
// so some look darker than others — this keeps every line identical.
export default function GridLines({ inset = 20, className = '' }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, dpr: 1 });

  useLayoutEffect(() => {
    const box = ref.current;
    const measure = () => setSize({ w: box.getBoundingClientRect().width, dpr: window.devicePixelRatio || 1 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  const { w, dpr } = size;
  const thin = 1 / dpr; // one device pixel
  const xs = w
    ? Array.from({ length: 8 }, (_, i) => (i === 7 ? w - inset - 1 : inset + ((w - 2 * inset) * i) / 7))
    : [];

  return (
    <div className={`grid-lines ${className}`} aria-hidden="true" ref={ref}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, display: 'block', overflow: 'visible' }}>
        {xs.map((x, i) => (
          <rect key={i} className="line-rect" x={x} y="0" width={thin} height="100%" shapeRendering="crispEdges" />
        ))}
      </svg>
    </div>
  );
}
