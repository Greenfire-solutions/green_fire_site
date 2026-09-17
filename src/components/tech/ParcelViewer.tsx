import { useEffect, useMemo, useRef, useState } from 'react';
import { Layers, Minus, Plus, RotateCcw } from 'lucide-react';
import {
  arrayBuffer,
  createGL,
  createProgram,
  indexBuffer,
  lookAt,
  mat4,
  multiply,
  perspective,
  prefersReducedMotion,
  project,
  resizeToDisplay,
  type M4,
} from './glcore';

/* ------------------------------------------------------------------ *
 * Site definition: a stand-in parcel, shaped like the real ones
 * ------------------------------------------------------------------ */

const HALF = 10;

const POND = { x: 5.8, z: -3.2, rx: 2.3, rz: 1.7 };

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Deterministic ground height, shared by the mesh and the hotspot anchors. */
function groundAt(x: number, z: number): number {
  const rolling =
    0.82 * Math.sin(x * 0.28 + 0.4) * Math.cos(z * 0.24 - 0.3) +
    0.52 * Math.sin((x + z) * 0.16) +
    0.27 * Math.cos(x * 0.5 - z * 0.42);

  // a basin under the pond, so the water sits in the ground rather than under it
  const d = Math.hypot((x - POND.x) / (POND.rx * 1.75), (z - POND.z) / (POND.rz * 1.75));
  const basin = 1.55 * (1 - smoothstep(0.25, 1, Math.min(d, 1)));
  return rolling - basin;
}

const STRUCTURES = [
  { x: -3.2, z: -2.4, w: 3.4, d: 2.6, h: 2.8 },
  { x: 1.6, z: -5.0, w: 2.2, d: 2.2, h: 1.6 },
  { x: -5.8, z: 2.8, w: 2.0, d: 3.2, h: 1.2 },
  { x: 3.6, z: 3.2, w: 4.2, d: 3.0, h: 0.9 },
];

const PATH: [number, number][] = [
  [-10, 6.6],
  [-6.4, 5.4],
  [-2.6, 3.6],
  [0.6, 1.2],
  [2.8, -1.6],
  [3.0, -4.4],
  [1.6, -7.4],
];

type LayerId = 'contours' | 'structures' | 'water' | 'routes';

const HOTSPOTS: {
  id: string;
  layer: LayerId;
  label: string;
  title: string;
  body: string;
  anchor: [number, number, number];
}[] = [
  {
    id: 'boundary',
    layer: 'contours',
    label: 'Parcel',
    title: 'Parcel, survey and terrain',
    body: 'Boundaries, easements, setbacks and contours built from the survey, GIS export or drone scan, so what people are looking at matches the legal record instead of a picture somebody drew.',
    anchor: [-HALF + 2.2, groundAt(-HALF + 2.2, HALF - 2.2) + 0.7, HALF - 2.2],
  },
  {
    id: 'structures',
    layer: 'structures',
    label: 'Structures',
    title: 'Structures and phasing',
    body: 'Massing you can switch on and off by phase: what stands today, what is proposed, what arrives in year three. Reviewers stop arguing about which drawing is current.',
    anchor: [
      STRUCTURES[0].x,
      groundAt(STRUCTURES[0].x, STRUCTURES[0].z) + STRUCTURES[0].h + 0.45,
      STRUCTURES[0].z,
    ],
  },
  {
    id: 'water',
    layer: 'water',
    label: 'Water',
    title: 'Water, drainage and planting',
    body: 'Catchment, flow direction, ponds and planting as layers you can toggle. This is usually the layer a room actually argues about, so it gets its own controls.',
    anchor: [POND.x, groundAt(POND.x, POND.z) + 1.5, POND.z],
  },
  {
    id: 'access',
    layer: 'routes',
    label: 'Access',
    title: 'Access, routes and flow',
    body: 'Roads, gates, stages, camping, parking and foot traffic. The layer festival and construction crews use to walk a site before anybody is standing on it.',
    anchor: [PATH[2][0], groundAt(PATH[2][0], PATH[2][1]) + 0.6, PATH[2][1]],
  },
];

/* ------------------------------------------------------------------ *
 * Geometry building
 * ------------------------------------------------------------------ */

class MeshBuilder {
  data: number[] = [];
  idx: number[] = [];
  count = 0;

  vertex(x: number, y: number, z: number, nx: number, ny: number, nz: number, tint: number) {
    this.data.push(x, y, z, nx, ny, nz, tint);
    return this.count++;
  }

