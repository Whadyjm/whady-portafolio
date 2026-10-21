import { Fragment, useEffect, useRef, useState } from 'react';
import TechIcon, { hasIcon } from './TechIcon.jsx';

// El único gran efecto del sitio es el descenso (Sky.jsx) y la entrada del hero. Aquí solo quedan
// transiciones sobrias: aparición al entrar en pantalla, palabra rotativa del hero y la cinta de tecnologías.

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Título con *palabras destacadas* (color sólido, sin degradado)
export function Heading({ as: Tag = 'h2', text, className = '' }) {
  return (
    <Tag className={className} data-reveal>
      {text
        .split(/(\*[^*]+\*)/g)
        .filter(Boolean)
        .map((part, i) =>
          part.startsWith('*') ? (
            <em className="em" key={i}>
              {part.slice(1, -1)}
            </em>
          ) : (
            <Fragment key={i}>{part}</Fragment>
          )
        )}
    </Tag>
  );
}

// Nombre del hero: cada letra entra con un pequeño rebote (parte de la apertura del descenso)
export function SplitLetters({ text, className = '', start = 450, step = 45 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((word, wi, arr) => {
        const offset = arr.slice(0, wi).join(' ').length + (wi ? 1 : 0);
        return (
          <Fragment key={wi}>
            <span className="split-word" aria-hidden="true">
              {[...word].map((ch, ci) => (
                <span className="split-char" key={ci} style={{ animationDelay: `${start + (offset + ci) * step}ms` }}>
                  {ch}
                </span>
              ))}
            </span>
            {wi < arr.length - 1 && ' '}
          </Fragment>
        );
      })}
    </span>
  );
}

// Palabra que rota con transición vertical; el ancho se ajusta a la palabra activa
export function RotatingWord({ words, interval = 2400 }) {
  const [i, setI] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    setI(0);
  }, [words]);

  useEffect(() => {
    if (reducedMotion()) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  useEffect(() => {
    const el = ref.current;
    const fit = () => {
      const active = el.children[i];
      if (active) el.style.width = `${active.scrollWidth}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [i, words]);

  return (
    // aria-hidden: el lector de pantalla recibe la lista completa en un texto aparte, no las palabras superpuestas
    <span className="rotator" ref={ref} aria-hidden="true">
      {words.map((w, k) => (
        <span key={w} className={`rotator__word ${k === i ? 'is-active' : ''} ${k === (i - 1 + words.length) % words.length ? 'is-leaving' : ''}`}>
          {w}
        </span>
      ))}
    </span>
  );
}

// Tarjeta con aparición al entrar en pantalla
export function Card({ as: Tag = 'div', className = '', wrapClass = '', revealDelay = 0, children, ...rest }) {
  return (
    <div className={`card-wrap ${wrapClass}`} data-reveal="card" style={{ '--d': `${revealDelay}ms` }}>
      <Tag className={`card ${className}`} {...rest}>
        {children}
      </Tag>
    </div>
  );
}

// Cinta infinita de elementos (se duplica el contenido para el loop)
export function Marquee({ items, reverse = false, speed = 40 }) {
  const row = items.map((t, i) => (
    <span className="marquee__item" key={i}>
      {hasIcon(t) && <TechIcon name={t} size="0.78em" />}
      {t}
      <span className="marquee__sep" aria-hidden="true">
        ✦
      </span>
    </span>
  ));
  return (
    <div className={`marquee ${reverse ? 'marquee--reverse' : ''}`} aria-hidden="true">
      <div className="marquee__track" style={{ animationDuration: `${speed}s` }}>
        {row}
        {row}
      </div>
    </div>
  );
}

// Línea de tiempo cuyo trazo se rellena con el scroll
export function useTimelineProgress(ref) {
  useEffect(() => {
    const el = ref.current;
    const bar = el.querySelector('.timeline__progress');
    const items = [...el.querySelectorAll('.timeline__item')];
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.6;
      const k = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      bar.style.transform = `scaleY(${k})`;
      for (const it of items) {
        const ir = it.getBoundingClientRect();
        it.classList.toggle('is-active', ir.top < mid);
      }
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
  }, [ref]);
}
