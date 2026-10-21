import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { raw } from './content.js';

// Idioma del sitio: ES / EN. Se recuerda en localStorage y, sin preferencia guardada, sigue el idioma del navegador.
export const LANGS = ['es', 'en'];

const Ctx = createContext(null);

const isL = (v) => v && typeof v === 'object' && v.__l === true;

// Resuelve recursivamente cada L(es, en) al idioma pedido
function localize(v, lang) {
  if (isL(v)) return localize(v[lang], lang);
  if (Array.isArray(v)) return v.map((x) => localize(x, lang));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, localize(x, lang)]));
  return v;
}

function detect() {
  try {
    const saved = localStorage.getItem('lang');
    if (LANGS.includes(saved)) return saved;
  } catch {
    // almacenamiento no disponible: se usa el idioma del navegador
  }
  const nav = (navigator.languages?.[0] || navigator.language || 'es').toLowerCase();
  return nav.startsWith('es') ? 'es' : 'en';
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detect);
  const c = useMemo(() => localize(raw, lang), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = c.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', c.meta.description);
  }, [lang, c]);

  const setLang = (next) => {
    setLangState(next);
    try {
      localStorage.setItem('lang', next);
    } catch {
      // sin almacenamiento, el cambio dura solo la sesión
    }
  };

  const value = useMemo(() => ({ lang, setLang, c, cvHref: `cv/CV-Whady-Martinez-${lang.toUpperCase()}.pdf` }), [lang, c]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
