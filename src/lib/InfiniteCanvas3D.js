/**
 * Infinite Canvas 3D — three.js engine behind the playground page.
 * Ported from the original playground.html (inspired by
 * edoardolunardi/infinite-canvas) into an ES module.
 *
 *  - The camera flies through real 3D space; "zoom" moves it along Z.
 *  - Space is split into chunks. Each chunk seeds its items from a hash of
 *    its (x, y, z), so revisiting a spot always shows the same images.
 *  - Only chunks near the camera are in the scene at any time.
 *  - Drag / wheel / pinch feed a velocity with easing, so movement has inertia.
 *  - Distant images fade into the background colour with fog.
 *
 * Usage:
 *   const canvas = new InfiniteCanvas3D(element, { images, onImageClick });
 *   canvas.destroy(); // on unmount
 */
import * as THREE from 'three';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

// Deterministic pseudo-random in [0, 1) from an integer seed.
function seededRandom(seed) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default class InfiniteCanvas3D {
  constructor(root, options = {}) {
    this.root = root;
    this.chunkSize = options.chunkSize || 60;
    this.renderDistance = options.renderDistance ?? 1;
    this.itemsPerChunk = options.itemsPerChunk || 4;
    this.backgroundColor = options.backgroundColor || '#F1EFE1';
    this.images = (options.images || []).map((e) =>
      typeof e === 'string' ? { src: e, aspect: 1 } : { src: e.src, aspect: e.aspect || 1 }
    );
    this.fogNear = options.fogNear || 40;
    this.fogFar = options.fogFar || 150;
    this.initialCameraZ = options.initialCameraZ ?? 50;
    this.onImageClick = options.onImageClick || null;

    this.MAX_VELOCITY = 3.2;
    this.VELOCITY_LERP = 0.16;
    this.VELOCITY_DECAY = 0.9;

    this._geometry = new THREE.PlaneGeometry(1, 1); // shared by every image mesh
    this._chunkCache = new Map();
    this._activeChunks = new Map();
    this._maxCachedChunks = 300;

    this._pointers = new Map();
    this._dragLast = null;
    this._pinchStartDist = null;
    this._mouseNorm = { x: 0, y: 0 };
    this._scrollAccum = 0;
    this._lastChunkKey = '';
    this._downPos = null;
    this._downTime = 0;
    this._downPointerId = null;

    this._velocity = { x: 0, y: 0, z: 0 };
    this._targetVel = { x: 0, y: 0, z: 0 };
    this._basePos = { x: 0, y: 0, z: this.initialCameraZ };
    this._drift = { x: 0, y: 0 };
    this._running = true;

    this._buildScene();
    this._bindEvents();
    this._updateChunks(true);
    this._tick();
  }

  // ---------- scene / renderer ----------
  _buildScene() {
    this.root.classList.add('ic3d-viewport');
    const width = this.root.clientWidth || 1;
    const height = this.root.clientHeight || 1;

    // Transparent renderer so the page background + grid lines show through.
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(width, height);
    this.root.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(this.backgroundColor, this.fogNear, this.fogFar);

    // Load each image once and share the texture between meshes.
    const loader = new THREE.TextureLoader();
    this._textures = this.images.map((img) => {
      const tex = loader.load(img.src);
      tex.colorSpace = THREE.SRGBColorSpace; // keep photo colours true
      return tex;
    });
    this._aspects = this.images.map((img) => img.aspect);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 500);
    this.camera.position.set(0, 0, this.initialCameraZ);
    this._raycaster = new THREE.Raycaster();

    this._onResize = () => this._handleResize();
    window.addEventListener('resize', this._onResize);
  }

  _handleResize() {
    const width = this.root.clientWidth || 1;
    const height = this.root.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // ---------- procedural chunks ----------
  _generateChunk(cx, cy, cz) {
    const group = new THREE.Group();
    const seed = hashString(`${cx},${cy},${cz}`);

    for (let i = 0; i < this.itemsPerChunk; i++) {
      const s = seed + i * 1000;
      const r = (n) => seededRandom(s + n);

      const textureIndex = Math.floor(r(5) * this._textures.length) % this._textures.length;
      const aspect = this._aspects[textureIndex];
      const baseSize = 7 + r(3) * 8;
      const w = aspect >= 1 ? baseSize : baseSize * aspect;
      const h = aspect >= 1 ? baseSize / aspect : baseSize;

      const material = new THREE.MeshBasicMaterial({
        map: this._textures[textureIndex],
        side: THREE.DoubleSide,
        transparent: true,
      });
      const mesh = new THREE.Mesh(this._geometry, material);
      mesh.userData.imageIndex = textureIndex;
      mesh.scale.set(w, h, 1);
      mesh.position.set(
        (cx + r(0)) * this.chunkSize,
        (cy + r(1)) * this.chunkSize,
        (cz + r(2)) * this.chunkSize
      );
      group.add(mesh);
    }
    return group;
  }

  _getChunk(key, cx, cy, cz) {
    const cached = this._chunkCache.get(key);
    if (cached) {
      this._chunkCache.delete(key);
      this._chunkCache.set(key, cached); // mark as recently used
      return cached;
    }
    const group = this._generateChunk(cx, cy, cz);
    this._chunkCache.set(key, group);

    if (this._chunkCache.size > this._maxCachedChunks) {
      const oldestKey = this._chunkCache.keys().next().value;
      if (oldestKey !== undefined && !this._activeChunks.has(oldestKey)) {
        this._chunkCache.get(oldestKey).children.forEach((m) => m.material.dispose());
        this._chunkCache.delete(oldestKey);
      }
    }
    return group;
  }

  _updateChunks(force) {
    const cx = Math.floor(this._basePos.x / this.chunkSize);
    const cy = Math.floor(this._basePos.y / this.chunkSize);
    const cz = Math.floor(this._basePos.z / this.chunkSize);
    const key = `${cx},${cy},${cz}`;
    if (!force && key === this._lastChunkKey) return;
    this._lastChunkKey = key;

    const needed = new Set();
    const d = this.renderDistance;
    for (let dx = -d; dx <= d; dx++) {
      for (let dy = -d; dy <= d; dy++) {
        for (let dz = -d; dz <= d; dz++) {
          const ncx = cx + dx, ncy = cy + dy, ncz = cz + dz;
          const nkey = `${ncx},${ncy},${ncz}`;
          needed.add(nkey);
          if (!this._activeChunks.has(nkey)) {
            const group = this._getChunk(nkey, ncx, ncy, ncz);
            this.scene.add(group);
            this._activeChunks.set(nkey, group);
          }
        }
      }
    }
    this._activeChunks.forEach((group, activeKey) => {
      if (!needed.has(activeKey)) {
        this.scene.remove(group);
        this._activeChunks.delete(activeKey);
      }
    });
  }

  // ---------- input ----------
  _bindEvents() {
    this._onPointerDown = (e) => this._handlePointerDown(e);
    this._onPointerMove = (e) => this._handlePointerMove(e);
    this._onPointerUp = (e) => this._handlePointerUp(e);
    this._onWheel = (e) => this._handleWheel(e);

    this.root.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointercancel', this._onPointerUp);
    this.root.addEventListener('wheel', this._onWheel, { passive: false });
  }

  _handlePointerDown(e) {
    this.root.setPointerCapture(e.pointerId);
    this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this._pointers.size === 1) {
      this._dragLast = { x: e.clientX, y: e.clientY };
      this.root.classList.add('ic3d-dragging');
      this._downPos = { x: e.clientX, y: e.clientY };
      this._downTime = Date.now();
      this._downPointerId = e.pointerId;
    } else if (this._pointers.size === 2) {
      this._dragLast = null;
      this._pinchStartDist = this._pointerDistance();
      this._downPos = null; // a pinch is not a click
    }
  }

  _handlePointerMove(e) {
    // Drives the subtle idle parallax drift even when not dragging.
    this._mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
    this._mouseNorm.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (!this._pointers.has(e.pointerId)) return;
    this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this._pointers.size >= 2) {
      this._handlePinchMove();
      return;
    }
    if (this._dragLast) {
      this._targetVel.x -= (e.clientX - this._dragLast.x) * 0.025;
      this._targetVel.y += (e.clientY - this._dragLast.y) * 0.025;
      this._dragLast = { x: e.clientX, y: e.clientY };
    }
  }

  _handlePointerUp(e) {
    // Short, still press = click (opens the lightbox); otherwise it was a drag.
    if (this._downPos && e.pointerId === this._downPointerId) {
      const dist = Math.hypot(e.clientX - this._downPos.x, e.clientY - this._downPos.y);
      if (dist < 6 && Date.now() - this._downTime < 500) this._handleClick(e);
    }
    this._downPos = null;
    this._pointers.delete(e.pointerId);

    if (this._pointers.size < 2) this._pinchStartDist = null;
    if (this._pointers.size === 1) {
      const remaining = Array.from(this._pointers.values())[0];
      this._dragLast = { x: remaining.x, y: remaining.y };
    }
    if (this._pointers.size === 0) {
      this._dragLast = null;
      this.root.classList.remove('ic3d-dragging');
    }
  }

  _handleClick(e) {
    if (!this.onImageClick) return;
    const rect = this.root.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    this._raycaster.setFromCamera(ndc, this.camera);
    const hits = this._raycaster.intersectObjects(this.scene.children, true);
    for (const hit of hits) {
      const idx = hit.object?.userData?.imageIndex;
      if (typeof idx === 'number') {
        this.onImageClick(idx);
        return;
      }
    }
  }

  _pointerDistance() {
    const [a, b] = Array.from(this._pointers.values());
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  _handlePinchMove() {
    const dist = this._pointerDistance();
    if (this._pinchStartDist) this._scrollAccum += (this._pinchStartDist - dist) * 0.006;
    this._pinchStartDist = dist;
  }

  _handleWheel(e) {
    e.preventDefault();
    this._scrollAccum += e.deltaY * 0.006;
  }

  // ---------- per-frame physics + render ----------
  _tick() {
    if (!this._running) return;
    this._rafId = requestAnimationFrame(() => this._tick());

    const isZooming = Math.abs(this._velocity.z) > 0.05;
    const zoomFactor = clamp(this._basePos.z / 50, 0.3, 2.0);
    const driftAmount = 8.0 * zoomFactor;
    const driftLerp = isZooming ? 0.2 : 0.12;

    if (!this._dragLast) {
      this._drift.x = lerp(this._drift.x, this._mouseNorm.x * driftAmount, driftLerp);
      this._drift.y = lerp(this._drift.y, this._mouseNorm.y * driftAmount, driftLerp);
    }

    this._targetVel.z += this._scrollAccum;
    this._scrollAccum *= 0.8;

    for (const axis of ['x', 'y', 'z']) {
      this._targetVel[axis] = clamp(this._targetVel[axis], -this.MAX_VELOCITY, this.MAX_VELOCITY);
      this._velocity[axis] = lerp(this._velocity[axis], this._targetVel[axis], this.VELOCITY_LERP);
      this._basePos[axis] += this._velocity[axis];
    }

    this.camera.position.set(
      this._basePos.x + this._drift.x,
      this._basePos.y + this._drift.y,
      this._basePos.z
    );

    // Inertia decay: a flick glides to a stop.
    for (const axis of ['x', 'y', 'z']) this._targetVel[axis] *= this.VELOCITY_DECAY;

    this._updateChunks(false);
    this.renderer.render(this.scene, this.camera);
  }

  // ---------- public ----------
  resetView() {
    this._basePos = { x: 0, y: 0, z: this.initialCameraZ };
    this._velocity = { x: 0, y: 0, z: 0 };
    this._targetVel = { x: 0, y: 0, z: 0 };
    this._drift = { x: 0, y: 0 };
    this._updateChunks(true);
  }

  destroy() {
    this._running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);

    this.root.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('pointercancel', this._onPointerUp);
    this.root.removeEventListener('wheel', this._onWheel);
    window.removeEventListener('resize', this._onResize);

    this._chunkCache.forEach((group) => group.children.forEach((m) => m.material.dispose()));
    this._textures.forEach((t) => t.dispose());
    this._geometry.dispose();

    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.root.classList.remove('ic3d-viewport', 'ic3d-dragging');
  }
}
