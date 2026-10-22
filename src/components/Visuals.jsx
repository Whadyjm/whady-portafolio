import { useEffect, useRef, useState } from 'react';
import { Oli as OliMascot } from '../oli/src/Oli.tsx';
import { useLang } from '../i18n.jsx';

// Mini-ilustraciones animadas (SVG + SMIL) para las tarjetas de proyectos.
const LINE = 'rgba(237,237,243,0.22)';
const SOFT = 'rgba(237,237,243,0.55)';
const ACC = '#a3b1ff';

// Red de agentes: nodo central que orquesta herramientas, con pulsos viajando
function Agents() {
  const nodes = [
    [70, 40], [70, 120], [330, 40], [330, 120], [200, 20], [200, 140],
  ];
  return (
    <svg viewBox="0 0 400 160">
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <path id={`ag${i}`} d={`M200 80 L${x} ${y}`} stroke={LINE} strokeDasharray="3 5" />
          <circle r="2.6" fill={ACC}>
            <animateMotion dur={`${1.8 + i * 0.25}s`} repeatCount="indefinite" begin={`${i * 0.3}s`}>
              <mpath href={`#ag${i}`} />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;0" dur={`${1.8 + i * 0.25}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
          </circle>
          <rect x={x - 22} y={y - 10} width="44" height="20" rx="10" fill="rgba(39,39,53,0.9)" stroke={LINE} />
          <circle cx={x - 10} cy={y} r="3" fill={SOFT} />
          <rect x={x - 3} y={y - 2} width="16" height="4" rx="2" fill={LINE} />
        </g>
      ))}
      <circle cx="200" cy="80" r="26" fill="none" stroke={ACC} strokeOpacity="0.5">
        <animate attributeName="r" values="22;34;22" dur="3s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="80" r="20" fill="rgba(82,102,235,0.25)" stroke={ACC} />
      <path d="M200 70 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#ededf3" />
    </svg>
  );
}

