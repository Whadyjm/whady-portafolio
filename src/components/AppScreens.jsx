import { useEffect, useRef } from 'react';
import { useLang } from '../i18n.jsx';

/*
  Pantallas de app recreadas en HTML/SVG (a partir del material de cada app) para mostrarlas
  nítidas y animadas dentro de los mockups, en lugar de usar los pósters tal cual.
*/

const Bell = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z M10 20a2 2 0 0 0 4 0" />
  </svg>
);

const Scale = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M7 8h10l3 12H4z M9.5 8a2.5 2.5 0 0 1 5 0" />
  </svg>
);

// ───────── HerDex ─────────
const WEIGHTS = [360, 400, 430, 450, 480, 470, 520, 510, 540, 575];

function WeightChart() {
  const w = 190;
  const h = 64;
  const pts = WEIGHTS.map((v, i) => [(i / (WEIGHTS.length - 1)) * w, h - ((v - 300) / 300) * h]);
  const line = pts.map((p) => p.join(',')).join(' ');
  return (
    <svg className="hx-chart" viewBox={`-4 -6 ${w + 8} ${h + 10}`}>
      <defs>
        <linearGradient id="hxFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e9a4f" stopOpacity="0.35" />
          <stop offset="1" stopColor="#2e9a4f" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.33, 0.66, 1].map((k) => (
        <line key={k} x1="0" x2={w} y1={k * h} y2={k * h} stroke="#e3ebe5" strokeWidth="0.8" />
      ))}
      <polygon points={`0,${h} ${line} ${w},${h}`} fill="url(#hxFill)" className="hx-chart__area" />
      <polyline points={line} fill="none" stroke="#2e9a4f" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className="hx-chart__line" pathLength="1" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 3.4 : 1.8} fill="#2e9a4f" />
      ))}
    </svg>
  );
}

export function HerdexScreen() {
  const { c } = useLang();
  const s = c.screens.herdex;
  return (
    <div className="hx">
      <div className="hx__bar">
        <img src="apps/herdex-icon.webp" alt="" className="hx__logo" />
        <b>HerDex</b>
        <Bell />
      </div>
      <div className="hx__card">
        <div className="hx__row">
          <span className="hx__dot" />
          {s.animal}
          <span className="hx__more">•••</span>
        </div>
        <div className="hx__photo">
          <img src="apps/herdex-cow.webp" alt="" loading="lazy" />
          <span className="hx__scan" />
          <span className="hx__weight">
            <Scale /> 482 kg
          </span>
        </div>
      </div>
      <div className="hx__stats">
        {[
          [s.breed, s.breedValue],
          [s.age, s.ageValue],
          [s.sex, s.sexValue],
        ].map(([k, v]) => (
          <div key={k}>
            <span>{k}</span>
            <b>{v}</b>
          </div>
        ))}
      </div>
      <div className="hx__history">
        <div className="hx__history-head">
          <b>{s.history}</b>
          <span className="hx__tabs">
            <i>7D</i>
            <i className="is-on">30D</i>
            <i>3M</i>
          </span>
        </div>
        <WeightChart />
      </div>
    </div>
  );
}

export function HerdexExtras() {
  const { c } = useLang();
  const s = c.screens.herdex;
  return (
    <>
      <div className="xcard xcard--left">
        <img src="apps/herdex-icon.webp" alt="" className="xcard__icon" />
        <div>
          <span className="xcard__label">{s.estimated}</span>
          <b className="xcard__big">482 kg</b>
          <span className="xcard__up">↑ +12% {s.vsLast}</span>
        </div>
      </div>
      <div className="xcard xcard--right">
        <svg className="xcard__spark" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
        </svg>
        <b>{s.analysis}</b>
        <p>{s.analysisText}</p>
        <span className="xcard__ok">✓ {s.status}</span>
      </div>
    </>
  );
}

// ───────── Clock.Do ─────────
// bloques agendados sobre la esfera: [hora inicio, hora fin, color]
const BLOCKS = [
  [9.6, 12, '#ffd43b'],
  [12.2, 1.4, '#ff7096'],
  [7.1, 8.3, '#ff7096'],
  [8.4, 9.4, '#7b5cff'],
];

function arcPath(from, to, r) {
  const toAngle = (hr) => ((hr % 12) / 12) * Math.PI * 2 - Math.PI / 2;
  let a0 = toAngle(from);
  let a1 = toAngle(to);
  if (a1 <= a0) a1 += Math.PI * 2;
  const p = (a) => `${50 + r * Math.cos(a)} ${50 + r * Math.sin(a)}`;
  return `M${p(a0)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}`;
}

