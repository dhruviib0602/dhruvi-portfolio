// Flat pictograms of the three ways we tried to keep the sensor on the body.
// Same back-view figure in all three, the device in dark, problems in red.

function Figure() {
  return (
    <g className="ill-fig">
      <circle cx="200" cy="72" r="32" />
      <path d="M186 100 h28 v18 h-28 Z" />
      <path d="M110 300 L112 168 Q114 124 160 116 L240 116 Q286 124 288 168 L290 300 Z" />
    </g>
  );
}

const LABELS = {
  neckband: 'Back view of a person wearing a neckband; the device has slid off-centre, away from where it should sit on the spine',
  strap: 'Back view of a person with a device strapped to the upper back, straps over both shoulders and around the chest; red arrows show the shoulders can’t move freely',
  patch: 'Back view of a person with a small device stuck flat on the upper back between the shoulder blades',
};

export default function ExploreIllo({ kind }) {
  return (
    <svg className={`ar-illo ill-${kind}`} viewBox="0 0 400 300" role="img" aria-label={LABELS[kind]}>
      <text className="ill-sub" x="18" y="28">BACK VIEW</text>
      <Figure />

      {kind === 'neckband' && (
        <>
          <path className="ill-band" d="M166 106 Q200 140 234 106" />
          <rect className="ill-ghost" x="184" y="112" width="32" height="24" rx="8" />
          <g className="ill-slide">
            <rect className="ill-dev" x="216" y="96" width="32" height="24" rx="8" transform="rotate(-18 232 108)" />
            <path className="ill-red" d="M256 92 l8 -4 M258 102 l9 0 M256 112 l8 4" />
          </g>
          <path className="ill-red" d="M222 132 q14 6 22 -6 M244 126 l1 9 m-1 -9 l-8 3" />
          <text className="ill-lbl" x="268" y="150">slides off</text>
        </>
      )}

      {kind === 'strap' && (
        <>
          <path className="ill-band" d="M146 122 L194 176 M254 122 L206 176 M112 196 L288 196" />
          <rect className="ill-dev" x="180" y="160" width="40" height="46" rx="10" />
          <g className="ill-red ill-pulse">
            <path d="M96 150 a36 36 0 0 1 34 -38 M130 112 l-10 -2 m10 2 l-4 9" />
            <path d="M304 150 a36 36 0 0 0 -34 -38 M270 112 l10 -2 m-10 2 l4 9" />
            <path d="M80 112 l14 14 m0 -14 l-14 14 M306 112 l14 14 m0 -14 l-14 14" />
          </g>
          <text className="ill-lbl" x="300" y="170">can’t</text>
          <text className="ill-lbl" x="300" y="186">move</text>
        </>
      )}

      {kind === 'patch' && (
        <>
          <path className="ill-spine" d="M200 124 L200 290" />
          <rect className="ill-pad" x="181" y="149" width="38" height="48" rx="11" />
          <rect className="ill-dev" x="186" y="154" width="28" height="38" rx="8" />
          <path className="ill-red ill-tick" d="M236 160 l8 9 l16 -20" pathLength="1" />
          <text className="ill-lbl" x="232" y="192">stays put</text>
        </>
      )}
    </svg>
  );
}