  tri(a: number, b: number, c: number) {
    this.idx.push(a, b, c);
  }

  line(a: number, b: number) {
    this.idx.push(a, b);
  }

  mark() {
    return this.idx.length;
  }
}

type Group = { start: number; count: number };

function buildSurface() {
  const m = new MeshBuilder();
  const groups: Record<string, Group> = {};
  const N = 46;

  // Ground
  const base = m.count;
  for (let iz = 0; iz < N; iz++) {
    for (let ix = 0; ix < N; ix++) {
      const x = -HALF + (ix / (N - 1)) * HALF * 2;
      const z = -HALF + (iz / (N - 1)) * HALF * 2;
      const y = groundAt(x, z);
      const e = 0.1;
      const nx = groundAt(x - e, z) - groundAt(x + e, z);
      const nz = groundAt(x, z - e) - groundAt(x, z + e);
      const len = Math.hypot(nx, 2 * e, nz) || 1;
      m.vertex(x, y, z, nx / len, (2 * e) / len, nz / len, 0);
    }
  }
  let start = m.mark();
  for (let iz = 0; iz < N - 1; iz++) {
    for (let ix = 0; ix < N - 1; ix++) {
      const a = base + iz * N + ix;
      m.tri(a, a + N, a + 1);
      m.tri(a + 1, a + N, a + N + 1);
    }
  }
  // Skirt: drops the parcel edge to a base so the model reads as a solid block.
  const BASE = -2.6;
  const EDGE_SEGS = 40;
  for (let e = 0; e < 4; e++) {
    for (let i = 0; i < EDGE_SEGS; i++) {
      const t0 = i / EDGE_SEGS;
      const t1 = (i + 1) / EDGE_SEGS;
      const at = (t: number): [number, number, number[]] => {
        const a = -HALF + t * HALF * 2;
        if (e === 0) return [a, -HALF, [0, 0, -1]];
        if (e === 1) return [HALF, a, [1, 0, 0]];
        if (e === 2) return [-a, HALF, [0, 0, 1]];
        return [-HALF, -a, [-1, 0, 0]];
      };
      const [x0, z0, n] = at(t0);
      const [x1, z1] = at(t1);
      const a = m.vertex(x0, groundAt(x0, z0), z0, n[0], n[1], n[2], 3);
      const b = m.vertex(x1, groundAt(x1, z1), z1, n[0], n[1], n[2], 3);
      const c = m.vertex(x1, BASE, z1, n[0], n[1], n[2], 3);
      const d = m.vertex(x0, BASE, z0, n[0], n[1], n[2], 3);
      // emitted both ways so the skirt survives whichever winding the edge implies
      m.tri(a, b, c);
      m.tri(a, c, d);
      m.tri(c, b, a);
      m.tri(d, c, a);
    }
  }
  groups.ground = { start, count: m.mark() - start };

  // Structures
  start = m.mark();
  for (const s of STRUCTURES) {
    const y0 = groundAt(s.x, s.z) - 0.8;
    const y1 = groundAt(s.x, s.z) + s.h;
    const x0 = s.x - s.w / 2;
    const x1 = s.x + s.w / 2;
    const z0 = s.z - s.d / 2;
    const z1 = s.z + s.d / 2;
    const faces: [number[], number[]][] = [
      [[x0, y1, z0, x1, y1, z0, x1, y1, z1, x0, y1, z1], [0, 1, 0]],
      [[x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1], [0, 0, 1]],
      [[x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0], [0, 0, -1]],
      [[x1, y0, z1, x1, y0, z0, x1, y1, z0, x1, y1, z1], [1, 0, 0]],
      [[x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0], [-1, 0, 0]],
    ];
    for (const [quad, n] of faces) {
      const a = m.vertex(quad[0], quad[1], quad[2], n[0], n[1], n[2], 1);
      const b = m.vertex(quad[3], quad[4], quad[5], n[0], n[1], n[2], 1);
      const c = m.vertex(quad[6], quad[7], quad[8], n[0], n[1], n[2], 1);
      const d = m.vertex(quad[9], quad[10], quad[11], n[0], n[1], n[2], 1);
      m.tri(a, b, c);
      m.tri(a, c, d);
    }
  }
  groups.structures = { start, count: m.mark() - start };

  // Water
  const wy = groundAt(POND.x, POND.z) + 0.95;
  const centre = m.vertex(POND.x, wy, POND.z, 0, 1, 0, 2);
  const ring: number[] = [];
  const SEG = 40;
  for (let i = 0; i < SEG; i++) {
    const a = (i / SEG) * Math.PI * 2;
    ring.push(m.vertex(POND.x + Math.cos(a) * POND.rx, wy, POND.z + Math.sin(a) * POND.rz, 0, 1, 0, 2));
  }
  start = m.mark();
  for (let i = 0; i < SEG; i++) {
    // wound so the surface normal points up; the other order is culled
    m.tri(centre, ring[(i + 1) % SEG], ring[i]);
  }
  groups.water = { start, count: m.mark() - start };

  return { m, groups };
}