// Visión por computador: personas cruzando con cajas de detección y línea de escaneo
function Vision() {
  const { c } = useLang();
  const people = [
    { y: 60, dur: 7, delay: 0 },
    { y: 95, dur: 9, delay: -3 },
    { y: 125, dur: 6.5, delay: -5 },
  ];
  return (
    <svg viewBox="0 0 400 160">
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`v${i}`} x1={i * 40} x2={i * 40} y1="0" y2="160" stroke={LINE} strokeOpacity="0.35" />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={`h${i}`} x1="0" x2="400" y1={i * 40} y2={i * 40} stroke={LINE} strokeOpacity="0.35" />
      ))}
      {people.map((p, i) => (
        <g key={i}>
          <animateTransform attributeName="transform" type="translate" from="-40 0" to="440 0" dur={`${p.dur}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
          <rect x="-12" y={p.y - 22} width="24" height="40" rx="3" fill="none" stroke={ACC} strokeWidth="1.4" />
          <circle cx="0" cy={p.y - 10} r="4" fill={SOFT} />
          <rect x="-4" y={p.y - 5} width="8" height="16" rx="3" fill={SOFT} />
          <text x="-12" y={p.y - 26} fill={ACC} fontSize="8" fontFamily="Inter, sans-serif">0.9{i + 4}</text>
        </g>
      ))}
      <rect x="0" y="0" width="400" height="2" fill={ACC} opacity="0.7">
        <animate attributeName="y" values="0;158;0" dur="4s" repeatCount="indefinite" />
      </rect>
      <text x="12" y="20" fill={SOFT} fontSize="11" fontFamily="Inter, sans-serif">{c.visuals.occupancy}</text>
    </svg>
  );
}

// Tráfico con RL: intersección con autos y semáforos adaptativos
function Traffic() {
  const { c } = useLang();
  return (
    <svg viewBox="0 0 400 160">
      <rect x="0" y="62" width="400" height="36" fill="rgba(39,39,53,0.8)" />
      <rect x="182" y="0" width="36" height="160" fill="rgba(39,39,53,0.8)" />
      <line x1="0" x2="400" y1="80" y2="80" stroke={LINE} strokeDasharray="8 8" />
      <line x1="200" x2="200" y1="0" y2="160" stroke={LINE} strokeDasharray="8 8" />
      {[0, 1.3, 2.6].map((b, i) => (
        <rect key={`h${i}`} x="-20" y="66" width="18" height="10" rx="3" fill={SOFT}>
          <animate attributeName="x" values="-20;160;175;420" keyTimes="0;0.4;0.6;1" dur="4s" begin={`${b}s`} repeatCount="indefinite" />
        </rect>
      ))}
      {[0.6, 2].map((b, i) => (
        <rect key={`v${i}`} x="203" y="-20" width="10" height="18" rx="3" fill={ACC}>
          <animate attributeName="y" values="-20;180" dur="2.8s" begin={`${b}s`} repeatCount="indefinite" />
        </rect>
      ))}
      <circle cx="170" cy="52" r="5" fill={ACC}>
        <animate attributeName="fill" values={`${ACC};#ededf3;${ACC}`} dur="4s" repeatCount="indefinite" />
      </circle>
      <text x="250" y="40" fill={SOFT} fontSize="11" fontFamily="Inter, sans-serif">reward ↑ 0.87</text>
      <text x="250" y="130" fill={SOFT} fontSize="11" fontFamily="Inter, sans-serif">{c.visuals.episode}</text>
    </svg>
  );
}

// Oli: la factura viaja al guardián, que decide APPROVE / ESCALATE / BLOCK por turnos
// Estado de la mascota según el instante del ciclo de 9 s (3 s por factura): llega la factura → piensa → decide.
// Se lee del reloj del propio SVG para quedar alineado con las animaciones SMIL (pulsos y chips).
const DECISION_STATE = ['celebrating', 'understanding', 'focused']; // APPROVE · ESCALATE · BLOCK
function oliStateAt(t) {
  const u = ((t % 9) + 9) % 9;
  const slot = Math.min(2, Math.floor(u / 3));
  const m = u - slot * 3;
  if (m < 1.2) return 'listening';
  if (m < 2.16) return 'thinking';
  return DECISION_STATE[slot];
}

function Oli() {
  const { c } = useLang();
  const svgRef = useRef(null);
  const boxRef = useRef(null);
  const [state, setState] = useState('listening');
  // 1800 partículas y su primer cuadro no deben competir con la animación de entrada: se montan al acercarse
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '400px' });
    io.observe(boxRef.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const t0 = performance.now();
    const id = setInterval(() => {
      const svg = svgRef.current;
      const t = svg && typeof svg.getCurrentTime === 'function' ? svg.getCurrentTime() : (performance.now() - t0) / 1000;
      setState((prev) => {
        const next = oliStateAt(t);
        return next === prev ? prev : next;
      });
    }, 100);
    return () => clearInterval(id);
  }, []);
  // colores de estado de Oli: aprobado (lima), revisión humana (ámbar), bloqueo (rosa)
  const outcomes = [
    { label: 'APPROVE', note: c.visuals.withinRules, y: 50, fill: '#e4f222' },
    { label: 'ESCALATE', note: c.visuals.needsApproval, y: 110, fill: '#f3d58f' },
    { label: 'BLOCK', note: c.visuals.duplicate, y: 170, fill: '#f4b4b9' },
  ];
  const INK = '#20251d';
  const MUTED = '#5b6150';
  const HAIR = 'rgba(32,37,29,0.16)';
  return (
    <div className="oli-diagram" ref={boxRef}>
      <svg ref={svgRef} viewBox="0 0 560 220">
        {/* órbitas suaves, como en la landing de Oli */}
        <circle cx="282" cy="110" r="100" fill="none" stroke={HAIR} strokeWidth="1" />
        <circle cx="282" cy="110" r="128" fill="none" stroke="rgba(32,37,29,0.08)" strokeWidth="1" />
        {/* factura */}
        <g transform="translate(34 46)">
          <rect width="104" height="128" rx="10" fill="#ffffff" stroke={HAIR} />
          <path d="M78 0 v22 h26" fill="none" stroke={HAIR} />
          <text x="14" y="30" fill={MUTED} fontSize="10" fontFamily="Inter, sans-serif">{c.visuals.invoice}</text>
          {[48, 60, 72].map((y, i) => (
            <rect key={y} x="14" y={y} width={[70, 54, 62][i]} height="5" rx="2.5" fill="rgba(32,37,29,0.12)" />
          ))}
          <text x="14" y="108" fill={INK} fontSize="15" fontFamily="Inter, sans-serif">$240.00</text>
        </g>
        <path id="oliIn" d="M140 110 C190 110 200 110 242 110" stroke="rgba(32,37,29,0.35)" strokeDasharray="3 5" fill="none" />
        <circle r="4.5" fill="#e4f222" stroke={INK} strokeWidth="1">
          <animateMotion dur="3s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.4;1" calcMode="linear">
            <mpath href="#oliIn" />
          </animateMotion>
        </circle>

        {/* decisiones */}
        {outcomes.map((o, k) => (
          <g key={o.label}>
            <path id={`oliOut${k}`} d={`M336 110 C370 110 370 ${o.y} 404 ${o.y}`} stroke="rgba(32,37,29,0.35)" strokeDasharray="3 5" fill="none" />
            <circle r="4.5" fill={o.fill} stroke={INK} strokeWidth="1" opacity="0">
              <animateMotion dur="9s" begin={`${k * 3}s`} repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.13;0.25;1" calcMode="linear">
                <mpath href={`#oliOut${k}`} />
              </animateMotion>
              <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.13;0.25;0.26;1" dur="9s" begin={`${k * 3}s`} repeatCount="indefinite" />
            </circle>
            <g transform={`translate(406 ${o.y - 18})`}>
              <rect width="128" height="36" rx="18" fill="#ffffff" stroke={HAIR} />
              <rect width="128" height="36" rx="18" fill={o.fill} stroke={INK} strokeOpacity="0.35" opacity="0">
                <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.24;0.27;0.32;0.36;1" dur="9s" begin={`${k * 3}s`} repeatCount="indefinite" />
              </rect>
              <text x="16" y="15" fill={INK} fontSize="10.5" fontWeight="600" fontFamily="Inter, sans-serif" letterSpacing="1">{o.label}</text>
              <text x="16" y="28" fill={MUTED} fontSize="8.5" fontFamily="Inter, sans-serif">{o.note}</text>
            </g>
          </g>
        ))}
      </svg>
      <div className="oli-diagram__sphere" data-state={state}>
        {near && <OliMascot state={state} dark={false} size={400} particles={1800} label={c.visuals.oliLabel} />}
      </div>
    </div>
  );
}

const MAP = { oli: Oli, agents: Agents, vision: Vision, traffic: Traffic };

export default function Visual({ type }) {
  const { c } = useLang();
  const C = MAP[type];
  return C ? (
    <div className="visual" aria-hidden="true">
      <C />
      <span className="visual__note">{c.ui.illustrative}</span>
    </div>
  ) : null;
}
