import { useEffect, useRef } from 'react';
import { createClouds, initialQuality } from './clouds.js';
import { useLang } from '../i18n.jsx';

/*
  Capa fija detrás del contenido que simula el descenso desde el espacio:
  estrellas → limbo terrestre con atmósfera → cielo de hora azul → nubes (WebGL) → día.
  Un único loop de requestAnimationFrame lee el progreso del scroll (0 = espacio,
  1 = superficie) y solo escribe en el DOM lo que cambió, para no forzar recálculos.
*/

// Colores del cielo [arriba, medio, abajo] por tramo del descenso
const SKY_STOPS = [
  { p: 0.0, c: [[4, 4, 10], [7, 7, 15], [11, 11, 21]] },
  { p: 0.16, c: [[4, 4, 11], [9, 10, 24], [18, 24, 58]] },
  { p: 0.34, c: [[8, 11, 32], [18, 28, 72], [44, 66, 136]] },
  { p: 0.55, c: [[16, 27, 70], [38, 62, 128], [92, 122, 186]] },
  { p: 0.78, c: [[30, 58, 124], [66, 116, 188], [112, 170, 228]] },
  // el último tramo coincide con el cielo de la foto del footer para que no se note la unión
  { p: 1.0, c: [[52, 104, 184], [96, 162, 226], [127, 204, 251]] },
];

// Luz y sombra de las nubes: crepúsculo azulado → blanco de día
const CLOUD_LIGHT = [
  { p: 0.3, c: [150, 162, 204] },
  { p: 0.55, c: [222, 228, 244] },
  { p: 0.8, c: [252, 252, 255] },
  { p: 1.0, c: [255, 255, 255] },
];
const CLOUD_SHADOW = [
  { p: 0.3, c: [34, 42, 80] },
  { p: 0.55, c: [92, 108, 156] },
  { p: 0.8, c: [138, 160, 200] },
  { p: 1.0, c: [156, 182, 220] },
];