function buildLines() {
  const m = new MeshBuilder();
  const groups: Record<string, Group> = {};
  const LIFT = 0.035;

  // Survey grid / contours
  let start = m.mark();
  const N = 46;
  const STEP = 3;
  for (let iz = 0; iz < N; iz += STEP) {
    let prev = -1;
    for (let ix = 0; ix < N; ix++) {
      const x = -HALF + (ix / (N - 1)) * HALF * 2;
      const z = -HALF + (iz / (N - 1)) * HALF * 2;
      const v = m.vertex(x, groundAt(x, z) + LIFT, z, 0, 1, 0, 0);
      if (prev >= 0) m.line(prev, v);
      prev = v;
    }
  }
  for (let ix = 0; ix < N; ix += STEP) {
    let prev = -1;
    for (let iz = 0; iz < N; iz++) {
      const x = -HALF + (ix / (N - 1)) * HALF * 2;
      const z = -HALF + (iz / (N - 1)) * HALF * 2;
      const v = m.vertex(x, groundAt(x, z) + LIFT, z, 0, 1, 0, 0);
      if (prev >= 0) m.line(prev, v);
      prev = v;
    }
  }
  groups.contours = { start, count: m.mark() - start };

  // Parcel boundary
  start = m.mark();
  const EDGE = HALF - 0.35;
  const corners: [number, number][] = [
    [-EDGE, -EDGE],
    [EDGE, -EDGE],
    [EDGE, EDGE],
    [-EDGE, EDGE],
  ];
  for (let c = 0; c < 4; c++) {
    const [ax, az] = corners[c];
    const [bx, bz] = corners[(c + 1) % 4];
    const SEGS = 18;
    let prev = -1;
    for (let i = 0; i <= SEGS; i++) {
      const t = i / SEGS;
      const x = ax + (bx - ax) * t;
      const z = az + (bz - az) * t;
      const v = m.vertex(x, groundAt(x, z) + 0.18, z, 0, 1, 0, 1);
      if (prev >= 0) m.line(prev, v);
      prev = v;
    }
  }
  groups.boundary = { start, count: m.mark() - start };

  // Structure edges
  start = m.mark();
  for (const s of STRUCTURES) {
    const y0 = groundAt(s.x, s.z) - 0.2;
    const y1 = groundAt(s.x, s.z) + s.h;
    const x0 = s.x - s.w / 2;
    const x1 = s.x + s.w / 2;
    const z0 = s.z - s.d / 2;
    const z1 = s.z + s.d / 2;
    const pts: [number, number, number][] = [
      [x0, y0, z0],
      [x1, y0, z0],
      [x1, y0, z1],
      [x0, y0, z1],
      [x0, y1, z0],
      [x1, y1, z0],
      [x1, y1, z1],
      [x0, y1, z1],
    ];
    const ids = pts.map((p) => m.vertex(p[0], p[1], p[2], 0, 1, 0, 2));
    const edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];
    for (const [a, b] of edges) m.line(ids[a], ids[b]);
  }
  groups.structureEdges = { start, count: m.mark() - start };

  // Access route
  start = m.mark();
  let prev = -1;
  for (let i = 0; i < PATH.length - 1; i++) {
    const [ax, az] = PATH[i];
    const [bx, bz] = PATH[i + 1];
    const SEGS = 10;
    for (let k = 0; k <= SEGS; k++) {
      const t = k / SEGS;
      const x = ax + (bx - ax) * t;
      const z = az + (bz - az) * t;
      const v = m.vertex(x, groundAt(x, z) + 0.09, z, 0, 1, 0, 3);
      if (prev >= 0) m.line(prev, v);
      prev = v;
    }
  }
  groups.routes = { start, count: m.mark() - start };

  return { m, groups };
}

