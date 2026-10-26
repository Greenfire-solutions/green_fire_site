import * as THREE from 'three';

/* Every app on the store is a small procedural object, built here from the
   one or two words its listing names ("vinyl turntable", "festival tent").
   No model files: the whole shop window is generated, so it loads fast on a
   phone and a new app never waits for someone to model it. */

export type Mats = { body: THREE.MeshStandardMaterial; accent: THREE.MeshStandardMaterial; glow: THREE.MeshStandardMaterial };

export function materials(color: string): Mats {
  const c = new THREE.Color(color);
  return {
    body: new THREE.MeshStandardMaterial({ color: new THREE.Color('#1d3a2c').lerp(c, 0.35), roughness: 0.55, metalness: 0.15, flatShading: true }),
    accent: new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.2, emissive: c, emissiveIntensity: 0.25, flatShading: true }),
    glow: new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.2, roughness: 0.3 }),
  };
}

const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(g, m);
  o.position.set(x, y, z);
  return o;
};

type Builder = (m: Mats) => THREE.Object3D[];

const B: Record<string, Builder> = {
  turntable: (m) => {
    const disc = mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 32), m.body, 0, 0.32, 0);
    const label = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 24), m.glow, 0, 0.33, 0);
    const base = mesh(new THREE.BoxGeometry(1.9, 0.26, 1.6), m.accent, 0, 0.13, 0);
    const arm = mesh(new THREE.BoxGeometry(0.08, 0.06, 1.0), m.glow, 0.7, 0.42, 0.1);
    arm.rotation.y = 0.35;
    return [base, disc, label, arm];
  },
  tent: (m) => {
    const t = mesh(new THREE.ConeGeometry(1.0, 1.3, 4), m.accent, 0, 0.65, 0);
    t.rotation.y = Math.PI / 4;
    const door = mesh(new THREE.ConeGeometry(0.35, 0.6, 3), m.glow, 0, 0.3, 0.55);
    const flag = mesh(new THREE.BoxGeometry(0.32, 0.18, 0.02), m.glow, 0.16, 1.45, 0);
    const pole = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), m.body, 0, 1.4, 0);
    return [t, door, pole, flag];
  },
  cabin: (m) => {
    const walls = mesh(new THREE.BoxGeometry(1.3, 0.8, 1.0), m.body, 0, 0.4, 0);
    const roof = mesh(new THREE.ConeGeometry(1.05, 0.6, 4), m.accent, 0, 1.1, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1, 1, 0.8);
    const win = mesh(new THREE.BoxGeometry(0.28, 0.24, 0.02), m.glow, 0.32, 0.45, 0.51);
    const door = mesh(new THREE.BoxGeometry(0.24, 0.45, 0.02), m.glow, -0.3, 0.23, 0.51);
    return [walls, roof, win, door];
  },
  lockbox: (m) => {
    const box = mesh(new THREE.BoxGeometry(1.2, 0.75, 0.9), m.body, 0, 0.38, 0);
    const lid = mesh(new THREE.BoxGeometry(1.26, 0.14, 0.96), m.accent, 0, 0.8, 0);
    const lock = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 20), m.glow, 0, 0.55, 0.47);
    lock.rotation.x = Math.PI / 2;
    return [box, lid, lock];
  },
  creature: (m) => {
    const body = mesh(new THREE.IcosahedronGeometry(0.55, 1), m.accent, 0, 0.55, 0);
    const head = mesh(new THREE.IcosahedronGeometry(0.38, 1), m.accent, 0, 1.2, 0.18);
    const e1 = mesh(new THREE.ConeGeometry(0.12, 0.22, 4), m.body, -0.24, 1.55, 0.12);
    const e2 = mesh(new THREE.ConeGeometry(0.12, 0.22, 4), m.body, 0.24, 1.55, 0.12);
    const tail = mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.9, 6), m.glow, 0, 0.45, -0.6);
    tail.rotation.x = 1.0;
    const eyes = [mesh(new THREE.SphereGeometry(0.05, 8, 8), m.glow, -0.12, 1.25, 0.52), mesh(new THREE.SphereGeometry(0.05, 8, 8), m.glow, 0.12, 1.25, 0.52)];
    return [body, head, e1, e2, tail, ...eyes];
  },
  plant: (m) => {
    const pot = mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.5, 8), m.body, 0, 0.25, 0);
    const out: THREE.Object3D[] = [pot];
    for (let i = 0; i < 7; i++) {
      const leaf = mesh(new THREE.ConeGeometry(0.14, 0.9, 4), m.accent, 0, 0.9, 0);
      leaf.rotation.z = (i - 3) * 0.32;
      leaf.rotation.y = i * 0.9;
      leaf.position.x = Math.sin(i * 0.9) * 0.18;
      leaf.position.z = Math.cos(i * 0.9) * 0.18;
      out.push(leaf);
    }
    out.push(mesh(new THREE.IcosahedronGeometry(0.12, 0), m.glow, 0, 1.4, 0));
    return out;
  },
  tree: (m) => {
    const trunk = mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.9, 6), m.body, 0, 0.45, 0);
    const c1 = mesh(new THREE.IcosahedronGeometry(0.6, 0), m.accent, 0, 1.15, 0);
    const c2 = mesh(new THREE.IcosahedronGeometry(0.4, 0), m.accent, 0.3, 1.55, 0.1);
    const fruit = mesh(new THREE.IcosahedronGeometry(0.09, 0), m.glow, -0.35, 1.0, 0.4);
    return [trunk, c1, c2, fruit];
  },
  greenhouse: (m) => {
    const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.4, 0.8, 1.0)), new THREE.LineBasicMaterial({ color: m.glow.color }));
    frame.position.y = 0.4;
    const glass = mesh(new THREE.BoxGeometry(1.38, 0.78, 0.98), new THREE.MeshStandardMaterial({ color: m.accent.color, transparent: true, opacity: 0.18, roughness: 0.1 }), 0, 0.4, 0);
    const roof = mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 4, 1, true, 0, Math.PI), m.accent, 0, 0.8, 0);
    roof.rotation.z = Math.PI / 2;
    roof.material = new THREE.MeshStandardMaterial({ color: m.accent.color, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const sprout = mesh(new THREE.IcosahedronGeometry(0.22, 0), m.glow, 0, 0.25, 0);
    return [glass, frame, roof, sprout];
  },
  book: (m) => {
    const cover = mesh(new THREE.BoxGeometry(1.1, 0.16, 1.4), m.accent, 0, 0.3, 0);
    const pages = mesh(new THREE.BoxGeometry(1.04, 0.12, 1.34), new THREE.MeshStandardMaterial({ color: '#f1ecd9', flatShading: true }), 0.02, 0.44, 0);
    const top = mesh(new THREE.BoxGeometry(1.1, 0.05, 1.4), m.accent, 0, 0.52, 0);
    const spark = mesh(new THREE.OctahedronGeometry(0.16, 0), m.glow, 0, 0.95, 0);
    const stand = mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.22, 6), m.body, 0, 0.11, 0);
    return [stand, cover, pages, top, spark];
  },
  globe: (m) => {
    const g = mesh(new THREE.IcosahedronGeometry(0.62, 1), m.accent, 0, 0.95, 0);
    const ring = mesh(new THREE.TorusGeometry(0.85, 0.03, 6, 48), m.glow, 0, 0.95, 0);
    ring.rotation.x = 1.2;
    const stand = mesh(new THREE.CylinderGeometry(0.1, 0.42, 0.3, 6), m.body, 0, 0.15, 0);
    return [stand, g, ring];
  },
  terrain: (m) => {
    const geo = new THREE.PlaneGeometry(1.8, 1.8, 8, 8);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 2.2) * Math.cos(pos.getY(i) * 1.8) * 0.22 + 0.22);
    geo.computeVertexNormals();
    const land = mesh(geo, m.accent, 0, 0.12, 0);
    land.rotation.x = -Math.PI / 2;
    const flagPole = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6), m.body, 0.3, 0.7, -0.2);
    const flag = mesh(new THREE.BoxGeometry(0.3, 0.18, 0.02), m.glow, 0.45, 1.0, -0.2);
    return [land, flagPole, flag];
  },
  microphone: (m) => {
    const head = mesh(new THREE.IcosahedronGeometry(0.32, 1), m.accent, 0, 1.45, 0);
    const neck = mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.7, 10), m.body, 0, 0.95, 0);
    const ring = mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 24), m.glow, 0, 1.25, 0);
    ring.rotation.x = Math.PI / 2;
    const stand = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), m.body, 0, 0.35, 0);
    const base = mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.08, 16), m.body, 0, 0.04, 0);
    return [base, stand, neck, ring, head];
  },
  headphones: (m) => {
    const band = mesh(new THREE.TorusGeometry(0.6, 0.07, 8, 24, Math.PI), m.accent, 0, 0.8, 0);
    const l = mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.2, 16), m.body, -0.6, 0.75, 0);
    const r = mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.2, 16), m.body, 0.6, 0.75, 0);
    l.rotation.z = r.rotation.z = Math.PI / 2;
    const gl = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 16), m.glow, -0.62, 0.75, 0);
    gl.rotation.z = Math.PI / 2;
    return [band, l, r, gl];
  },
  camera: (m) => {
    const body = mesh(new THREE.BoxGeometry(1.2, 0.7, 0.6), m.body, 0, 0.55, 0);
    const lens = mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.45, 20), m.accent, 0, 0.55, 0.5);
    lens.rotation.x = Math.PI / 2;
    const glass = mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 20), m.glow, 0, 0.55, 0.74);
    glass.rotation.x = Math.PI / 2;
    const reel1 = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 16), m.accent, -0.3, 1.15, 0);
    const reel2 = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 16), m.accent, 0.3, 1.15, 0);
    reel1.rotation.x = reel2.rotation.x = Math.PI / 2;
    return [body, lens, glass, reel1, reel2];
  },
  lantern: (m) => {
    const cage = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.4, 0.4, 0.8, 6)), new THREE.LineBasicMaterial({ color: m.accent.color }));
    cage.position.y = 0.6;
    const flame = mesh(new THREE.IcosahedronGeometry(0.22, 1), m.glow, 0, 0.6, 0);
    const cap = mesh(new THREE.ConeGeometry(0.48, 0.3, 6), m.body, 0, 1.15, 0);
    const base = mesh(new THREE.CylinderGeometry(0.45, 0.48, 0.12, 6), m.body, 0, 0.16, 0);
    return [base, cage, flame, cap];
  },
  helmet: (m) => {
    const dome = mesh(new THREE.SphereGeometry(0.6, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), m.accent, 0, 0.35, 0);
    const brim = mesh(new THREE.CylinderGeometry(0.78, 0.8, 0.08, 20), m.accent, 0, 0.36, 0.06);
    const ridge = mesh(new THREE.BoxGeometry(0.12, 0.12, 1.1), m.glow, 0, 0.82, 0);
    const base = mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.3, 8), m.body, 0, 0.15, 0);
    return [base, dome, brim, ridge];
  },
  compass: (m) => {
    const disc = mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.14, 32), m.accent, 0, 0.3, 0);
    const face = mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.15, 32), m.body, 0, 0.31, 0);
    const needle = mesh(new THREE.ConeGeometry(0.08, 0.95, 4), m.glow, 0, 0.42, 0);
    needle.rotation.x = Math.PI / 2;
    needle.rotation.z = 0.6;
    return [disc, face, needle];
  },
  speaker: (m) => {
    const box = mesh(new THREE.BoxGeometry(0.9, 1.3, 0.7), m.body, 0, 0.65, 0);
    const woofer = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 24), m.glow, 0, 0.5, 0.36);
    const tweet = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16), m.accent, 0, 1.0, 0.36);
    woofer.rotation.x = tweet.rotation.x = Math.PI / 2;
    return [box, woofer, tweet];
  },
  tooth: (m) => {
    const crown = mesh(new THREE.IcosahedronGeometry(0.5, 1), m.accent, 0, 0.95, 0);
    crown.scale.set(1, 0.8, 0.9);
    const r1 = mesh(new THREE.ConeGeometry(0.18, 0.7, 6), m.accent, -0.2, 0.4, 0);
    const r2 = mesh(new THREE.ConeGeometry(0.18, 0.7, 6), m.accent, 0.2, 0.4, 0);
    r1.rotation.x = r2.rotation.x = Math.PI;
    const shine = mesh(new THREE.OctahedronGeometry(0.1, 0), m.glow, 0.25, 1.25, 0.35);
    return [crown, r1, r2, shine];
  },
  crystal: (m) => {
    const c1 = mesh(new THREE.OctahedronGeometry(0.55, 0), m.accent, 0, 1.0, 0);
    c1.scale.set(0.8, 1.5, 0.8);
    const c2 = mesh(new THREE.OctahedronGeometry(0.28, 0), m.glow, 0.5, 0.45, 0.2);
    c2.scale.set(0.8, 1.6, 0.8);
    const c3 = mesh(new THREE.OctahedronGeometry(0.22, 0), m.glow, -0.45, 0.4, -0.1);
    c3.scale.set(0.8, 1.6, 0.8);
    const base = mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.2, 6), m.body, 0, 0.1, 0);
    return [base, c1, c2, c3];
  },
};

