/*
  Satélite en 3D con WebGL propio (sin librerías): ~20 piezas (bus con aislante dorado, radiador, paneles
  solares con celdas, antena parabólica con puntales, propulsor, sensores) y un shader con:
   · luz del sol (direccional) y luz de rebote de la Tierra (azul, desde abajo);
   · reflejo del entorno (espacio oscuro + resplandor terrestre + disco solar) con Fresnel;
   · aislante térmico con arrugas (ruido que perturba la normal) y celdas con rejilla de plata.
  Los paneles giran sobre su eje y, cuando se alinean con el reflejo del sol, se dibuja un destello.
*/

// ───────── matemáticas mínimas (matrices 4×4 en columna mayor) ─────────
const mul = (a, b) => {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  return o;
};
const rx = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); };
const ry = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); };
const rz = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); };
const tr = (x, y, z) => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
const persp = (fovy, aspect, n, f) => {
  const t = 1 / Math.tan(fovy / 2);
  return new Float32Array([t / aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]);
};
const pt = (m, p) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
const dir = (m, p) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2], m[1] * p[0] + m[5] * p[1] + m[9] * p[2], m[2] * p[0] + m[6] * p[1] + m[10] * p[2]];
const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const smoothstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// rotación que lleva el eje +Y a la dirección d (para cilindros entre dos puntos)
function alignY(d) {
  const n = norm(d);
  const ax = [n[2], 0, -n[0]];
  const s = Math.hypot(ax[0], ax[1], ax[2]);
  const c = n[1];
  if (s < 1e-6) return c >= 0 ? new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) : rx(Math.PI);
  const kx = ax[0] / s, ky = ax[1] / s, kz = ax[2] / s, t = 1 - c;
  return new Float32Array([
    c + kx * kx * t, kx * ky * t + kz * s, kx * kz * t - ky * s, 0,
    kx * ky * t - kz * s, c + ky * ky * t, ky * kz * t + kx * s, 0,
    kx * kz * t + ky * s, ky * kz * t - kx * s, c + kz * kz * t, 0,
    0, 0, 0, 1,
  ]);
}

// ───────── geometría: cada malla es {v: [pos3, nor3, uv2...], idx} ─────────
function box(w, h, d) {
  const e = [w / 2, h / 2, d / 2];
  const faces = [
    [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
    [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
    [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
    [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 0, 0], [0, 0, -1]],
    [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
  ];
  const ext = (a) => Math.abs(a[0]) * e[0] + Math.abs(a[1]) * e[1] + Math.abs(a[2]) * e[2];
  const v = [], idx = [];
  faces.forEach(([n, u, t], f) => {
    const en = ext(n), eu = ext(u), et = ext(t);
    for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      v.push(n[0] * en + u[0] * eu * su + t[0] * et * sv, n[1] * en + u[1] * eu * su + t[1] * et * sv, n[2] * en + u[2] * eu * su + t[2] * et * sv, n[0], n[1], n[2], (su + 1) / 2, (sv + 1) / 2);
    }
    const o = f * 4;
    idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });
  return { v, idx };
}

function cyl(r0, r1, h, seg = 20, caps = true) {
  const v = [], idx = [];
  const slope = (r0 - r1) / h;
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    const n = norm([c, slope, s]);
    v.push(r0 * c, -h / 2, r0 * s, n[0], n[1], n[2], i / seg, 0);
    v.push(r1 * c, h / 2, r1 * s, n[0], n[1], n[2], i / seg, 1);
  }
  for (let i = 0; i < seg; i++) {
    const o = i * 2;
    idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
  }
  if (caps) {
    for (const [y, r, ny] of [[-h / 2, r0, -1], [h / 2, r1, 1]]) {
      const base = v.length / 8;
      v.push(0, y, 0, 0, ny, 0, 0.5, 0.5);
      for (let i = 0; i <= seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        v.push(r * Math.cos(a), y, r * Math.sin(a), 0, ny, 0, 0.5, 0.5);
      }
      for (let i = 0; i < seg; i++) idx.push(base, base + 1 + i, base + 2 + i);
    }
  }
  return { v, idx };
}

function sphere(r, lat = 8, lon = 14) {
  const v = [], idx = [];
  for (let i = 0; i <= lat; i++) {
    const th = (i / lat) * Math.PI;
    for (let j = 0; j <= lon; j++) {
      const ph = (j / lon) * Math.PI * 2;
      const n = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)];
      v.push(n[0] * r, n[1] * r, n[2] * r, n[0], n[1], n[2], j / lon, i / lat);
    }
  }
  for (let i = 0; i < lat; i++)
    for (let j = 0; j < lon; j++) {
      const a = i * (lon + 1) + j, b = a + lon + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  return { v, idx };
}

