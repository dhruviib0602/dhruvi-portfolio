import { useEffect, useRef } from "react";

/* ==========================================================================
   KoiAscii — two ASCII koi swimming in the landing fold.
   Characters scatter outward and fade as the user scrolls past the fold.

   Usage (parent must be position: relative, e.g. .fold):
     <div className="fold">
       <KoiAscii />
       <header>…</header>
       …
     </div>
   ========================================================================== */

// @koi-engine-start
const TAU = Math.PI * 2;
const CW = 6, CH = 9;                        // cell size in css px
const RAMP = ".:-=+ilYTVXAKSHDNQWM";         // light -> dense
const AL = 6;                                // opacity steps

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const dirv = (a) => ({ x: Math.cos(a), y: Math.sin(a) });
function hash(x, y, s) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

class Koi {
  constructor(len, x, y, ang, o = {}) {
    this.len = len; this.n = o.n || 30; this.seg = len / this.n;
    this.w = len * (o.girth || 0.155);
    this.phase = o.phase ?? Math.random() * TAU;
    this.pattern = o.pattern || [];
    this.tail = o.tail || 0.3;
    this.fins = o.fins || 1;
    this.pts = [];
    for (let i = 0; i < this.n; i++)
      this.pts.push({ x: x - Math.cos(ang) * i * this.seg, y: y - Math.sin(ang) * i * this.seg });
  }
  head(x, y, dt) {
    const p = this.pts;
    const moved = Math.hypot(x - p[0].x, y - p[0].y);
    this.phase += moved * (7 / this.len) + dt * 0.9;
    p[0].x = x; p[0].y = y;
    for (let i = 1; i < this.n; i++) {
      const a = p[i - 1], b = p[i];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
      b.x = a.x + (dx / d) * this.seg; b.y = a.y + (dy / d) * this.seg;
    }
  }
  prof(u) {
    const b = Math.max(0, u * 0.9 + 0.04);
    return Math.pow(Math.sin(Math.PI * Math.pow(b, 0.6)), 1.05);
  }
  frame() {
    const n = this.n, p = this.pts, R = [], Tn = [], Nn = [], Wd = [];
    for (let i = 0; i < n; i++) {
      const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)];
      let tx = a.x - b.x, ty = a.y - b.y; const d = Math.hypot(tx, ty) || 1; tx /= d; ty /= d;
      const u = i / (n - 1);
      const lat = this.w * 0.55 * Math.sin(u * 4.4 - this.phase) * Math.pow(u, 1.5);
      R.push({ x: p[i].x - ty * lat, y: p[i].y + tx * lat });
    }
    for (let i = 0; i < n; i++) {
      const a = R[Math.max(0, i - 1)], b = R[Math.min(n - 1, i + 1)];
      let tx = a.x - b.x, ty = a.y - b.y; const d = Math.hypot(tx, ty) || 1; tx /= d; ty /= d;
      Tn.push({ x: tx, y: ty }); Nn.push({ x: -ty, y: tx }); Wd.push(this.w * this.prof(i / (n - 1)));
    }
    return { R, Tn, Nn, Wd };
  }
  bodyPath(g, f, s) {
    const { R, Tn, Nn, Wd } = f, n = this.n;
    g.beginPath();
    const h = R[0], w0 = Wd[0] * s;
    g.moveTo(h.x - Nn[0].x * w0, h.y - Nn[0].y * w0);
    g.quadraticCurveTo(h.x + Tn[0].x * Wd[0] * 1.9 * s, h.y + Tn[0].y * Wd[0] * 1.9 * s, h.x + Nn[0].x * w0, h.y + Nn[0].y * w0);
    for (let i = 1; i < n; i++) g.lineTo(R[i].x + Nn[i].x * Wd[i] * s, R[i].y + Nn[i].y * Wd[i] * s);
    for (let i = n - 1; i >= 0; i--) g.lineTo(R[i].x - Nn[i].x * Wd[i] * s, R[i].y - Nn[i].y * Wd[i] * s);
    g.closePath();
  }
  fin(g, f, u, side, len, wid, amp, t) {
    const { R, Tn, Nn, Wd } = f;
    const i = Math.round(u * (this.n - 1));
    const b = { x: R[i].x + Nn[i].x * Wd[i] * 0.8 * side, y: R[i].y + Nn[i].y * Wd[i] * 0.8 * side };
    const back = Math.atan2(-Tn[i].y, -Tn[i].x);
    const ang = back - side * (0.95 + amp * Math.sin(t * 2.3 + this.phase * 0.4 + side));
    const d = dirv(ang);
    g.fillStyle = "rgb(58,0,0)";
    g.beginPath(); g.ellipse(b.x + d.x * len * 0.5, b.y + d.y * len * 0.5, len * 0.5, wid, ang, 0, TAU); g.fill();
    g.strokeStyle = "rgb(34,0,0)"; g.lineWidth = 1.6;
    for (let k = -1; k <= 1; k++) {
      const r = dirv(ang + k * 0.22);
      g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x + r.x * len * 0.9, b.y + r.y * len * 0.9); g.stroke();
    }
  }
  draw(g, t) {
    const f = this.frame(), { R, Tn, Nn, Wd } = f, n = this.n;
    g.globalCompositeOperation = "lighter";

    // tail
    const e = R[n - 1], we = Math.max(Wd[n - 1], this.w * 0.1);
    const ang = Math.atan2(-Tn[n - 1].y, -Tn[n - 1].x) + 0.35 * Math.cos(4.4 - this.phase);
    const L = this.len * this.tail, sp = 0.45 + 0.1 * Math.sin(t * 2 + this.phase);
    const P = (a, r) => { const d = dirv(a); return { x: e.x + d.x * r, y: e.y + d.y * r }; };
    const tipN = P(ang - sp, L), tipS = P(ang + sp, L), notch = P(ang, L * 0.55);
    const c1 = P(ang - sp * 0.7, L * 0.6), c2 = P(ang - sp * 0.25, L * 0.8), c3 = P(ang + sp * 0.25, L * 0.8), c4 = P(ang + sp * 0.7, L * 0.6);
    g.fillStyle = "rgb(62,0,0)";
    g.beginPath();
    g.moveTo(e.x + Nn[n - 1].x * we, e.y + Nn[n - 1].y * we);
    g.quadraticCurveTo(c1.x, c1.y, tipN.x, tipN.y);
    g.quadraticCurveTo(c2.x, c2.y, notch.x, notch.y);
    g.quadraticCurveTo(c3.x, c3.y, tipS.x, tipS.y);
    g.quadraticCurveTo(c4.x, c4.y, e.x - Nn[n - 1].x * we, e.y - Nn[n - 1].y * we);
    g.closePath(); g.fill();
    g.strokeStyle = "rgb(30,0,0)"; g.lineWidth = 1.6;
    for (let k = -1; k <= 1.001; k += 0.25) {
      const tip = P(ang + k * sp, L * (0.95 - 0.38 * (1 - Math.abs(k))));
      g.beginPath(); g.moveTo(e.x, e.y); g.lineTo(tip.x, tip.y); g.stroke();
    }

    // fins
    for (const s of [1, -1]) {
      this.fin(g, f, 0.22, s, this.w * 1.25 * this.fins, this.w * 0.36 * this.fins, 0.3, t);
      this.fin(g, f, 0.55, s, this.w * 0.72 * this.fins, this.w * 0.22 * this.fins, 0.2, t + 1);
    }

    // body, layered so the spine is densest
    for (const [s, v] of [[1, 72], [0.82, 52], [0.6, 52], [0.4, 48], [0.2, 40]]) {
      this.bodyPath(g, f, s); g.fillStyle = `rgb(${v},0,0)`; g.fill();
    }

    // markings, portfolio red (--red) (green channel = accent colour)
    if (this.pattern.length) {
      g.save(); this.bodyPath(g, f, 1); g.clip();
      g.fillStyle = "rgb(36,255,0)";
      for (const [u, s, r] of this.pattern) {
        const i = Math.round(u * (n - 1));
        g.beginPath(); g.arc(R[i].x + Nn[i].x * s * Wd[i], R[i].y + Nn[i].y * s * Wd[i], r * this.w, 0, TAU); g.fill();
      }
      g.restore();
    }

    // light along the back
    g.globalCompositeOperation = "multiply";
    g.strokeStyle = "rgb(175,175,175)"; g.lineWidth = this.w * 0.2; g.lineCap = "round";
    g.beginPath();
    const i0 = Math.round(n * 0.14), i1 = Math.round(n * 0.62);
    for (let i = i0; i < i1; i++) {
      const x = R[i].x + Nn[i].x * Wd[i] * 0.3, y = R[i].y + Nn[i].y * Wd[i] * 0.3;
      i === i0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
    g.globalCompositeOperation = "lighter";

    // eyes + barbels
    const eu = Wd[1] * 0.62;
    g.fillStyle = "rgb(210,0,0)";
    for (const s of [1, -1]) {
      g.beginPath(); g.arc(R[1].x + Nn[1].x * eu * s, R[1].y + Nn[1].y * eu * s, this.w * 0.13, 0, TAU); g.fill();
    }
    const h = R[0], tf = Tn[0];
    const sn = { x: h.x + tf.x * Wd[0] * 0.8, y: h.y + tf.y * Wd[0] * 0.8 };
    g.strokeStyle = "rgb(70,0,0)"; g.lineWidth = 1.4;
    for (const s of [1, -1]) {
      const d = dirv(Math.atan2(tf.y, tf.x) - s * (1.1 + 0.2 * Math.sin(t * 1.7 + s)));
      g.beginPath(); g.moveTo(sn.x, sn.y); g.lineTo(sn.x + d.x * this.w * 0.55, sn.y + d.y * this.w * 0.55); g.stroke();
    }
  }
}

