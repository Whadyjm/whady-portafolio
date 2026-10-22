/*
  La Tierra vista desde la órbita, en WebGL (sin librerías). Un shader dibuja la esfera pixel a pixel
  (trazado analítico de un disco: no hay malla) con texturas reales de la NASA (Blue Marble, luces
  nocturnas y nubes, dominio público):
   · día y noche con terminador suave: el lado oscuro muestra las luces de las ciudades;
   · nubes que derivan despacio y proyectan su propio brillo;
   · reflejo del sol en el océano (solo donde el mapa es agua);
   · dispersión atmosférica: borde azul en el limbo, naranja en el crepúsculo, y un halo fino afuera.
  La geometría (centro y radio del disco) la calcula Sky.jsx con la misma fórmula del planeta CSS.
*/

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform vec3 uDisc;      // cx, cy (px desde arriba), radio
uniform float uTime;
uniform vec3 uSun;       // dirección del sol en el espacio de la vista
uniform vec2 uView;      // lat y lon del punto bajo la cámara (rad)
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uCloud;

const float PI = 3.14159265;

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 d = frag - uDisc.xy;
  float R = uDisc.z;
  float r = length(d) / R;

  // halo atmosférico exterior (muy fino): la luz dispersada justo fuera del limbo, más fuerte del lado del sol
  float h = max(0.0, (r - 1.0) * R); // píxeles sobre el limbo
  float glow = exp(-h / 8.0) * 0.50 + exp(-h / 34.0) * 0.14;
  float side = clamp(dot(normalize(d), normalize(uSun.xy) * vec2(1.0, -1.0)) * 0.5 + 0.55, 0.12, 1.0);
  vec4 halo = vec4(vec3(0.30, 0.56, 1.0) * glow * side, glow * side * 0.9);
  if (r > 1.0) {
    gl_FragColor = halo;
    return;
  }
  // el borde del disco se suaviza sobre ~1,5 px para evitar dientes de sierra
  float edge = clamp((1.0 - r) * R / 1.5, 0.0, 1.0);

  // punto de la esfera que mira a la cámara (x derecha, y arriba, z hacia nosotros)
  vec3 p = vec3(d.x / R, -d.y / R, sqrt(max(0.0, 1.0 - r * r)));

  // sistema de la cámara sobre el globo: F = punto bajo la cámara, E = este, N = norte
  float la = uView.x, lo = uView.y;
  vec3 F = vec3(cos(la) * sin(lo), sin(la), cos(la) * cos(lo));
  vec3 E = vec3(cos(lo), 0.0, -sin(lo));
  vec3 N = vec3(-sin(la) * sin(lo), cos(la), -sin(la) * cos(lo));
  vec3 w = p.x * E + p.y * N + p.z * F;
  float lat = asin(clamp(w.y, -1.0, 1.0));
  float lon = atan(w.x, w.z);
  vec2 uv = vec2(lon / (2.0 * PI) + 0.5, 0.5 - lat / PI);

  vec3 day = texture2D(uDay, uv).rgb;
  vec3 night = texture2D(uNight, uv).rgb;
  // nubes: derivan hacia el este, más rápido que el suelo
  float cloud = texture2D(uCloud, vec2(uv.x + uTime * 0.0006, uv.y)).r;
  cloud = smoothstep(0.38, 1.0, cloud);

  float ndl = dot(p, normalize(uSun));
  float lit = smoothstep(-0.10, 0.28, ndl);
  float twil = smoothstep(-0.18, 0.0, ndl) * (1.0 - smoothstep(0.0, 0.22, ndl));

  // agua: azul dominante en el mapa. Le damos un fondo más profundo y brillo especular
  float water = smoothstep(0.02, 0.12, day.b - max(day.r, day.g) * 0.9) * (1.0 - smoothstep(0.55, 0.8, day.b));
  vec3 land = day * vec3(1.06, 1.04, 0.98);
  vec3 sea = mix(day, vec3(0.020, 0.075, 0.20), 0.45);
  vec3 surf = mix(land, sea, water);

  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(normalize(uSun) + V);
  float spec = pow(max(dot(p, H), 0.0), 90.0) * water * 0.9 + pow(max(dot(p, H), 0.0), 14.0) * water * 0.06;

  vec3 ambient = vec3(0.45, 0.62, 1.0) * 0.045; // luz de la luna y del cielo: azulada, no morada
  vec3 col = surf * (ambient + 0.92 * lit) + spec * vec3(1.0, 0.95, 0.85) * lit;
  // nubes iluminadas por el sol (y teñidas en el crepúsculo)
  vec3 cloudCol = mix(vec3(0.78, 0.84, 0.96), vec3(1.0, 0.80, 0.60), twil * 0.8) * (0.06 + 0.82 * lit);
  col = mix(col, cloudCol, cloud * 0.72);

  // luces de ciudades en la cara nocturna (las nubes las atenúan)
  float darkness = 1.0 - smoothstep(-0.02, 0.20, ndl);
  vec3 lights = night * vec3(1.9, 1.5, 1.05);
  col += lights * darkness * (1.0 - cloud * 0.65);

  // atmósfera: Fresnel (borde azul), más intenso hacia el limbo; naranja en el terminador
  float fres = pow(1.0 - p.z, 3.0);
  float dayAir = smoothstep(-0.25, 0.5, ndl);
  vec3 air = mix(vec3(0.10, 0.18, 0.40), vec3(0.28, 0.55, 1.0), dayAir);
  air = mix(air, vec3(1.0, 0.52, 0.22), twil * 0.75);
  col += air * fres * (0.28 + 0.95 * dayAir) + air * pow(1.0 - p.z, 1.4) * 0.07 * dayAir;

  // línea brillante del limbo
  float limb = smoothstep(0.992, 1.0, r);
  col += vec3(0.55, 0.78, 1.0) * limb * (0.2 + 0.6 * dayAir);

  col = col / (1.0 + col * 0.22);
  col = pow(col, vec3(0.95));
  // mezcla del borde con el halo exterior (colores premultiplicados)
  gl_FragColor = vec4(col * edge + halo.rgb * (1.0 - edge), edge + halo.a * (1.0 - edge));
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

