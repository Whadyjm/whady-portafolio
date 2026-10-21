/*
  Nubes volumétricas falsas en un shader de pantalla completa.
  Cada capa es una banda horizontal de ruido fractal (fbm con domain warping) que sube
  por la pantalla a medida que descendemos. La iluminación se aproxima comparando la
  densidad con una muestra desplazada hacia la luz: topes iluminados, bases en sombra
  y bordes plateados. Se renderiza a media resolución: las nubes son suaves y así
  el costo en GPU es bajo.
*/

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform float uP;
uniform vec3 uLight;
uniform vec3 uShadow;
uniform float uFog;
uniform float uOct;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

const mat2 ROT = mat2(1.6, 1.2, -1.2, 1.6);

float fbm(vec2 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 6; i++) {
    if (float(i) >= uOct) break; // calidad adaptativa: menos octavas en GPUs modestas
    s += a * noise(p);
    p = ROT * p;
    a *= 0.5;
  }
  return s;
}

// anchor: progreso en que la capa cruza el centro · speed: parallax · thick: grosor de la banda
vec4 layer(vec2 uv, float aspect, float anchor, float speed, float thick, float scale, float cover, float seed, float drift) {
  float yc = 0.5 + (uP - anchor) * speed;
  float dy = uv.y - yc;
  float band = exp(-(dy * dy) / (thick * thick));
  if (band < 0.03) return vec4(0.0);

  vec2 q = vec2(uv.x * aspect * scale + seed + uTime * drift, dy * scale * 1.8 + seed * 1.7);
  vec2 w = vec2(fbm(q * 0.5 + seed), fbm(q * 0.5 + seed + 3.1));
  vec2 pq = q + 1.4 * w;
  float n = fbm(pq);

  // la banda da forma: base más plana, topes con cúmulos
  float shape = n * band - (1.0 - band) * 0.3 + smoothstep(0.0, thick, dy) * 0.04;
  float dens = smoothstep(cover, cover + 0.2, shape);
  if (dens <= 0.001) return vec4(0.0);

  // iluminación desde arriba: si hacia la luz hay menos densidad, este punto está iluminado
  float nUp = fbm(pq + vec2(0.0, 0.22));
  float lit = clamp(0.55 + (n - nUp) * 5.0, 0.0, 1.0);
  lit *= mix(0.5, 1.0, smoothstep(-thick * 0.9, thick * 0.5, dy));
  vec3 col = mix(uShadow, uLight, lit);
  // borde plateado donde la nube es delgada
  col = mix(col, uLight * 1.04, (1.0 - dens) * 0.45);
  return vec4(col, dens);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec3 col = vec3(0.0);
  float a = 0.0;
  vec4 l;

  // de la más lejana (lenta) a la más cercana (rápida)
  l = layer(uv, aspect, 0.80, 1.00, 0.10, 3.0, 0.52, 11.0, 0.004); col = l.rgb * l.a + col * (1.0 - l.a); a = l.a + a * (1.0 - l.a);
  l = layer(uv, aspect, 0.88, 1.70, 0.15, 2.2, 0.50, 23.0, 0.007); col = l.rgb * l.a + col * (1.0 - l.a); a = l.a + a * (1.0 - l.a);
  l = layer(uv, aspect, 0.46, 2.30, 0.15, 2.3, 0.50, 67.0, 0.008); col = l.rgb * l.a + col * (1.0 - l.a); a = l.a + a * (1.0 - l.a);
  l = layer(uv, aspect, 0.73, 2.20, 0.18, 2.0, 0.48, 37.0, 0.009); col = l.rgb * l.a + col * (1.0 - l.a); a = l.a + a * (1.0 - l.a);
  // banco de nubes que se atraviesa
  l = layer(uv, aspect, 0.60, 3.20, 0.42, 1.3, 0.40, 51.0, 0.006); col = l.rgb * l.a + col * (1.0 - l.a); a = l.a + a * (1.0 - l.a);

  // niebla al estar dentro del banco
  col = uLight * 0.92 * uFog + col * (1.0 - uFog);
  a = uFog + a * (1.0 - uFog);

  gl_FragColor = vec4(col, a);
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

// Niveles de calidad: resolución del canvas respecto al viewport y octavas de ruido
export const QUALITY = [
  { res: 0.5, oct: 6 },
  { res: 0.4, oct: 5 },
  { res: 0.32, oct: 4 },
];

// Punto de partida: equipos con pocos núcleos o poca memoria arrancan un nivel más bajo
export function initialQuality() {
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory || 8;
  return cores <= 4 || mem <= 4 ? 1 : 0;
}

export function createClouds(canvas, level = 0) {
  let q = QUALITY[level];
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  for (const name of ['uRes', 'uTime', 'uP', 'uLight', 'uShadow', 'uFog', 'uOct']) u[name] = gl.getUniformLocation(prog, name);

  const resize = () => {
    canvas.width = Math.max(1, Math.round(window.innerWidth * q.res));
    canvas.height = Math.max(1, Math.round(window.innerHeight * q.res));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();

  return {
    resize,
    // baja un nivel de calidad; devuelve false si ya está en el mínimo
    downgrade() {
      if (level >= QUALITY.length - 1) return false;
      q = QUALITY[++level];
      resize();
      return true;
    },
    get level() {
      return level;
    },
    render(p, time, light, shadow, fog) {
      gl.uniform1f(u.uOct, q.oct);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, time);
      gl.uniform1f(u.uP, p);
      gl.uniform3f(u.uLight, light[0] / 255, light[1] / 255, light[2] / 255);
      gl.uniform3f(u.uShadow, shadow[0] / 255, shadow[1] / 255, shadow[2] / 255);
      gl.uniform1f(u.uFog, fog);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