function createKoiScene(cvs, { color = "#CB5858", accent = "#B64646", topInset = 116, scale = 1, count = 2, lanes = false, speed = 1, boost = null, follow = false, ripple = false } = {}) {
  const ctx = cvs.getContext("2d");
  const off = document.createElement("canvas");
  const octx = off.getContext("2d", { willReadFrequently: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MARKS_A = [[0.3, 0.3, 0.6], [0.38, -0.2, 0.5], [0.64, 0.1, 0.5]];
  const MARKS_B = [[0.08, 0.1, 0.55], [0.42, -0.3, 0.6], [0.7, 0.25, 0.45]];

  let W = 0, H = 0, cols = 0, rows = 0, dpr = 1, atlas = null, fish = [];
  let T = 0, last = performance.now(), visible = true, running = false, raf = 0, dead = false;

  // ---- pointer: koi can follow it (follow) and it leaves ripples (ripple) ----
  const ptr = { x: 0, y: 0, last: -1e9, inside: false };
  const ripples = [];                      // { x, y, t } in css px, t = scene time born
  let lastDrop = { x: -1e9, y: -1e9 };
  const onPtr = (e) => {
    const r = cvs.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    ptr.inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
    if (!ptr.inside) return;
    ptr.x = x; ptr.y = y; ptr.last = performance.now();
    if (ripple && Math.hypot(x - lastDrop.x, y - lastDrop.y) > 46) {
      ripples.push({ x, y, t: T }); lastDrop = { x, y };
      if (ripples.length > 10) ripples.shift();
    }
    if (!running) start();
  };
  if (follow || ripple) window.addEventListener("pointermove", onPtr, { passive: true });
  let pull = 0;                            // 0..1, how much the koi care about the cursor right now

  // swim region sits below the fixed header
  const region = () => ({ top: topInset, h: Math.max(1, H - topInset) });
  // lanes: each koi swims only in its own half (top / bottom), so they never overlap
  const lane = (i) => {
    const r = region();
    if (!lanes || count < 2) return r;
    return { top: r.top + (r.h / 2) * i, h: r.h / 2 };
  };
  const paths = [
    (t) => { const r = lane(0), a = t * 0.16;
      return { x: W / 2 + W * 0.3 * Math.sin(a), y: r.top + r.h * 0.44 + r.h * 0.24 * Math.sin(2 * a) }; },
    (t) => { const r = lane(1), a = t * 0.13 + 2.4;
      return { x: W / 2 - W * 0.27 * Math.sin(a), y: r.top + r.h * 0.5 + r.h * 0.2 * Math.sin(2 * a + 0.9) }; },
  ];

  function buildAtlas() {
    const gw = CW * dpr, gh = CH * dpr;
    const a = document.createElement("canvas");
    a.width = Math.ceil(RAMP.length * gw); a.height = Math.ceil(AL * 2 * gh);
    const g = a.getContext("2d");
    g.font = `500 ${8 * dpr}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
    g.textAlign = "center"; g.textBaseline = "middle";
    [color, accent].forEach((col, ci) => {
      g.fillStyle = col;
      for (let l = 0; l < AL; l++) {
        g.globalAlpha = 0.26 + 0.74 * (l / (AL - 1));
        for (let i = 0; i < RAMP.length; i++)
          g.fillText(RAMP[i], i * gw + gw / 2, (ci * AL + l) * gh + gh / 2 + 0.5 * dpr);
      }
    });
    return a;
  }

  // 0 at the top of the page -> 1 once ~55% of the fold has scrolled away
  function scrollProgress() {
    const r = (cvs.parentElement || cvs).getBoundingClientRect();
    return clamp(-r.top / (r.height * 0.55), 0, 1);
  }

  function water(x, y, t) {
    const v = Math.sin(x * 0.09 + t * 0.5) * Math.sin(y * 0.15 - t * 0.35) + Math.sin(x * 0.05 - y * 0.08 + t * 0.27);
    return v > 1.45 ? (v - 1.45) * 0.28 : 0;
  }

  function draw() {
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.globalCompositeOperation = "source-over";
    octx.fillStyle = "#000"; octx.fillRect(0, 0, cols, rows);
    octx.setTransform(1 / CW, 0, 0, 1 / CH, 0, 0);
    fish.forEach((k) => k.draw(octx, T));

    const img = octx.getImageData(0, 0, cols, rows).data;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    const p = scrollProgress();
    const e = p * p * (3 - 2 * p);                    // eased disperse amount
    if (e >= 0.999) return;
    const gw = CW * dpr, gh = CH * dpr, n = RAMP.length, step = Math.floor(T * 9);
    const rowStart = Math.floor(topInset / CH);

    for (let y = rowStart; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const k = (y * cols + x) * 4;
        let d = img[k] / 255 + water(x, y, T);
        let rx = 0, ry = 0;
        if (ripples.length) {
          const px = x * CW + CW / 2, py = y * CH + CH / 2;
          for (let q = 0; q < ripples.length; q++) {
            const rp = ripples[q], age = T - rp.t;
            if (age > 1.6 || age < 0) continue;
            const rad = 14 + age * 120, dist = Math.hypot(px - rp.x, py - rp.y);
            const off = dist - rad;
            if (off > 16 || off < -16) continue;
            const amp = (1 - age / 1.6) * Math.cos((off / 16) * Math.PI * 0.5);
            d += amp * 0.6;                                    // a soft ring of characters
            const ux = (px - rp.x) / (dist || 1), uy = (py - rp.y) / (dist || 1);
            rx += ux * amp * 3.2; ry += uy * amp * 3.2;         // push them outward a little
          }
        }
        if (d < 0.06) continue;
        if (d > 1) d = 1;

        let dx = (x * CW + rx) * dpr, dy = (y * CH + ry) * dpr, fade = 1;
        if (e > 0) {
          const r1 = hash(x, y, 7), r2 = hash(y, x, 13);
          const a = r1 * TAU, dist = e * (60 + r2 * 460) * dpr;
          dx += Math.cos(a) * dist;
          dy += Math.sin(a) * dist - e * (60 + r1 * 180) * dpr;   // drift upward as they scatter
          fade = 1 - e * (0.55 + 0.45 * r2);
          if (fade <= 0.02) continue;
          ctx.globalAlpha = fade;
        }
        const ci = clamp(Math.floor(d * (n - 1) + (hash(x, y, step) - 0.5) * 1.6), 0, n - 1);
        const li = Math.min(AL - 1, Math.floor(d * AL));
        const row = (img[k + 1] > 90 ? AL : 0) + li;
        ctx.drawImage(atlas, ci * gw, row * gh, gw, gh, dx, dy, gw, gh);
      }
    }
    ctx.globalAlpha = 1;
  }

  function tick(now) {
    if (dead) return;
    let dt = Math.min(0.05, (now - last) / 1000) * speed * (boost?.current ?? 1); last = now; // speed: 1 = original pace; boost: live multiplier (e.g. from scrolling)
    if (reduce) dt *= 0.35;
    T += dt;
    if (follow) {
      const active = ptr.inside && now - ptr.last < 1600;      // stop caring 1.6s after you stop moving
      pull += ((active ? 1 : 0) - pull) * (active ? 0.025 : 0.012);
    }
    for (let i = ripples.length - 1; i >= 0; i--) if (T - ripples[i].t > 1.6) ripples.splice(i, 1);
    fish.forEach((k, i) => {
      const q = paths[i](T);
      if (!follow) { k.head(q.x, q.y, dt); return; }
      // aim somewhere between the usual path and the cursor (2nd koi hangs back a bit, to one side)
      const w = pull * (i === 0 ? 0.85 : 0.6);
      const ox = i === 0 ? 0 : -90, oy = i === 0 ? 0 : 70;
      const tx = q.x + (ptr.x + ox - q.x) * w, ty = q.y + (ptr.y + oy - q.y) * w;
      if (k.hx === undefined) { k.hx = q.x; k.hy = q.y; }
      const ddx = tx - k.hx, ddy = ty - k.hy, dd = Math.hypot(ddx, ddy);
      const maxStep = (90 + 140 * pull) * dt;                   // px per frame, so they glide, not teleport
      const st = dd > maxStep ? maxStep / dd : 1;
      k.hx += ddx * st; k.hy += ddy * st;
      k.head(k.hx, k.hy, dt);
    });
    draw();
    if (visible && !document.hidden) raf = requestAnimationFrame(tick);
    else running = false;
  }
  function start() {
    if (running || dead || !fish.length) return;
    running = true; last = performance.now(); raf = requestAnimationFrame(tick);
  }
  function resize() {
    const r = cvs.getBoundingClientRect();
    if (!r.width || !r.height) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
    cols = Math.ceil(W / CW); rows = Math.ceil(H / CH);
    off.width = cols; off.height = rows;
    atlas = buildAtlas();
    const L = clamp(Math.min(W, region().h) * 0.5, 180, 460) * scale; // scale: bigger/smaller koi
    const opts = [
      { pattern: MARKS_A, phase: 0 },
      { pattern: MARKS_B, phase: 2, tail: 0.34 },
    ];
    const sizes = [1, 0.8];
    fish = paths.slice(0, count).map((path, i) => { // count: 1 or 2 koi
      const q = path(T - 3);
      const k = new Koi(L * sizes[i], q.x, q.y, 0, opts[i]);
      for (let s = 0; s < 90; s++) { const q2 = path(T - 3 + s / 30); k.head(q2.x, q2.y, 1 / 30); }
      return k;
    });
    draw();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(cvs);
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); });
  io.observe(cvs);
  const onVis = () => { if (!document.hidden) start(); };
  document.addEventListener("visibilitychange", onVis);
  resize(); start();

  return {
    destroy() {
      dead = true; cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onPtr);
      document.removeEventListener("visibilitychange", onVis);
    },
  };
}
// @koi-engine-end

export default function KoiAscii({
  color = "#CB5858",     // portfolio accent red (--accent)
  accent = "#B64646",    // markings, portfolio red (--red)
  topInset = 116,        // keep fish below the fixed header
  scale = 1,             // fish size multiplier (1 = original size)
  count = 2,             // how many koi (1 or 2)
  lanes = false,         // true: each koi keeps to its own half, so they never overlap
  speed = 1,             // swim speed multiplier (1 = original pace)
  boost = null,          // optional ref; its .current multiplies the speed live (no restart)
  follow = false,        // koi drift towards the cursor while it moves, then wander off again
  ripple = false,        // the cursor leaves soft ripples of characters in the water
  className = "",
  style,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const scene = createKoiScene(ref.current, { color, accent, topInset, scale, count, lanes, speed, boost, follow, ripple });
    return () => scene.destroy();
  }, [color, accent, topInset, scale, count, lanes, speed, boost, follow, ripple]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        display: "block",
        ...style,
      }}
    />
  );
}