function loadTexture(gl, url, aniso) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
      resolve(tex);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// devuelve null si WebGL no está disponible o falla algo; el planeta CSS queda como respaldo
export async function createEarth(canvas, base = '', scale = 0.7) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    return null;
  }
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic');

  let tex;
  try {
    tex = await Promise.all(['day', 'night', 'clouds'].map((n) => loadTexture(gl, `${base}earth/${n}.webp`, aniso)));
  } catch {
    return null;
  }

  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  for (const n of ['uRes', 'uDisc', 'uTime', 'uSun', 'uView', 'uDay', 'uNight', 'uCloud']) u[n] = gl.getUniformLocation(prog, n);
  ['uDay', 'uNight', 'uCloud'].forEach((n, i) => {
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, tex[i]);
    gl.uniform1i(u[n], i);
  });

  const resize = () => {
    canvas.width = Math.max(1, Math.round(window.innerWidth * scale));
    canvas.height = Math.max(1, Math.round(window.innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();

  return {
    resize,
    /* disc: {cx, cy, R} en píxeles CSS del viewport; t: segundos */
    render(disc, t, sun = [-0.75, 0.02, 0.32]) {
      const k = scale;
      gl.useProgram(prog);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform3f(u.uDisc, disc.cx * k, disc.cy * k, disc.R * k);
      gl.uniform1f(u.uTime, t);
      gl.uniform3f(u.uSun, sun[0], sun[1], sun[2]);
      // el punto bajo la cámara deriva despacio de este a oeste: la Tierra "gira" sin cruzar la costura del mapa
      gl.uniform2f(u.uView, -0.78, 0.2 + 0.32 * Math.sin(t * 0.018));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
