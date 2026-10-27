import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildObject } from './objects';

export type StoreApp = {
  id: string;
  title: string;
  line: string;
  bio: string;
  genre: string;
  free: boolean;
  access: 'member' | 'builder' | null;
  price_usd: number;
  video: string | null;
  poster: string | null;
  object: string;
  ready: boolean;
  github: string | null;
  /* The Stripe payment link, only when it charges exactly price_usd. */
  buy_url?: string | null;
};
export type Genre = { label: string; sector?: string };

/* One colour per island, from the Greenfire palette: lime is the brand,
   the rest are its neighbours so the world still reads as one place. */
export const GENRE_COLOR: Record<string, string> = {
  music: '#E8913A',
  land: '#8CC63F',
  events: '#E06C9F',
  business: '#4FD1C5',
  ai: '#B49BE0',
  story: '#F2C94C',
};
const colorOf = (g: string) => GENRE_COLOR[g] || '#8CC63F';

export type WorldEvents = {
  onHover: (id: string | null, x: number, y: number) => void;
  onSelect: (id: string | null) => void;
  onLabels: (labels: { genre: string; x: number; y: number; visible: boolean }[]) => void;
};

export type World = { dispose: () => void; focus: (id: string | null) => void; focusGenre: (g: string | null) => void; setInsets: (top: number, bottom: number) => void };

