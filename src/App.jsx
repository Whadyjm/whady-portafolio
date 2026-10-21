import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import Sky from './components/Sky.jsx';
import Visual from './components/Visuals.jsx';
import AppsShowcase, { Device } from './components/AppsShowcase.jsx';
import TechIcon, { TechChip, hasIcon } from './components/TechIcon.jsx';
import { Heading, SplitLetters, RotatingWord, Card, Marquee, useTimelineProgress } from './components/fx.jsx';
import { useLang, LANGS } from './i18n.jsx';

const SECTIONS = ['sobre-mi', 'especialidades', 'apps', 'experiencia', 'proyectos', 'contacto'];

function Arrow() {
  return (
    <svg className="btn__arrow" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />
    </svg>
  );
}

const ICONS = {
  mobile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M10.5 18.5h3" />
      <path className="icon-accent" d="M9 9.5l2 2 4-4" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path className="icon-accent" d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </svg>
  ),
  software: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" />
      <path d="M4.5 5.5v6.5c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V5.5" />
      <path className="icon-accent" d="M4.5 12v6.5c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V12" />
    </svg>
  ),
};

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// Scroll con inercia (Lenis) y anclas animadas; se desactiva con prefers-reduced-motion
function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
    let id = 0;
    const raf = (t) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);

    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute('href');
      const el = hash.length > 1 && document.querySelector(hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
      history.replaceState(null, '', hash);
    };
    document.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('click', onClick);
      lenis.destroy();
    };
  }, []);
}

// Sección que cruza el centro de la pantalla, para marcarla en el menú
function useCurrentSection() {
  const [current, setCurrent] = useState('');
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setCurrent(e.target.id);
        }),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const onScroll = () => {
      if (window.scrollY < 200) setCurrent('');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return current;
}