function ClockFace() {
  const h = useRef(null);
  const m = useRef(null);
  const s = useRef(null);
  useEffect(() => {
    // agujas en hora real
    const tick = () => {
      const d = new Date();
      const sec = d.getSeconds() + d.getMilliseconds() / 1000;
      const min = d.getMinutes() + sec / 60;
      const hr = (d.getHours() % 12) + min / 60;
      h.current?.setAttribute('transform', `rotate(${hr * 30} 50 50)`);
      m.current?.setAttribute('transform', `rotate(${min * 6} 50 50)`);
      s.current?.setAttribute('transform', `rotate(${Math.floor(sec) * 6} 50 50)`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <svg className="cd-clock" viewBox="0 0 100 100">
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2;
        return <circle key={i} cx={50 + 47 * Math.cos(a)} cy={50 + 47 * Math.sin(a)} r={i % 5 ? 0.45 : 0.8} fill="#6b5bd6" opacity="0.5" />;
      })}
      {BLOCKS.map(([a, b, c], i) => (
        <path key={i} d={arcPath(a, b, 41)} pathLength="1" stroke={c} strokeWidth="6" strokeLinecap="round" fill="none" className="cd-clock__arc" style={{ animationDelay: `${i * 0.25}s` }} />
      ))}
      <circle cx="50" cy="50" r="35" fill="#fff" />
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const a = (n / 12) * Math.PI * 2 - Math.PI / 2;
        return (
          <text key={n} x={50 + 28 * Math.cos(a)} y={50 + 28 * Math.sin(a) + 2.4} textAnchor="middle" fontSize="6.4" fontWeight="600" fill="#1d1b3a" fontFamily="Inter, sans-serif">
            {n}
          </text>
        );
      })}
      <g ref={h}>
        <line x1="50" y1="52" x2="50" y2="32" stroke="#1d1b3a" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      <g ref={m}>
        <line x1="50" y1="53" x2="50" y2="22" stroke="#1d1b3a" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g ref={s}>
        <line x1="50" y1="56" x2="50" y2="20" stroke="#e0313b" strokeWidth="0.7" strokeLinecap="round" />
      </g>
      <circle cx="50" cy="50" r="2" fill="#e0313b" />
    </svg>
  );
}

const DAY_NUMBERS = [5, 6, 7, 8, 9];

const Flame = () => (
  <svg viewBox="0 0 24 24" width="10" height="10" fill="#ff7a2f" aria-hidden="true">
    <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-10z" />
  </svg>
);

const Heart = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
    <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" />
  </svg>
);

const Paw = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
    <circle cx="6" cy="11" r="2.2" />
    <circle cx="10" cy="6.5" r="2.2" />
    <circle cx="14.5" cy="6.5" r="2.2" />
    <circle cx="18.5" cy="11" r="2.2" />
    <path d="M12 12c3 0 5.5 3 5 5.5-.4 1.7-2 2-5 2s-4.6-.3-5-2c-.5-2.5 2-5.5 5-5.5z" />
  </svg>
);

export function ClockScreen() {
  const { c } = useLang();
  const s = c.screens.clockdo;
  return (
    <div className="cd">
      <div className="cd__top">
        <b>{s.date}</b>
        <span className="cd__pill">
          <Flame /> 1
        </span>
        <span className="cd__pill">● 225</span>
      </div>
      <div className="cd__days">
        {DAY_NUMBERS.map((n, i) => (
          <span key={n} className={n === 8 ? 'is-on' : n === 7 ? 'is-ring' : ''}>
            <i>{s.days[i]}</i>
            <b>{n}</b>
          </span>
        ))}
      </div>
      <ClockFace />
      <div className="cd__list">
        <div className="cd__task">
          <span className="cd__tag">
            <Heart />
          </span>
          <div>
            <b>{s.task1}</b>
            <i>00:17 – 00:55</i>
          </div>
          <em>{s.pending}</em>
        </div>
        <div className="cd__task">
          <span className="cd__tag">
            <Paw />
          </span>
          <div>
            <b>{s.task2}</b>
            <i>06:54 – 07:36</i>
          </div>
          <em>{s.pending}</em>
        </div>
      </div>
      <div className="cd__nav">
        {s.nav.map((label, i) => (
          <span key={label} className={i === 0 ? 'is-on' : ''}>
            {label}
          </span>
        ))}
      </div>
      <span className="cd__fab">+</span>
    </div>
  );
}

export function ClockExtras() {
  return <img src="apps/clockdo-icon.webp" alt="" className="xicon" />;
}

export const CUSTOM = {
  herdex: { Screen: HerdexScreen, Extras: HerdexExtras },
  clockdo: { Screen: ClockScreen, Extras: ClockExtras },
};