/* Words in a listing's object, mapped to the builder that draws them. The
   first match wins; anything unknown becomes a crystal, which reads as
   "something made here" rather than as a mistake. */
const WORDS: [RegExp, string][] = [
  [/turntable|vinyl|record|deck|mixer|controller/, 'turntable'],
  [/tent|festival|marquee|canopy tent/, 'tent'],
  [/cabin|house|home|lodge|key|cottage|barn/, 'cabin'],
  [/lock|box|safe|chest|vault/, 'lockbox'],
  [/panda|fox|animal|creature|dragon|cat|dog|bird|owl|rat\b/, 'creature'],
  [/greenhouse|glass/, 'greenhouse'],
  [/leaf|plant|hemp|seed|sprout|flower|cannabis/, 'plant'],
  [/tree|grove|forest|oak/, 'tree'],
  [/book|scroll|story|tome|journal|page|desk|folder|organizer|press kit/, 'book'],
  [/globe|world|planet|earth|disco|ball|orb/, 'globe'],
  [/map|terrain|land|hill|parcel|plot|survey|blueprint|scale model/, 'terrain'],
  [/mic|podcast|microphone/, 'microphone'],
  [/headphone|earphone/, 'headphones'],
  [/camera|film|clapper|projector|reel|video/, 'camera'],
  [/lantern|lamp|bulb|light|torch|fire|flame/, 'lantern'],
  [/helmet|hard hat|hat/, 'helmet'],
  [/compass|astrolabe|sextant/, 'compass'],
  [/speaker|drum|amp|synth|keyboard|guitar|beat machine|sampler/, 'speaker'],
  [/tooth|dental/, 'tooth'],
];

export function buildObject(word: string, color: string): THREE.Group {
  const w = (word || '').toLowerCase();
  const kind = WORDS.find(([re]) => re.test(w))?.[1] || 'crystal';
  const g = new THREE.Group();
  for (const o of B[kind](materials(color))) {
    if ((o as THREE.Mesh).isMesh) {
      (o as THREE.Mesh).castShadow = true;
    }
    g.add(o);
  }
  g.userData.kind = kind;
  return g;
}
