import { useEffect, useRef, useState } from 'react';
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
  resizeToDisplay,
  type M4,
} from './glcore';

const VERT = `
precision highp float;
attribute vec2 aGrid;
uniform mat4 uMVP;
uniform float uTime;
varying float vH;
varying float vFog;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  // depth fans outward so a modest grid covers the whole frame
  float tz = aGrid.y * 0.5 + 0.5;
  float z = mix(12.0, -82.0, pow(tz, 0.82));
  float x = aGrid.x * (22.0 + 40.0 * pow(tz, 1.15));

  float drift = uTime * 2.6;
  float h = fbm(vec2(x * 0.042, (z - drift) * 0.042));
  h = pow(h, 1.55) * 13.0;
  h *= smoothstep(0.0, 0.16, tz);           // flatten right under the camera

  vec4 clip = uMVP * vec4(x, h, z, 1.0);
  vH = h;
  vFog = (1.0 - smoothstep(26.0, 105.0, clip.w)) * smoothstep(0.0, 0.07, tz);
  gl_Position = clip;
}
`;

const FRAG = `
precision mediump float;
varying float vH;
varying float vFog;

void main() {
  vec3 deep = vec3(0.03, 0.29, 0.20);
  vec3 emerald = vec3(0.20, 0.83, 0.51);
  vec3 ember = vec3(0.98, 0.57, 0.24);

  float t = clamp(vH / 13.0, 0.0, 1.0);
  vec3 c = mix(deep, emerald, smoothstep(0.0, 0.5, t));
  c = mix(c, ember, smoothstep(0.7, 1.0, t));

  float a = vFog * 0.95;
  gl_FragColor = vec4(c * a, a);
}
`;

function buildGrid(n: number) {
  const verts = new Float32Array(n * n * 2);
  let v = 0;
  for (let z = 0; z < n; z++) {
    for (let x = 0; x < n; x++) {
      verts[v++] = (x / (n - 1)) * 2 - 1;
      verts[v++] = (z / (n - 1)) * 2 - 1;
    }
  }

  const lines = new Uint16Array((n - 1) * n * 2 * 2);
  let i = 0;
  for (let z = 0; z < n; z++) {
    for (let x = 0; x < n - 1; x++) {
      lines[i++] = z * n + x;
      lines[i++] = z * n + x + 1;
    }
  }
  for (let x = 0; x < n; x++) {
    for (let z = 0; z < n - 1; z++) {
      lines[i++] = z * n + x;
      lines[i++] = (z + 1) * n + x;
    }
  }
  return { verts, lines };
}

/**
 * Hero backdrop: a real displaced wireframe terrain drifting toward the camera.
 * Geometry lives on the GPU and the displacement happens in the vertex shader,
 * so the whole effect costs one draw call a frame and no network weight.
 */
export function WireTerrain({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = createGL(canvas);
    if (!gl) {
      setSupported(false);
      return;
    }

    const prog = createProgram(gl, VERT, FRAG);
    if (!prog) {
      setSupported(false);
      return;
    }

    const n = window.innerWidth < 768 ? 72 : 128;
    const { verts, lines } = buildGrid(n);
    const vbo = arrayBuffer(gl, verts);
    const ibo = indexBuffer(gl, lines);

    const aGrid = gl.getAttribLocation(prog, 'aGrid');
    const uMVP = gl.getUniformLocation(prog, 'uMVP');
    const uTime = gl.getUniformLocation(prog, 'uTime');

    const proj: M4 = mat4();
    const view: M4 = mat4();
    const mvp: M4 = mat4();

    const reduced = prefersReducedMotion();
    let pointerX = 0;
    let pointerY = 0;
    let visible = true;
    let running = true;
    let raf = 0;
    const start = performance.now();

    const onPointer = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const draw = (elapsed: number) => {
      resizeToDisplay(gl, canvas);
      const aspect = canvas.width / Math.max(1, canvas.height);

      perspective(proj, (58 * Math.PI) / 180, aspect, 0.5, 220);
      lookAt(
        view,
        [pointerX * 3.2, 8.2 - pointerY * 1.6, 16],
        [pointerX * 1.6, 2.4, -34],
        [0, 1, 0],
      );
      multiply(mvp, proj, view);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.disable(gl.DEPTH_TEST);

      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(aGrid);
      gl.vertexAttribPointer(aGrid, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.uniformMatrix4fv(uMVP, false, mvp);
      gl.uniform1f(uTime, elapsed);
      gl.drawElements(gl.LINES, lines.length, gl.UNSIGNED_SHORT, 0);
    };

    const frame = (now: number) => {
      if (!running) return;
      if (visible) draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    const onLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
    };
    canvas.addEventListener('webglcontextlost', onLost);

    const onResize = () => draw(0);

    if (reduced) {
      // one static frame, redrawn only when the canvas actually changes size
      draw(0);
      window.addEventListener('resize', onResize);
    } else {
      window.addEventListener('pointermove', onPointer, { passive: true });
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteProgram(prog);
    };
  }, []);

  if (!supported) {
    return (
      <div
        aria-hidden
        className={`bg-[radial-gradient(ellipse_at_50%_120%,rgba(52,211,153,0.22),transparent_60%),radial-gradient(ellipse_at_80%_0%,rgba(251,146,60,0.12),transparent_55%)] ${className}`}
      />
    );
  }

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