function LangSwitch() {
  const { lang, setLang, c } = useLang();
  return (
    <div className="lang" role="group" aria-label={c.ui.langLabel}>
      {LANGS.map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function Nav({ current }) {
  const { c } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const links = [
    ['#sobre-mi', c.ui.nav.about],
    ['#especialidades', c.ui.nav.focus],
    ['#apps', c.ui.nav.apps],
    ['#experiencia', c.ui.nav.experience],
    ['#proyectos', c.ui.nav.projects],
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? 'nav--solid' : ''} ${open ? 'nav--open' : ''}`}>
      <div className="nav__inner">
        <a href="#inicio" className="nav__brand" onClick={() => setOpen(false)}>
          <span>Whady Martínez</span>
        </a>
        <nav className="nav__links" aria-label={c.ui.mainNav}>
          {links.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className={`pill-link ${current === href.slice(1) ? 'is-current' : ''}`}
              aria-current={current === href.slice(1) ? 'true' : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="nav__actions">
          <a href={c.profile.github} target="_blank" rel="noreferrer" className="pill-link nav__text">
            <TechIcon name="GitHub" size={16} />
            GitHub
          </a>
          <LangSwitch />
          <a href="#contacto" className="btn btn--primary btn--sm">
            {c.ui.contactCta}
          </a>
          <button className="nav__toggle" aria-label={c.ui.menu} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}

function SectionHead({ kicker, title, children }) {
  return (
    <div className="section__head">
      <span className="kicker" data-reveal>
        <span className="kicker__line" />
        {kicker}
      </span>
      <Heading className="h-lg" text={title} />
      {children && (
        <p className="lead" data-reveal style={{ '--d': '150ms' }}>
          {children}
        </p>
      )}
    </div>
  );
}

function Chips({ items }) {
  return (
    <div className="tags">
      {items.map((t) =>
        hasIcon(t) ? (
          <TechChip key={t} name={t} />
        ) : (
          <span key={t} className="chip">
            {t}
          </span>
        )
      )}
    </div>
  );
}

function Timeline() {
  const { c } = useLang();
  const ref = useRef(null);
  useTimelineProgress(ref);
  return (
    <div className="timeline" ref={ref}>
      <span className="timeline__rail" aria-hidden="true">
        <span className="timeline__progress" />
      </span>
      <ol className="timeline__list">
        {c.experience.map((x, i) => (
          <li key={x.company} className="timeline__item">
            <span className="timeline__dot" aria-hidden="true" />
            <Card revealDelay={i * 60} className={x.media ? 'xp--media' : ''}>
              <div className="xp__content">
                <div className="timeline__head">
                  <div>
                    <span className="timeline__index">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="h-sm">{x.role}</h3>
                    <span className="timeline__company">{x.company}</span>
                  </div>
                  <Chips items={x.tags} />
                </div>
                <p>{x.summary}</p>
                <ul className="checklist">
                  {x.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
              {x.media && (
                <div className="xp__media" style={{ '--tone': x.media.tone }} aria-hidden="true">
                  <span className="xp__glow" />
                  <span className={`xp__logo ${x.media.logoTile ? 'xp__logo--tile' : ''}`}>
                    <img src={`apps/${x.media.logo}.webp`} alt="" loading="lazy" />
                  </span>
                  <Device src={x.media.screen} statusBar={x.media.statusBar} className="device--xp" />
                </div>
              )}
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function App() {
  const { c, cvHref } = useLang();
  const current = useCurrentSection();
  useReveal();
  useSmoothScroll();

  const p = c.profile;
  const h = c.ui.hero;

  return (
    <>
      <a href="#contenido" className="skip-link">
        {c.ui.skip}
      </a>
      <Sky />
      <Nav current={current} />

      <main id="contenido" tabIndex={-1}>
        {/* HERO — espacio */}
        <section className="hero" id="inicio">
          <div className="hero__glow" aria-hidden="true" />
          <div className="hero__content">
            <span className="tag intro" style={{ '--delay': '250ms' }}>
              <span className="tag__dot" />
              {p.tag}
            </span>
            <h1 className="display">
              <SplitLetters text={p.name} />
            </h1>
            <p className="hero__role intro" style={{ '--delay': '1150ms' }}>
              {h.before}
              <RotatingWord words={p.rotating} />
              {h.after}
              <span className="sr-only">
                {' '}
                {h.srWork} {p.rotating.join(', ')}.
              </span>
            </p>
            <p className="hero__pitch intro" style={{ '--delay': '1350ms' }}>
              {p.pitch}
            </p>
            <div className="hero__ctas intro" style={{ '--delay': '1550ms' }}>
              <a href="#contacto" className="btn btn--primary btn--lg">
                {h.talk} <Arrow />
              </a>
              <a href={cvHref} download className="btn btn--ghost btn--lg">
                <DownloadIcon /> {h.cv}
              </a>
            </div>
          </div>
          <ul className="hero__stats intro" style={{ '--delay': '1800ms' }}>
            {p.stats.map((s) => (
              <li key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
          <a href="#sobre-mi" className="scroll-hint intro" style={{ '--delay': '2300ms' }} aria-label={h.scroll}>
            <span>{h.scroll}</span>
            <span className="scroll-hint__line" />
          </a>
        </section>

        {/* SOBRE MÍ */}
        <section className="section" id="sobre-mi">
          <div className="container split">
            <div>
              <SectionHead kicker={c.ui.kicker.about} title={c.headlines.about} />
              <div className="prose" data-reveal style={{ '--d': '150ms' }}>
                {c.about.paragraphs.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </div>
            <Card as="dl" className="facts" revealDelay={120}>
              {c.about.facts.map((f) => (
                <div key={f.label} className="facts__row">
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </Card>
          </div>
        </section>

        {/* CINTA DE TECNOLOGÍAS */}
        <div className="marquees">
          <Marquee items={c.marquee} speed={60} />
        </div>

        {/* ESPECIALIDADES + demo de agente */}
        <section className="section" id="especialidades">
          <div className="container">
            <SectionHead kicker={c.ui.kicker.focus} title={c.headlines.specialties}>
              {c.headlines.specialtiesLead}
            </SectionHead>
            <div className="grid-3">
              {c.specialties.map((s, i) => (
                <Card key={s.id} as="article" className="spec" revealDelay={i * 100}>
                  <span className="spec__icon">{ICONS[s.id]}</span>
                  <span className="spec__kicker">{s.label}</span>
                  <h3 className="h-sm">{s.title}</h3>
                  <p>{s.body}</p>
                  <ul className="checklist">
                    {s.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* APPS */}
        <AppsShowcase
          apps={c.apps}
          head={
            <SectionHead kicker={c.ui.kicker.apps} title={c.headlines.apps}>
              {c.headlines.appsLead}
            </SectionHead>
          }
        />

        {/* EXPERIENCIA */}
        <section className="section" id="experiencia">
          <div className="container">
            <SectionHead kicker={c.ui.kicker.experience} title={c.headlines.experience} />
            <Timeline />
          </div>
        </section>

        {/* PROYECTOS */}
        <section className="section" id="proyectos">
          <div className="container">
            <SectionHead kicker={c.ui.kicker.projects} title={c.headlines.projects}>
              {c.headlines.projectsLead}
            </SectionHead>
            <div className="bento">
              {c.projects.map((pr, i) => (
                <Card
                  key={pr.url || pr.title}
                  as="article"
                  className={`project ${pr.span >= 4 ? 'project--wide' : ''} ${pr.span === 6 ? 'project--feature' : ''}`}
                  wrapClass={`span-${pr.span}`}
                  revealDelay={(i % 3) * 90}
                >
                  <Visual type={pr.visual} />
                  <div className="project__body">
                    {pr.badge ? (
                      <span className="badge">
                        <span className="badge__dot" />
                        {pr.badge}
                      </span>
                    ) : (
                      <span className="project__place">{pr.place}</span>
                    )}
                    <h3 className={pr.span === 6 && pr.badge ? 'h-md' : 'h-sm'}>{pr.title}</h3>
                    <p>{pr.body}</p>
                    {pr.collab && (
                      <p className="project__collab">
                        {c.ui.builtWith}{' '}
                        <a href={pr.collab.url} target="_blank" rel="noreferrer">
                          {pr.collab.name}
                        </a>
                      </p>
                    )}
                    {pr.points && (
                      <ul className="checklist">
                        {pr.points.map((pt) => (
                          <li key={pt}>{pt}</li>
                        ))}
                      </ul>
                    )}
                    <Chips items={pr.tags} />
                    {pr.url && (
                      <a href={pr.url} target="_blank" rel="noreferrer" className="btn btn--ghost project__link">
                        {c.ui.live} <Arrow />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACTO */}
        <section className="section section--contact" id="contacto">
          <div className="container">
            <Card className="contact">
              <div className="contact__aurora" aria-hidden="true" />
              <span className="kicker">
                <span className="kicker__line" />
                {c.ui.kicker.contact}
              </span>
              <Heading className="h-xl" text={c.headlines.contact} />
              <p className="lead">{c.ui.contact.lead}</p>
              <div className="hero__ctas">
                <a href={`mailto:${p.email}`} className="btn btn--primary btn--lg">
                  {p.email} <Arrow />
                </a>
                <a href={cvHref} download className="btn btn--ghost btn--lg">
                  <DownloadIcon /> {h.cv}
                </a>
                <a href={p.linkedin} target="_blank" rel="noreferrer" className="btn btn--ghost btn--lg">
                  <TechIcon name="LinkedIn" size={18} />
                  LinkedIn
                </a>
                <a href={p.github} target="_blank" rel="noreferrer" className="btn btn--ghost btn--lg">
                  <TechIcon name="GitHub" size={18} />
                  GitHub
                </a>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* FOOTER — llegada a tierra */}
      <footer className="footer">
        <div className="landscape" aria-hidden="true">
          <img
            src="paisaje-vacas.jpg"
            srcSet="paisaje-vacas-1280.jpg 1280w, paisaje-vacas.jpg 2560w"
            sizes="100vw"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="footer__bar">
          <div className="container footer__inner">
            <div className="footer__brand">
              <span>Whady Martínez</span>
            </div>
            <p className="footer__note">{c.ui.footer.note}</p>
            <p className="footer__legal">
              © {new Date().getFullYear()} Whady Martínez · Valencia, Venezuela
              <span className="footer__credit">
                {c.ui.footer.photo}{' '}
                <a href="https://unsplash.com/photos/three-cows-grazing-on-a-grassy-hill-with-a-mountain-in-the-background-qM2BQ05CVLE" target="_blank" rel="noreferrer">
                  Wolfgang Hasselmann / Unsplash
                </a>
              </span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