export function createWorld(canvas: HTMLCanvasElement, apps: StoreApp[], genres: Record<string, Genre>, ev: WorldEvents): World {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#04110f');
  scene.fog = new THREE.FogExp2('#04110f', 0.022);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 5;
  controls.maxDistance = 90;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;

  scene.add(new THREE.HemisphereLight('#bff5d0', '#06140f', 0.9));
  const sun = new THREE.DirectionalLight('#fff4d6', 1.4);
  sun.position.set(12, 24, 10);
  scene.add(sun);

  /* Stars far away, fireflies close, both cheap Points. */
  const starGeo = new THREE.BufferGeometry();
  const sp: number[] = [];
  for (let i = 0; i < 900; i++) {
    const r = 120 + Math.random() * 80, t = Math.random() * Math.PI * 2, p = Math.random() * Math.PI * 0.45;
    sp.push(r * Math.sin(p) * Math.cos(t), r * Math.cos(p) * 0.8 + 10, r * Math.sin(p) * Math.sin(t));
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#d9ffe3', size: 0.6, sizeAttenuation: true, fog: false })));

  const flyGeo = new THREE.BufferGeometry();
  const fp: number[] = [];
  for (let i = 0; i < 260; i++) fp.push((Math.random() - 0.5) * 60, Math.random() * 12 - 2, (Math.random() - 0.5) * 60);
  flyGeo.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3));
  const flies = new THREE.Points(flyGeo, new THREE.PointsMaterial({ color: '#c8ff7a', size: 0.18, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(flies);

  /* A faint glowing ground ring so the islands float over something. */
  const ground = new THREE.Mesh(new THREE.RingGeometry(4, 40, 64, 1), new THREE.MeshBasicMaterial({ color: '#0d2a1c', transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -4;
  scene.add(ground);
  const grid = new THREE.PolarGridHelper(40, 12, 8, 64, '#174d33', '#0f3022');
  grid.position.y = -3.98;
  scene.add(grid);

  /* Islands: one per genre that has apps, around a circle. */
  /* The busiest islands go to the back of the ring and the small ones to
     the front, so nothing big looms over the shelf at the bottom. */
  const count = (g: string) => apps.filter((a) => a.genre === g).length;
  const present = Object.keys(genres).filter((g) => count(g) > 0).sort((x, y) => count(y) - count(x));
  const used: string[] = new Array(present.length);
  const back = Math.floor(present.length / 2);
  present.forEach((g, k) => { used[(back + (k % 2 ? -1 : 1) * Math.ceil(k / 2) + present.length) % present.length] = g; });
  const R = used.length <= 1 ? 0 : Math.max(10, used.length * 2.6);
  let extent = 8;
  const islands: { genre: string; group: THREE.Group; anchor: THREE.Vector3; phase: number }[] = [];
  const pickables: THREE.Object3D[] = [];
  const byId = new Map<string, THREE.Group>();

  used.forEach((g, i) => {
    const ang = (i / used.length) * Math.PI * 2;
    const group = new THREE.Group();
    group.position.set(Math.sin(ang) * R, 0, Math.cos(ang) * R);
    const col = new THREE.Color(colorOf(g));
    const mine = apps.filter((a) => a.genre === g);
    const radius = Math.max(3.2, 1.6 + mine.length * 0.55);

    const rock = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.72, 1.2, 9), new THREE.MeshStandardMaterial({ color: '#173326', roughness: 0.9, flatShading: true }));
    rock.position.y = -0.6;
    const under = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.72, radius * 1.1, 9), new THREE.MeshStandardMaterial({ color: '#0e2219', roughness: 1, flatShading: true }));
    under.rotation.x = Math.PI;
    under.position.y = -1.2 - radius * 0.55;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.98, radius * 0.98, 0.08, 9), new THREE.MeshStandardMaterial({ color: new THREE.Color('#1f4a2b').lerp(col, 0.08), roughness: 0.85, flatShading: true }));
    top.position.y = 0.02;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.99, 0.05, 6, 72), new THREE.MeshBasicMaterial({ color: col }));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.07;
    const light = new THREE.PointLight(col, 7, radius * 4, 2);
    light.position.y = 3;
    group.add(rock, under, top, rim, light);

    mine.forEach((a, j) => {
      const obj = buildObject(a.object, colorOf(g));
      obj.userData.base = 1.35;
      const n = mine.length;
      const ring = n === 1 ? 0 : radius * 0.58;
      const t = (j / n) * Math.PI * 2 + 0.4;
      obj.position.set(Math.sin(t) * ring, 0.06, Math.cos(t) * ring);
      obj.rotation.y = t + Math.PI;
      /* A pedestal and a soft halo, so each app reads as an exhibit. */
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.12, 8), new THREE.MeshStandardMaterial({ color: '#0f2a1d', roughness: 0.6, flatShading: true }));
      ped.position.y = -0.02;
      const halo = new THREE.Mesh(new THREE.CircleGeometry(1.1, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: a.ready ? 0.22 : 0.08, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = 0.05;
      obj.add(ped, halo);
      if (!a.ready) obj.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined; if (m && 'opacity' in m && !(o as THREE.Mesh).geometry?.type.includes('Circle')) { m.transparent = true; m.opacity = 0.55; } });
      obj.userData = { ...obj.userData, appId: a.id, baseY: obj.position.y, halo, ready: a.ready };
      obj.traverse((o) => { o.userData.appId = a.id; });
      group.add(obj);
      pickables.push(obj);
      byId.set(a.id, obj);
    });

    scene.add(group);
    islands.push({ genre: g, group, anchor: new THREE.Vector3(0, 3.6, 0), phase: i * 1.3 });
    extent = Math.max(extent, R + radius);
  });

  /* The opening view fits every island, whatever the window shape: a wide
     window and a tall one need different distances, and the near island
     looms, so it is measured from the whole ring plus a margin. */
  const home = () => {
    const aspect = Math.max(0.5, camera.aspect || 1);
    const half = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(aspect, 1.6));
    /* Less open sky between the page header and the shelf: stand further back. */
    const open = Math.max(0.35, 1 - (insets.top + insets.bottom) / Math.max(1, canvas.clientHeight));
    const d = (extent / Math.tan(half)) * 1.05 / Math.sqrt(open);
    const tilt = THREE.MathUtils.degToRad(42);
    return { target: new THREE.Vector3(0, 0, -extent * 0.12), camera: new THREE.Vector3(0, d * Math.sin(tilt), d * Math.cos(tilt) - extent * 0.12) };
  };

  /* ------------------------------------------------------- interaction */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovered: string | null = null;
  let selected: string | null = null;
  let downAt = { x: 0, y: 0, t: 0 };

  const pick = (e: PointerEvent): string | null => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables, true)[0];
    return (hit?.object.userData.appId as string) || null;
  };
  const onMove = (e: PointerEvent) => {
    const id = pick(e);
    if (id !== hovered) {
      hovered = id;
      canvas.style.cursor = id ? 'pointer' : 'grab';
    }
    const r = canvas.getBoundingClientRect();
    ev.onHover(id, e.clientX - r.left, e.clientY - r.top);
  };
  const onDown = (e: PointerEvent) => { downAt = { x: e.clientX, y: e.clientY, t: performance.now() }; controls.autoRotate = false; };
  const onUp = (e: PointerEvent) => {
    /* A drag to look around is not a click on what is under the cursor. */
    if (Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 6 || performance.now() - downAt.t > 500) return;
    const id = pick(e);
    focus(id);
    ev.onSelect(id);
  };
  const onLeave = () => { hovered = null; ev.onHover(null, 0, 0); };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointerleave', onLeave);

  /* Camera flights: ease the target and the camera to a new place. */
  let flight: { fromT: THREE.Vector3; toT: THREE.Vector3; fromC: THREE.Vector3; toC: THREE.Vector3; start: number; dur: number } | null = null;
  const flyTo = (target: THREE.Vector3, dist: number) => {
    const dir = camera.position.clone().sub(controls.target).setY(0).normalize();
    if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
    const toC = target.clone().add(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, dist * 0.45, 0));
    flight = { fromT: controls.target.clone(), toT: target.clone(), fromC: camera.position.clone(), toC, start: performance.now(), dur: 1100 };
  };
  function focus(id: string | null) {
    selected = id;
    if (!id) return;
    const obj = byId.get(id);
    if (!obj) return;
    controls.autoRotate = false;
    flyTo(obj.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.8, 0)), 9.5);
  }
  function focusGenre(g: string | null) {
    controls.autoRotate = !g;
    if (!g) { const h = home(); flight = { fromT: controls.target.clone(), toT: h.target, fromC: camera.position.clone(), toC: h.camera, start: performance.now(), dur: 1100 }; return; }
    const isl = islands.find((i) => i.genre === g);
    if (isl) flyTo(isl.group.position.clone().add(new THREE.Vector3(0, 1, 0)), 14);
  }

  /* ------------------------------------------------------------ the loop */
  /* The page lays a header over the top of the canvas and a shelf over the
     bottom: the picture is shifted so its middle is the middle of what shows. */
  const insets = { top: 0, bottom: 0 };
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.setViewOffset(w, h, 0, -(insets.top - insets.bottom) / 2, w, h);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  const start = home();
  camera.position.copy(start.camera);
  controls.target.copy(start.target);

  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(canvas);

  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  let raf = 0;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();
    if (flight) {
      const k = Math.min(1, (performance.now() - flight.start) / flight.dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      controls.target.lerpVectors(flight.fromT, flight.toT, e);
      camera.position.lerpVectors(flight.fromC, flight.toC, e);
      if (k >= 1) flight = null;
    }
    controls.update();
    for (const isl of islands) isl.group.position.y = Math.sin(t * 0.6 + isl.phase) * 0.35;
    for (const obj of pickables) {
      const id = obj.userData.appId as string;
      const on = id === hovered || id === selected;
      const base = (obj.userData.base as number) || 1;
      const s = obj.scale.x + ((on ? base * 1.18 : base) - obj.scale.x) * 0.15;
      obj.scale.setScalar(s);
      obj.rotation.y += on ? 0.012 : 0.003;
      const halo = obj.userData.halo as THREE.Mesh;
      /* Ready apps glow, the ones still being made ready barely do. */
      const rest = obj.userData.ready ? 0.3 : 0.06;
      (halo.material as THREE.MeshBasicMaterial).opacity += ((on ? 0.55 : rest) - (halo.material as THREE.MeshBasicMaterial).opacity) * 0.1;
    }
    const pos = flyGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, pos.getY(i) + Math.sin(t + i) * 0.004);
    pos.needsUpdate = true;
    renderer.render(scene, camera);

    const w = canvas.clientWidth, h = canvas.clientHeight;
    ev.onLabels(islands.map((isl) => {
      tmp.copy(isl.anchor).applyMatrix4(isl.group.matrixWorld).project(camera);
      return { genre: isl.genre, x: ((tmp.x + 1) / 2) * w, y: ((1 - tmp.y) / 2) * h, visible: tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1 };
    }));
  };
  frame();

  return {
    focus,
    focusGenre,
    setInsets: (top: number, bottom: number) => {
      const first = !insets.top && !insets.bottom;
      insets.top = top;
      insets.bottom = bottom;
      resize();
      if (first && !selected) { const h = home(); camera.position.copy(h.camera); controls.target.copy(h.target); }
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
      });
      renderer.dispose();
    },
  };
}