// paraboloide (antena): y = depth·(r/R)², abierto hacia +Y
function dish(R, depth, seg = 32, rings = 9) {
  const v = [], idx = [];
  const k = depth / (R * R);
  for (let i = 0; i <= rings; i++) {
    const r = (i / rings) * R;
    const dy = 2 * k * r;
    const n = norm([-dy, 1, 0]);
    for (let j = 0; j <= seg; j++) {
      const a = (j / seg) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      v.push(r * c, k * r * r, r * s, n[0] * c, n[1], n[0] * s, i / rings, j / seg);
    }
  }
  for (let i = 0; i < rings; i++)
    for (let j = 0; j < seg; j++) {
      const a = i * (seg + 1) + j, b = a + seg + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  return { v, idx };
}

// ───────── shaders ─────────
const MAT = { SOLAR: 0, GOLD: 1, ALU: 2, DARK: 3 };

const VERT = `
attribute vec3 aPos;
attribute vec3 aNor;
attribute vec2 aUV;
uniform mat4 uModel;
uniform mat3 uNM;
uniform mat4 uVP;
varying vec3 vW;
varying vec3 vN;
varying vec2 vUV;
void main() {
  vec4 w = uModel * vec4(aPos, 1.0);
  vW = w.xyz;
  vN = uNM * aNor;
  vUV = aUV;
  gl_Position = uVP * w;
}
`;

const FRAG = `
precision highp float;
varying vec3 vW;
varying vec3 vN;
varying vec2 vUV;
uniform vec3 uCam;
uniform vec3 uSun;
uniform vec3 uEarth;
uniform float uSunPower;
uniform float uMat;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}

// entorno: espacio casi negro, resplandor azul de la Tierra y el disco del sol
vec3 env(vec3 R) {
  vec3 c = vec3(0.010, 0.014, 0.032);
  c += vec3(0.18, 0.34, 0.78) * pow(max(dot(R, uEarth), 0.0), 1.4) * 0.9;
  float s = max(dot(R, uSun), 0.0);
  c += vec3(1.0, 0.96, 0.88) * (pow(s, 700.0) * 45.0 + pow(s, 14.0) * 0.3);
  return c;
}

void main() {
  vec3 V = normalize(uCam - vW);
  vec3 N = normalize(vN);
  bool back = dot(N, V) < 0.0;
  if (back) N = -N;

  vec3 base = vec3(0.5);
  vec3 F0 = vec3(0.04);
  float shin = 30.0;
  float metal = 0.0;

  if (uMat < 0.5) {
    // panel solar: celdas con rejilla de plata, marco de aluminio entre segmentos
    if (back) {
      base = vec3(0.74, 0.74, 0.72);
      shin = 18.0;
    } else {
      vec2 g = vUV * vec2(18.0, 6.0);
      vec2 cell = fract(g);
      vec2 id = floor(g);
      float jitter = hash(vec3(id, 3.0));
      base = mix(vec3(0.018, 0.04, 0.20), vec3(0.06, 0.12, 0.40), jitter * 0.8 + cell.y * 0.2);
      float grid = step(cell.x, 0.05) + step(0.95, cell.x) + step(cell.y, 0.06) + step(0.94, cell.y);
      float bus = step(abs(cell.x - 0.5), 0.018);
      base = mix(base, vec3(0.50, 0.52, 0.58), clamp(grid + bus * 0.8, 0.0, 1.0));
      float seg = fract(vUV.x * 3.0);
      float edge = min(seg, 1.0 - seg);
      float frame = 1.0 - step(0.012, edge);
      frame = max(frame, 1.0 - step(0.02, min(vUV.y, 1.0 - vUV.y)));
      base = mix(base, vec3(0.72, 0.73, 0.74), frame);
      F0 = vec3(0.07);
      shin = 110.0;
    }
  } else if (uMat < 1.5) {
    // aislante térmico dorado, con arrugas de lámina
    vec3 p = vW * 6.5;
    float n = vnoise(p) * 0.6 + vnoise(p * 2.3) * 0.4;
    N = normalize(N + 0.38 * vec3(vnoise(p + 3.1) - 0.5, vnoise(p + 7.7) - 0.5, vnoise(p + 11.3) - 0.5));
    base = mix(vec3(0.72, 0.42, 0.07), vec3(1.0, 0.80, 0.32), smoothstep(0.2, 0.8, n));
    F0 = vec3(1.0, 0.72, 0.28);
    shin = 34.0;
    metal = 0.8;
  } else if (uMat < 2.5) {
    base = vec3(0.80, 0.81, 0.82);
    F0 = vec3(0.72, 0.72, 0.74);
    shin = 46.0;
    metal = 0.8;
  } else {
    base = vec3(0.035, 0.037, 0.045);
    shin = 28.0;
  }

  float ndl = max(dot(N, uSun), 0.0);
  float nde = max(dot(N, uEarth), 0.0);
  vec3 sunC = vec3(1.0, 0.96, 0.88) * uSunPower;
  vec3 H = normalize(uSun + V);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 5.0);
  vec3 F = F0 + (1.0 - F0) * fres;
  vec3 R = reflect(-V, N);

  vec3 diffuse = base * (sunC * ndl + vec3(0.16, 0.30, 0.68) * nde * 0.7 + vec3(0.018, 0.026, 0.06)) * (1.0 - metal * 0.55);
  vec3 col = diffuse;
  col += F * env(R) * (0.55 + 0.45 * metal) * mix(vec3(1.0), base, metal * 0.7);
  col += pow(max(dot(N, H), 0.0), shin) * sunC * ndl * mix(vec3(0.5), F0 * base, metal) * (0.6 + shin * 0.004);

  col = col / (1.0 + col);
  col = pow(col, vec3(1.0 / 2.2));
  gl_FragColor = vec4(col, 1.0);
}
`;

const FLARE_VERT = `
attribute vec2 aCorner;
uniform vec2 uCenter;
uniform vec2 uSize;
varying vec2 vC;
void main() {
  vC = aCorner;
  gl_Position = vec4(uCenter + aCorner * uSize, 0.0, 1.0);
}
`;

const FLARE_FRAG = `
precision highp float;
varying vec2 vC;
uniform float uIntensity;
void main() {
  float r = length(vC);
  float glow = exp(-r * r * 7.0);
  float spikes = exp(-abs(vC.x) * 38.0) * exp(-abs(vC.y) * 3.2) + exp(-abs(vC.y) * 38.0) * exp(-abs(vC.x) * 3.2);
  float d = abs(vC.x - vC.y) * 0.7071, d2 = abs(vC.x + vC.y) * 0.7071;
  float diag = (exp(-d * 55.0) + exp(-d2 * 55.0)) * exp(-r * 3.4) * 0.35;
  vec3 c = vec3(0.86, 0.93, 1.0) * (glow * 0.85 + spikes * 0.95 + diag) * uIntensity;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
}
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

function program(gl, vs, fs) {
  const a = compile(gl, gl.VERTEX_SHADER, vs);
  const b = compile(gl, gl.FRAGMENT_SHADER, fs);
  if (!a || !b) return null;
  const p = gl.createProgram();
  gl.attachShader(p, a);
  gl.attachShader(p, b);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

// ───────── el satélite ─────────
export function createSatellite(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true, depth: true });
  if (!gl) return null;
  const prog = program(gl, VERT, FRAG);
  const flareProg = program(gl, FLARE_VERT, FLARE_FRAG);
  if (!prog || !flareProg) return null;

  const upload = ({ v, idx }) => {
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    return { vbo, ibo, count: idx.length };
  };

  // piezas: malla, material, matriz local, padre ('dish') y si gira con los paneles
  const parts = [];
  const add = (geo, mat, local, extra = {}) => parts.push({ mesh: upload(geo), mat, local, ...extra });
  const between = (p0, p1, r, mat, extra) => {
    const d = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2];
    add(cyl(r, r, len, 8, false), mat, mul(tr(mid[0], mid[1], mid[2]), alignY(d)), extra);
  };

  // cuerpo
  add(box(1.7, 1.4, 1.4), MAT.GOLD, tr(0, 0, 0));
  add(box(1.74, 0.22, 1.44), MAT.ALU, tr(0, 0.62, 0));
  add(box(1.74, 0.07, 1.44), MAT.ALU, tr(0, -0.64, 0));
  add(cyl(0.36, 0.14, 0.46, 24), MAT.DARK, tr(0, -0.95, 0));
  add(cyl(0.22, 0.22, 0.05, 20), MAT.GOLD, tr(0, -0.7, 0));
  add(cyl(0.15, 0.15, 0.12, 16), MAT.DARK, mul(tr(-0.45, -0.12, 0.72), rx(Math.PI / 2)));
  add(sphere(0.07, 6, 10), MAT.DARK, tr(-0.45, -0.12, 0.8));
  // yugos y paneles solares (giran juntos)
  for (const sx of [-1, 1]) {
    add(box(0.58, 0.09, 0.09), MAT.ALU, tr(sx * 1.14, 0, 0), { roll: true });
    add(box(3.0, 0.04, 1.55), MAT.SOLAR, tr(sx * 2.9, 0, 0), { roll: true });
  }
  // mástil y antena parabólica con puntales y alimentador
  add(cyl(0.045, 0.045, 0.72, 10), MAT.ALU, tr(-0.35, 1.09, 0.1));
  add(dish(0.62, 0.22, 32, 9), MAT.ALU, tr(0, 0, 0), { parent: 'dish' });
  const focus = [0, 0.437, 0];
  for (const a of [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3]) between([0.62 * Math.cos(a), 0.22, 0.62 * Math.sin(a)], focus, 0.012, MAT.ALU, { parent: 'dish' });
  add(cyl(0.05, 0.07, 0.17, 12), MAT.ALU, tr(0, 0.45, 0), { parent: 'dish' });
  // antena de látigo
  between([0.55, 0.72, -0.2], [0.95, 1.95, -0.35], 0.016, MAT.ALU);
  add(sphere(0.05, 6, 10), MAT.GOLD, tr(0.95, 1.95, -0.35));

  const dishMatrix = mul(tr(-0.35, 1.45, 0.1), mul(rz(-0.55), rx(0.45)));

  const loc = {};
  for (const n of ['uModel', 'uNM', 'uVP', 'uCam', 'uSun', 'uEarth', 'uSunPower', 'uMat']) loc[n] = gl.getUniformLocation(prog, n);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  const aNor = gl.getAttribLocation(prog, 'aNor');
  const aUV = gl.getAttribLocation(prog, 'aUV');

  const fl = {
    corner: gl.getAttribLocation(flareProg, 'aCorner'),
    center: gl.getUniformLocation(flareProg, 'uCenter'),
    size: gl.getUniformLocation(flareProg, 'uSize'),
    intensity: gl.getUniformLocation(flareProg, 'uIntensity'),
    buf: gl.createBuffer(),
  };
  gl.bindBuffer(gl.ARRAY_BUFFER, fl.buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);

  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr) || 560;
    canvas.height = Math.round(canvas.clientHeight * dpr) || 308;
  };
  size();

  const CAM = [0, 0, 11.6];
  const vp = mul(persp((24 * Math.PI) / 180, canvas.width / canvas.height, 1, 60), tr(-CAM[0], -CAM[1], -CAM[2]));

  /*
    state: { t: segundos, heading: giro en el plano de la pantalla (rad),
             sun, earth: direcciones (x derecha, y arriba, z hacia la cámara), power }
  */
  function render(state) {
    const { t, heading = 0, sun = [-0.4, 0.6, 0.7], earth = [0, -1, 0.2], power = 2.6 } = state;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    // orientación: vista de tres cuartos con un leve cabeceo; los paneles giran hacia el sol
    const wobble = Math.sin(t * 0.31) * 0.16;
    const base = mul(rz(heading), mul(rx(0.42 + Math.sin(t * 0.23) * 0.05), ry(-0.62 + wobble)));
    const roll = t * 0.24 + 0.8;
    const rollM = mul(base, rx(roll));
    const dishM = mul(base, dishMatrix);

    const L = norm(sun);
    const E = norm(earth);
    gl.useProgram(prog);
    gl.uniformMatrix4fv(loc.uVP, false, vp);
    gl.uniform3fv(loc.uCam, CAM);
    gl.uniform3fv(loc.uSun, L);
    gl.uniform3fv(loc.uEarth, E);
    gl.uniform1f(loc.uSunPower, power);
    gl.enableVertexAttribArray(aPos);
    gl.enableVertexAttribArray(aNor);
    gl.enableVertexAttribArray(aUV);

    for (const p of parts) {
      const parent = p.roll ? rollM : p.parent === 'dish' ? dishM : base;
      const M = mul(parent, p.local);
      gl.uniformMatrix4fv(loc.uModel, false, M);
      gl.uniformMatrix3fv(loc.uNM, false, new Float32Array([M[0], M[1], M[2], M[4], M[5], M[6], M[8], M[9], M[10]]));
      gl.uniform1f(loc.uMat, p.mat);
      gl.bindBuffer(gl.ARRAY_BUFFER, p.mesh.vbo);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 32, 0);
      gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, 32, 12);
      gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 32, 24);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.mesh.ibo);
      gl.drawElements(gl.TRIANGLES, p.mesh.count, gl.UNSIGNED_SHORT, 0);
    }

    // destello: cuando la normal de un panel apunta a la bisectriz sol–cámara (reflejo especular)
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(flareProg);
    gl.disableVertexAttribArray(aPos);
    gl.disableVertexAttribArray(aNor);
    gl.disableVertexAttribArray(aUV);
    gl.bindBuffer(gl.ARRAY_BUFFER, fl.buf);
    gl.enableVertexAttribArray(fl.corner);
    gl.vertexAttribPointer(fl.corner, 2, gl.FLOAT, false, 0, 0);
    const nTop = norm(dir(rollM, [0, 1, 0]));
    for (const sx of [-1, 1]) {
      const world = pt(base, [sx * 3.4, 0, 0]);
      const V = norm([CAM[0] - world[0], CAM[1] - world[1], CAM[2] - world[2]]);
      const H = norm([L[0] + V[0], L[1] + V[1], L[2] + V[2]]);
      const faceFront = dot(nTop, V) > 0;
      const align = Math.abs(dot(nTop, H));
      const glint = smoothstep(0.965, 0.9985, align) * (faceFront ? 1 : 0.3);
      if (glint < 0.02) continue;
      const clip = [vp[0] * world[0] + vp[4] * world[1] + vp[8] * world[2] + vp[12], vp[1] * world[0] + vp[5] * world[1] + vp[9] * world[2] + vp[13], vp[3] * world[0] + vp[7] * world[1] + vp[11] * world[2] + vp[15]];
      const aspect = canvas.width / canvas.height;
      gl.uniform2f(fl.center, clip[0] / clip[2], clip[1] / clip[2]);
      gl.uniform2f(fl.size, 0.42 / aspect * (0.6 + glint * 0.6), 0.42 * (0.6 + glint * 0.6));
      gl.uniform1f(fl.intensity, glint);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }

  return { render, resize: size };
}