const LAYERS = [
  { min: 85, key: 'thermo' },
  { min: 50, key: 'meso' },
  { min: 12, key: 'strato' },
  { min: 0.05, key: 'tropo' },
  { min: -1, key: 'surface' },
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function sample(stops, p) {
  let i = 0;
  while (i < stops.length - 2 && p > stops[i + 1].p) i++;
  const a = stops[i];
  const b = stops[i + 1];
  const t = smooth(a.p, b.p, p);
  const mix = (x, y) => x.map((v, k) => Math.round(lerp(v, y[k], t)));
  return Array.isArray(a.c[0]) ? a.c.map((col, k) => mix(col, b.c[k])) : mix(a.c, b.c);
}

// PRNG determinista para que las estrellas se vean igual en cada carga
function rng(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export default function Sky() {
  const skyRef = useRef(null);
  const starsRef = useRef(null);
  const cloudsRef = useRef(null);
  const planetRef = useRef(null);
  const altRef = useRef(null);
  const layerRef = useRef(null);
  const barRef = useRef(null);
  const { c } = useLang();
  const names = c.ui.altimeter.layers;
  const namesRef = useRef(names);
  const layerKeyRef = useRef('thermo');

  // al cambiar de idioma se actualiza el nombre de la capa sin esperar a un scroll
  useEffect(() => {
    namesRef.current = names;
    if (layerRef.current) layerRef.current.textContent = names[layerKeyRef.current];
  }, [names]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = starsRef.current;
    const ctx = canvas.getContext('2d');
    const clouds = createClouds(cloudsRef.current, initialQuality());
    // Calidad adaptativa: si mientras se hace scroll el ritmo de frames cae por debajo de ~38 fps de forma
    // sostenida, el shader baja de nivel (menos resolución y octavas). Nunca sube de nuevo, para no oscilar.
    let lastNow = 0;
    let slow = 0;
    let stars = [];
    let shooting = null;
    let nextShoot = performance.now() + 3000;
    const introStart = performance.now();
    let w = 0;
    let h = 0;
    let max = 1;
    let raf = 0;
    let lastP = -1;
    let starsCleared = false;
    let lastAlt = '';
    let lastLayer = '';
    let frameCount = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      max = Math.max(1, document.documentElement.scrollHeight - h);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      clouds?.resize();
      const r = rng(7);
      const count = Math.round((w * h) / 2200);
      stars = Array.from({ length: count }, () => {
        const big = r() > 0.97;
        return {
          x: r() * w,
          y: r() * h * 1.3,
          r: big ? 1.1 + r() * 0.8 : 0.3 + r() * 0.8,
          a: big ? 0.9 : 0.25 + r() * 0.6,
          s: 0.4 + r() * 1.6,
          o: r() * Math.PI * 2,
          warm: r() > 0.85,
        };
      });
      lastP = -1;
    };

    // la altura del documento cambia cuando cargan fuentes e imágenes
    const ro = new ResizeObserver(() => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      lastP = -1;
    });
    ro.observe(document.body);

    const drawStars = (now, p, starAlpha) => {
      ctx.clearRect(0, 0, w, h);
      const shift = p * h * 0.5;
      const t = now / 1000;
      // Intro: salida del hiperespacio, las estrellas llegan disparadas desde el centro
      const warp = reduce ? 0 : Math.pow(Math.max(0, 1 - (now - introStart) / 1900), 2.4);
      const cx = w / 2;
      const cy = h * 0.42;
      for (const s of stars) {
        let x = s.x;
        let y = s.y - shift;
        if (y < -2 || y > h + 2) continue;
        const tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(t * s.s + s.o);
        ctx.globalAlpha = Math.min(1, s.a * tw * starAlpha + warp * 0.6);
        ctx.fillStyle = s.warm ? '#ffe9d2' : '#eef0ff';
        if (warp > 0.01) {
          const dx = x - cx;
          const dy = y - cy;
          x = cx + dx * (1 - warp * 0.75);
          y = cy + dy * (1 - warp * 0.75);
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = Math.max(0.6, s.r * 1.3);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - dx * warp * 0.5, y - dy * warp * 0.5);
          ctx.stroke();
          continue;
        }
        if (s.r < 1) {
          // las estrellas diminutas como rectángulos: mismo aspecto, mucho más barato que arc()
          ctx.fillRect(s.x - s.r, y - s.r, s.r * 2, s.r * 2);
        } else {
          ctx.beginPath();
          ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // estrella fugaz ocasional
      if (!reduce && !shooting && now > nextShoot && starAlpha > 0.6) {
        shooting = { x: w * (0.2 + Math.random() * 0.6), y: h * Math.random() * 0.4, t0: now, len: 140 + Math.random() * 120 };
        nextShoot = now + 5000 + Math.random() * 7000;
      }
      if (shooting) {
        const k = (now - shooting.t0) / 900;
        if (k >= 1) shooting = null;
        else {
          const hx = shooting.x + k * 360;
          const hy = shooting.y + k * 160;
          const g = ctx.createLinearGradient(hx, hy, hx - shooting.len, hy - shooting.len * 0.44);
          g.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - k) * starAlpha})`);
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalAlpha = 1;
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx - shooting.len, hy - shooting.len * 0.44);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      frameCount++;
      const p = clamp(window.scrollY / max);
      const moved = Math.abs(p - lastP) > 0.00005;

      // Estrellas: solo mientras son visibles
      const starAlpha = 1 - smooth(0.18, 0.46, p);
      if (starAlpha > 0.01) {
        drawStars(now, p, starAlpha);
        starsCleared = false;
      } else if (!starsCleared) {
        ctx.clearRect(0, 0, w, h);
        starsCleared = true;
      }

      // Nubes: cada frame al moverse; en reposo a ~30 fps para la deriva lenta
      const cloudsVisible = p > 0.08;
      const dt = now - lastNow;
      lastNow = now;
      if (clouds && cloudsVisible && moved && dt < 250) {
        slow = dt > 26 ? slow + 1 : Math.max(0, slow - 2);
        if (slow > 45 && clouds.downgrade()) slow = 0;
      }
      if (clouds && cloudsVisible && (moved || (!reduce && frameCount % 2 === 0))) {
        const fog = 0.42 * Math.exp(-Math.pow((p - 0.6) / 0.03, 2));
        clouds.render(p, reduce ? 0 : now / 1000, sample(CLOUD_LIGHT, p), sample(CLOUD_SHADOW, p), fog);
      }

      if (!moved) return;
      lastP = p;

      // Cielo (variables en la propia capa: no recalcula estilos del resto de la página)
      const [top, mid, bot] = sample(SKY_STOPS, p);
      const sky = skyRef.current.style;
      sky.setProperty('--sky-top', `rgb(${top})`);
      sky.setProperty('--sky-mid', `rgb(${mid})`);
      sky.setProperty('--sky-bot', `rgb(${bot})`);

      // Planeta: el horizonte sube y se aplana mientras nos acercamos
      const e = smooth(0, 0.32, p);
      const planetOpacity = 1 - smooth(0.24, 0.4, p);
      const planet = planetRef.current.style;
      planet.visibility = planetOpacity > 0 ? 'visible' : 'hidden';
      planet.transform = `translate3d(-50%, ${lerp(0, -62, e)}vh, 0) scale(${lerp(1, 2.6, e)})`;
      planet.opacity = String(planetOpacity);
      cloudsRef.current.style.opacity = String(smooth(0.08, 0.2, p));

      // Indicador de altitud (420 km ≈ órbita baja → 0 m)
      const km = 420 * Math.pow(1 - p, 3.2);
      const alt = km >= 1 ? `${Math.round(km)} km` : `${Math.round(km * 1000)} m`;
      const layerKey = LAYERS.find((l) => km >= l.min).key;
      if (alt !== lastAlt) altRef.current.textContent = lastAlt = alt;
      if (layerKey !== lastLayer) {
        layerRef.current.textContent = namesRef.current[layerKey];
        layerKeyRef.current = lastLayer = layerKey;
      }
      barRef.current.style.transform = `scaleY(${p})`;
    };

    // resize puede dispararse decenas de veces por segundo: se agrupa en un solo cálculo por frame
    let resizeRaf = 0;
    const onResize = () => {
      if (!resizeRaf) resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; resize(); });
    };
    resize();
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <>
      <div className="sky" ref={skyRef} aria-hidden="true">
        <canvas className="sky__stars" ref={starsRef} />
        <div className="sky__planet" ref={planetRef} />
        <canvas className="sky__clouds" ref={cloudsRef} />
        <div className="sky__flash" />
      </div>

      <div className="altimeter" aria-hidden="true">
        <div className="altimeter__track">
          <div className="altimeter__bar" ref={barRef} />
        </div>
        <div className="altimeter__read">
          <span className="altimeter__label">{c.ui.altimeter.label}</span>
          <span className="altimeter__value" ref={altRef}>420 km</span>
          <span className="altimeter__layer" ref={layerRef}>{names.thermo}</span>
        </div>
      </div>
    </>
  );
}