/* ------------------------------------------------------------------ *
 * Shaders
 * ------------------------------------------------------------------ */

const SURFACE_VERT = `
precision highp float;
attribute vec3 aPos;
attribute vec3 aNrm;
attribute float aTint;
uniform mat4 uMVP;
varying vec3 vN;
varying float vT;
varying float vFog;
varying float vY;
void main() {
  vec4 clip = uMVP * vec4(aPos, 1.0);
  vN = aNrm;
  vT = aTint;
  vY = aPos.y;
  vFog = 1.0 - smoothstep(20.0, 46.0, clip.w);
  gl_Position = clip;
}
`;

const SURFACE_FRAG = `
precision mediump float;
varying vec3 vN;
varying float vT;
varying float vFog;
varying float vY;
void main() {
  vec3 L = normalize(vec3(-0.42, 0.84, 0.36));
  float d = max(dot(normalize(vN), L), 0.0);
  vec3 ground = mix(vec3(0.022, 0.065, 0.05), vec3(0.075, 0.30, 0.20), clamp(vY * 0.22 + 0.44, 0.0, 1.0));
  vec3 structure = vec3(0.10, 0.33, 0.27);
  vec3 water = vec3(0.05, 0.30, 0.44);
  vec3 skirt = vec3(0.035, 0.055, 0.05);
  vec3 base = ground;
  if (vT > 0.5 && vT < 1.5) base = structure;
  else if (vT > 2.5) base = skirt;
  else if (vT > 1.5) base = water;
  vec3 c = base * (0.22 + d * 1.05);
  c += vec3(0.20, 0.83, 0.51) * pow(d, 14.0) * 0.16;
  if (vT > 1.5 && vT < 2.5) c += vec3(0.30, 0.70, 0.95) * pow(d, 3.0) * 0.22;
  gl_FragColor = vec4(c, vFog);
}
`;

const LINE_VERT = `
precision highp float;
attribute vec3 aPos;
attribute vec3 aNrm;
attribute float aTint;
uniform mat4 uMVP;
varying float vT;
varying float vFog;
void main() {
  vec4 clip = uMVP * vec4(aPos, 1.0);
  vT = aTint;
  vFog = 1.0 - smoothstep(20.0, 48.0, clip.w);
  gl_Position = clip;
}
`;

const LINE_FRAG = `
precision mediump float;
varying float vT;
varying float vFog;
void main() {
  vec3 c = vec3(0.20, 0.62, 0.47);
  float a = 0.48;
  if (vT > 0.5 && vT < 1.5) { c = vec3(0.35, 0.95, 0.65); a = 0.95; }
  else if (vT > 1.5 && vT < 2.5) { c = vec3(0.72, 0.99, 0.86); a = 0.80; }
  else if (vT > 2.5) { c = vec3(0.99, 0.62, 0.28); a = 0.95; }
  gl_FragColor = vec4(c, a * vFog);
}
`;

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

const LAYER_LABELS: { id: LayerId; label: string }[] = [
  { id: 'contours', label: 'Terrain' },
  { id: 'structures', label: 'Structures' },
  { id: 'water', label: 'Water' },
  { id: 'routes', label: 'Routes' },
];

