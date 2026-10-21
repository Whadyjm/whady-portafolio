import { useEffect, useRef, useState } from 'react';
import { TechChip, hasIcon } from './TechIcon.jsx';
import { CUSTOM } from './AppScreens.jsx';
import { useLang } from '../i18n.jsx';

// children: pantalla recreada en HTML; src: captura recortada
export function Device({ src, children, className = '', style, statusBar, eager = false }) {
  return (
    <div className={`device ${className}`} style={style}>
      <div className="device__island" />
      <div
        className={`device__screen ${statusBar ? 'device__screen--bar' : ''}`}
        style={statusBar ? { background: statusBar } : undefined}
      >
        {children || <img src={`apps/${src}.webp`} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" />}
      </div>
    </div>
  );
}

function Stage({ app }) {
  const { c } = useLang();
  const custom = CUSTOM[app.custom];
  const screens = app.screens || [];
  const multi = screens.length > 1;
  return (
    <div className={`stage stage--${app.id} ${multi ? 'stage--fan' : ''}`} style={{ '--app': app.color }}>
      <div className="stage__halo" aria-hidden="true" />
      {custom && (
        <>
          <Device className="device--main" statusBar={app.statusBar}>
            <custom.Screen />
          </Device>
          <custom.Extras />
        </>
      )}
      {screens.map((s, i) => (
        <Device key={s} src={s} statusBar={app.statusBar} className={multi ? `device--fan device--fan-${i}` : 'device--main'} />
      ))}
      {app.chips?.map((chip, i) => (
        <span key={chip} className={`stage__chip stage__chip--${i}`}>
          {chip}
        </span>
      ))}
      {app.illustrative && <span className="stage__note">{c.ui.recreated}</span>}
    </div>
  );
}

// Vitrina de apps: en escritorio la sección se fija y el scroll vertical desplaza las apps en horizontal.
// En pantallas angostas (o con movimiento reducido) las apps se apilan en vertical.
export default function AppsShowcase({ apps, head }) {
  const { c } = useLang();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 961px) and (prefers-reduced-motion: no-preference)');
    const sync = () => setPinned(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!pinned) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    let raf = 0;
    let last = -1;
    const update = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const range = section.offsetHeight - window.innerHeight;
      const k = Math.min(1, Math.max(0, -r.top / range));
      if (Math.abs(k - last) < 0.0005) return;
      last = k;
      const max = track.scrollWidth - window.innerWidth;
      track.style.transform = `translate3d(${-k * max}px, 0, 0)`;
      // parallax interno: el texto y los teléfonos de cada app se desplazan a distinta velocidad
      track.querySelectorAll('.app-slide').forEach((el, i) => {
        const local = k * (apps.length - 1) - i;
        el.style.setProperty('--local', local.toFixed(3));
        el.style.setProperty('--fade', Math.max(0, 1 - Math.abs(local) * 1.2).toFixed(3));
      });
      barRef.current.style.transform = `scaleX(${k})`;
      setActive(Math.min(apps.length - 1, Math.round(k * (apps.length - 1))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pinned, apps.length]);

  return (
    <section
      className={`apps ${pinned ? 'apps--pinned' : ''}`}
      id="apps"
      ref={sectionRef}
      style={pinned ? { height: `${apps.length * 100}vh` } : undefined}
    >
      <div className="apps__sticky">
        <div className="container apps__head">
          {head}
          <div className="apps__progress" aria-hidden="true">
            <span className="apps__count">
              {String(active + 1).padStart(2, '0')} <em>/ {String(apps.length).padStart(2, '0')}</em>
            </span>
            <span className="apps__bar">
              <span ref={barRef} />
            </span>
          </div>
        </div>
        <div className="apps__track" ref={trackRef}>
          {apps.map((app, i) => (
            <article
              key={app.id}
              className={`app-slide ${i % 2 ? 'app-slide--flip' : ''} ${i === active ? 'is-active' : ''}`}
              data-reveal={pinned ? undefined : 'card'}
            >
              <div className="app-slide__text">
                <div className="app-slide__meta">
                  <span>{app.place}</span>
                  {app.status && <span className="app-slide__status">{c.ui.inDevelopment}</span>}
                </div>
                <h3 className="h-xl">{app.name}</h3>
                <p className="app-slide__tagline">{app.tagline}</p>
                <p className="app-slide__body">{app.body}</p>
                <div className="tags">
                  {app.tech.map((t) => (
                    <TechChip key={t} name={t} large />
                  ))}
                  {app.extra.map((t) =>
                    hasIcon(t) ? (
                      <TechChip key={t} name={t} large />
                    ) : (
                      <span key={t} className="chip chip--lg">
                        {t}
                      </span>
                    )
                  )}
                </div>
                {app.links?.length > 0 && (
                  <div className="app-slide__links">
                    {app.links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
                        {l.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <Stage app={app} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
