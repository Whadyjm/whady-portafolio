/*
  Nubes volumétricas en un shader de pantalla completa.
  Cada capa es una banda horizontal de ruido fractal (fbm con domain warping) que sube por la
  pantalla a medida que descendemos. Para que se vean como nubes y no como manchas:
   · la forma mezcla ruido suave con ruido "abultado" (lóbulos de cúmulo) y se erosiona con
     detalle fino en los bordes;
   · el sombreado es volumétrico: se mide cuánta nube hay entre cada punto y la luz (ley de Beer),
     así los topes quedan iluminados y el interior y la base, en sombra;
   · el borde delgado dispersa luz (borde plateado) y la sombra toma color del cielo;
   · las capas lejanas se funden con el cielo (perspectiva atmosférica).
  Se renderiza a resolución reducida: las nubes son suaves y así el costo en GPU es bajo.
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
uniform vec3 uSky;
uniform float uFog;
uniform float uOct;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// ruido de valor con interpolación quíntica: sin la cuadrícula visible de la cúbica
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

const mat2 ROT = mat2(1.6, 1.2, -1.2, 1.6);

float fbm(vec2 p, float oct) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 6; i++) {
    if (float(i) >= oct) break;
    s += a * noise(p);
    p = ROT * p;
    a *= 0.5;
  }
  return s;
}

// ruido "abultado": crea los lóbulos redondeados del cúmulo
float billow(vec2 p, float oct) {
  float a = 0.5;
  float s = 0.0;
  float norm = 0.0;
  for (int i = 0; i < 5; i++) {
    if (float(i) >= oct) break;
    s += a * (1.0 - abs(noise(p) * 2.0 - 1.0));
    norm += a;
    p = ROT * p;
    a *= 0.5;
  }
  return s / norm;
}

const vec2 LDIR = vec2(-0.38, 0.92); // la luz llega desde arriba a la izquierda

// anchor: progreso en que la capa cruza el centro · speed: parallax · thick: grosor de la banda
// haze: cuánto se funde con el cielo (capas lejanas)
vec4 layer(vec2 uv, float aspect, float anchor, float speed, float thick, float scale, float cover, float seed, float drift, float haze) {
  float yc = 0.5 + (uP - anchor) * speed;
  float dy = uv.y - yc;
  float band = exp(-(dy * dy) / (thick * thick));
  if (band < 0.03) return vec4(0.0);

  float wo = min(uOct, 4.0);
  vec2 q = vec2(uv.x * aspect * scale + seed + uTime * drift, dy * scale * 1.8 + seed * 1.7);
  vec2 w = vec2(fbm(q * 0.5 + seed, wo), fbm(q * 0.5 + seed + 3.1, wo));
  vec2 pq = q + 1.45 * (w - 0.5);

  // forma: mezcla de ruido suave y abultado
  float lobes = billow(pq * 0.55 + 7.0, min(uOct, 5.0));
  float n = mix(fbm(pq, uOct), lobes * 0.98 + (fbm(pq * 1.7, 3.0) - 0.44) * 0.18, 0.66);
  float shape = n * band - (1.0 - band) * 0.3 + smoothstep(0.0, thick, dy) * 0.04;
  // erosión fina: bordes deshilachados
  float detail = fbm(pq * 3.1 + 11.0, 3.0);
  shape -= (detail - 0.5) * 0.15 * (1.0 - band * 0.35);

  float dens = smoothstep(cover, cover + 0.20, shape);
  if (dens <= 0.002) return vec4(0.0);

  // sombreado volumétrico: cuánta nube hay entre este punto y la luz (ley de Beer)
  float occ = 0.0;
  occ += max(0.0, fbm(pq + LDIR * 0.10, 3.0) * band - cover * 0.80);
  occ += max(0.0, fbm(pq + LDIR * 0.24, 3.0) * band - cover * 0.80);
  occ += max(0.0, fbm(pq + LDIR * 0.46, 3.0) * band - cover * 0.80);
  float lit = exp(-occ * 2.1);

  // base más oscura y plana, como en un cúmulo real
  lit *= mix(0.5, 1.0, smoothstep(-thick * 0.9, thick * 0.55, dy));

  // la sombra toma algo del color del cielo (luz ambiente) en vez de un gris plano
  vec3 shade = mix(uShadow, uSky * 0.78 + 0.04, 0.30);
  vec3 col = mix(shade, uLight * 1.12, pow(lit, 1.35));

  // borde plateado: donde la nube es delgada y mira a la luz, dispersa más
  float thin = pow(1.0 - dens, 2.0);
  col += uLight * thin * lit * 0.5;

  // perspectiva atmosférica
  col = mix(col, uSky * 0.9 + uLight * 0.1, haze);

  return vec4(col, dens * 0.94);
}

vec4 over(vec4 top, vec4 under) {
  return vec4(top.rgb * top.a + under.rgb * (1.0 - top.a), top.a + under.a * (1.0 - top.a));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec4 acc = vec4(0.0);

  // de la más lejana (lenta, con neblina) a la más cercana (rápida)
  acc = over(layer(uv, aspect, 0.80, 1.00, 0.10, 3.0, 0.52, 11.0, 0.004, 0.22), acc);
  acc = over(layer(uv, aspect, 0.88, 1.70, 0.15, 2.2, 0.50, 23.0, 0.007, 0.15), acc);
  acc = over(layer(uv, aspect, 0.46, 2.30, 0.15, 2.3, 0.50, 67.0, 0.008, 0.08), acc);
  acc = over(layer(uv, aspect, 0.73, 2.20, 0.18, 2.0, 0.48, 37.0, 0.009, 0.05), acc);
  // banco de nubes que se atraviesa
  acc = over(layer(uv, aspect, 0.60, 3.20, 0.42, 1.3, 0.40, 51.0, 0.006, 0.0), acc);

  vec3 col = acc.rgb;
  float a = acc.a;

  // niebla al estar dentro del banco
  col = uLight * 0.92 * uFog + col * (1.0 - uFog);
  a = uFog + a * (1.0 - uFog);

  // micro-dither para evitar bandas en los degradados suaves
  a = clamp(a + (hash(gl_FragCoord.xy + uTime) - 0.5) / 160.0, 0.0, 1.0);
  col *= step(0.0001, a);
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
  { res: 0.6, oct: 6 },
  { res: 0.45, oct: 5 },
  { res: 0.34, oct: 4 },
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
  for (const name of ['uRes', 'uTime', 'uP', 'uLight', 'uShadow', 'uSky', 'uFog', 'uOct']) u[name] = gl.getUniformLocation(prog, name);

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
    render(p, time, light, shadow, fog, sky) {
      gl.uniform1f(u.uOct, q.oct);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, time);
      gl.uniform1f(u.uP, p);
      gl.uniform3f(u.uLight, light[0] / 255, light[1] / 255, light[2] / 255);
      gl.uniform3f(u.uShadow, shadow[0] / 255, shadow[1] / 255, shadow[2] / 255);
      gl.uniform3f(u.uSky, sky[0] / 255, sky[1] / 255, sky[2] / 255);
      gl.uniform1f(u.uFog, fog);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