export function ParcelViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hotspotRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [supported, setSupported] = useState(true);
  const [selected, setSelected] = useState<string>('structures');
  const [layers, setLayers] = useState<Record<LayerId, boolean>>({
    contours: true,
    structures: true,
    water: true,
    routes: true,
  });

  const layersRef = useRef(layers);
  useEffect(() => {
    layersRef.current = layers;
    // Hide immediately rather than waiting for the next frame: the loop is paused
    // whenever the canvas is off screen, which would otherwise strand a chip.
    for (const spot of HOTSPOTS) {
      const el = hotspotRefs.current[spot.id];
      if (el && !layers[spot.layer]) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      }
    }
  }, [layers]);

  const resetRef = useRef<(() => void) | null>(null);
  const zoomRef = useRef<((delta: number) => void) | null>(null);

  const detail = useMemo(() => HOTSPOTS.find((h) => h.id === selected) ?? HOTSPOTS[1], [selected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = createGL(canvas);
    if (!gl) {
      setSupported(false);
      return;
    }

    const surfaceProg = createProgram(gl, SURFACE_VERT, SURFACE_FRAG);
    const lineProg = createProgram(gl, LINE_VERT, LINE_FRAG);
    if (!surfaceProg || !lineProg) {
      setSupported(false);
      return;
    }

    const surface = buildSurface();
    const lines = buildLines();

    const sVbo = arrayBuffer(gl, new Float32Array(surface.m.data));
    const sIbo = indexBuffer(gl, new Uint16Array(surface.m.idx));
    const lVbo = arrayBuffer(gl, new Float32Array(lines.m.data));
    const lIbo = indexBuffer(gl, new Uint16Array(lines.m.idx));

    const locs = (prog: WebGLProgram) => ({
      aPos: gl.getAttribLocation(prog, 'aPos'),
      aNrm: gl.getAttribLocation(prog, 'aNrm'),
      aTint: gl.getAttribLocation(prog, 'aTint'),
      uMVP: gl.getUniformLocation(prog, 'uMVP'),
    });
    const sLoc = locs(surfaceProg);
    const lLoc = locs(lineProg);

    const STRIDE = 7 * 4;
    const bindAttribs = (loc: ReturnType<typeof locs>) => {
      gl.enableVertexAttribArray(loc.aPos);
      gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, STRIDE, 0);
      gl.enableVertexAttribArray(loc.aNrm);
      gl.vertexAttribPointer(loc.aNrm, 3, gl.FLOAT, false, STRIDE, 12);
      gl.enableVertexAttribArray(loc.aTint);
      gl.vertexAttribPointer(loc.aTint, 1, gl.FLOAT, false, STRIDE, 24);
    };

    const proj: M4 = mat4();
    const view: M4 = mat4();
    const mvp: M4 = mat4();

    const reduced = prefersReducedMotion();
    let azimuth = -0.9;
    let elevation = 0.46;
    let radius = 25;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let idleSince = performance.now();
    let visible = true;
    let running = true;
    let raf = 0;
    let last = performance.now();

    resetRef.current = () => {
      azimuth = -0.9;
      elevation = 0.46;
      radius = 25;
      idleSince = performance.now();
    };
    zoomRef.current = (delta: number) => {
      radius = Math.min(38, Math.max(13, radius + delta));
    };

    const placeHotspots = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      for (const spot of HOTSPOTS) {
        const el = hotspotRefs.current[spot.id];
        if (!el) continue;
        if (!layersRef.current[spot.layer]) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          continue;
        }
        const p = project(mvp, spot.anchor[0], spot.anchor[1], spot.anchor[2]);
        if (!p || Math.abs(p.x) > 0.94 || Math.abs(p.y) > 0.9) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          continue;
        }
        el.style.transform = `translate3d(${(p.x * 0.5 + 0.5) * w}px, ${(1 - (p.y * 0.5 + 0.5)) * h}px, 0) translate(-50%, -50%)`;
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      }
    };

    const draw = () => {
      resizeToDisplay(gl, canvas);
      const aspect = canvas.width / Math.max(1, canvas.height);
      perspective(proj, (42 * Math.PI) / 180, aspect, 0.5, 120);

      const cx = Math.cos(elevation) * radius;
      lookAt(
        view,
        [Math.sin(azimuth) * cx, Math.sin(elevation) * radius + 1.2, Math.cos(azimuth) * cx],
        [0, 0.3, 0],
        [0, 1, 0],
      );
      multiply(mvp, proj, view);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.CULL_FACE);

      const active = layersRef.current;

      gl.useProgram(surfaceProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, sVbo);
      bindAttribs(sLoc);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sIbo);
      gl.uniformMatrix4fv(sLoc.uMVP, false, mvp);
      const sGroups: [string, boolean][] = [
        ['ground', true],
        ['structures', active.structures],
        ['water', active.water],
      ];
      for (const [name, on] of sGroups) {
        if (!on) continue;
        const g = surface.groups[name];
        gl.drawElements(gl.TRIANGLES, g.count, gl.UNSIGNED_SHORT, g.start * 2);
      }

      gl.disable(gl.CULL_FACE);
      gl.useProgram(lineProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, lVbo);
      bindAttribs(lLoc);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lIbo);
      gl.uniformMatrix4fv(lLoc.uMVP, false, mvp);
      const lGroups: [string, boolean][] = [
        ['contours', active.contours],
        ['boundary', true],
        ['structureEdges', active.structures],
        ['routes', active.routes],
      ];
      for (const [name, on] of lGroups) {
        if (!on) continue;
        const g = lines.groups[name];
        gl.drawElements(gl.LINES, g.count, gl.UNSIGNED_SHORT, g.start * 2);
      }

      placeHotspots();
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (visible) {
        if (!dragging && !reduced && now - idleSince > 2500) azimuth += dt * 0.11;
        draw();
      }
      raf = requestAnimationFrame(frame);
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      idleSince = performance.now();
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      azimuth -= (e.clientX - lastX) * 0.007;
      elevation = Math.min(1.25, Math.max(0.1, elevation + (e.clientY - lastY) * 0.005));
      lastX = e.clientX;
      lastY = e.clientY;
      idleSince = performance.now();
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      idleSince = performance.now();
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0, rootMargin: '250px' },
    );
    observer.observe(canvas);

    const onLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
    };
    canvas.addEventListener('webglcontextlost', onLost);

    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('webglcontextlost', onLost);
      resetRef.current = null;
      zoomRef.current = null;
      gl.deleteBuffer(sVbo);
      gl.deleteBuffer(sIbo);
      gl.deleteBuffer(lVbo);
      gl.deleteBuffer(lIbo);
      gl.deleteProgram(surfaceProg);
      gl.deleteProgram(lineProg);
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-950">
      <div className="relative">
        <div className="relative h-[380px] w-full overflow-hidden sm:h-[460px] lg:h-[540px]">
          {supported ? (
            <>
              <canvas
                ref={canvasRef}
                className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
              />
              {HOTSPOTS.map((spot) => (
                <button
                  key={spot.id}
                  type="button"
                  ref={(el) => {
                    hotspotRefs.current[spot.id] = el;
                  }}
                  onClick={() => setSelected(spot.id)}
                  style={{ opacity: 0 }}
                  className={`absolute left-0 top-0 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm transition-colors ${
                    selected === spot.id
                      ? 'border-emerald-400/60 bg-emerald-400/20 text-emerald-100'
                      : 'border-white/15 bg-neutral-950/70 text-stone-300 hover:border-emerald-400/40 hover:text-emerald-200'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      selected === spot.id ? 'bg-emerald-300' : 'bg-emerald-400/60'
                    }`}
                  />
                  {spot.label}
                </button>
              ))}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_50%_100%,rgba(52,211,153,0.18),transparent_60%)] px-6 text-center">
              <p className="max-w-sm text-sm text-stone-400">
                Your browser has 3D turned off, so the live site model is hidden. Everything on this
                page still works, and so does every package, because each one ships with a flat
                fallback for exactly this case.
              </p>
            </div>
          )}
        </div>

        {supported && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <span className="rounded-full border border-white/10 bg-neutral-950/80 px-3 py-1.5 text-[11px] font-semibold text-stone-400 backdrop-blur-sm">
              Drag to orbit
            </span>
            <div className="pointer-events-auto flex gap-2">
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => zoomRef.current?.(-3)}
                className="rounded-full border border-white/10 bg-neutral-950/80 p-2 text-stone-300 backdrop-blur-sm hover:border-emerald-400/40 hover:text-emerald-300"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => zoomRef.current?.(3)}
                className="rounded-full border border-white/10 bg-neutral-950/80 p-2 text-stone-300 backdrop-blur-sm hover:border-emerald-400/40 hover:text-emerald-300"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Reset view"
                onClick={() => resetRef.current?.()}
                className="rounded-full border border-white/10 bg-neutral-950/80 p-2 text-stone-300 backdrop-blur-sm hover:border-emerald-400/40 hover:text-emerald-300"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 border-t border-white/10 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:p-8">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
            <Layers className="h-4 w-4" /> Layers
          </p>
          <div className="flex flex-wrap gap-2">
            {LAYER_LABELS.map((layer) => (
              <button
                key={layer.id}
                type="button"
                aria-pressed={layers[layer.id]}
                onClick={() => setLayers((prev) => ({ ...prev, [layer.id]: !prev[layer.id] }))}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                  layers[layer.id]
                    ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                    : 'border-white/10 bg-white/5 text-stone-500 hover:text-stone-300'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-stone-500">
            Every package ships with controls like these, named in the client&rsquo;s own
            language: phases, zones, stages, bid packages, whatever the room already calls them.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Hotspot</p>
          <h3 className="mt-2 text-lg font-bold text-white">{detail.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-stone-400">{detail.body}</p>
        </div>
      </div>
    </div>
  );
}
