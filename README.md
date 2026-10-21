# Portafolio — Whady Martínez

Portafolio personal bilingüe (ES / EN) con React + Vite. El scroll simula un descenso desde el espacio hasta la superficie:
estrellas → limbo terrestre con atmósfera → cielo de hora azul con nubes (shader WebGL) → paisaje con vacas pastando en el footer.

## Comandos

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # genera /dist listo para publicar
npm run preview  # sirve /dist localmente
```

## Estructura

- `src/content.js` — **todo el contenido en español e inglés**. Cada texto es `L('español', 'english')`. Edita aquí los textos.
- `src/i18n.jsx` — idioma activo (ES/EN): se recuerda en `localStorage` y, sin preferencia guardada, sigue el idioma del navegador.
- `src/components/Sky.jsx` — capa fija del cielo: gradientes atmosféricos, estrellas (canvas), planeta, nubes (`clouds.js`, WebGL con calidad adaptativa) y altímetro.
- `src/components/AppsShowcase.jsx` — vitrina de apps; `AppScreens.jsx` recrea en código las pantallas de HerDex y Clock.Do.
- `src/components/Visuals.jsx` — mini-ilustraciones animadas de los proyectos; la de Oli usa la mascota real de `src/oli/`.
- `src/oli/` — mascota Oli (esfera de partículas en Canvas 2D, con su propio README y pruebas: `node --test src/oli/test/*.test.js`).
- `src/components/fx.jsx` — transiciones (aparición, palabra rotativa del hero, cinta de tecnologías, línea de tiempo).
- `src/styles.css` — tokens de diseño (basados en la guía Mercury) y estilos.
- `public/cv/` — CV en español (`CV-Whady-Martinez-ES.pdf`) e inglés (`CV-Whady-Martinez-EN.pdf`); el botón "Descargar CV" entrega el del idioma activo.
- `public/apps/` — recortes de capturas y logos usados en la vitrina y en la experiencia.

## Agregar enlaces a las apps o proyectos

En `src/content.js`, añade `links` a una app del arreglo `apps`:

```js
links: [{ label: L('Ver en Play Store', 'View on Google Play'), href: 'https://…' }],
```

Los proyectos aceptan `url` (botón "Ver proyecto en vivo").

## Notas

- Las capturas reales (Rimio, Amalia, Credix) están en español en ambos idiomas.
- Los CV en PDF incluyen el teléfono y el correo: si no quieres publicarlos, reemplaza los archivos de `public/cv/`.

## Publicar

`vite.config.js` usa `base: './'`, así que el contenido de `dist/` funciona en GitHub Pages, Netlify o Vercel sin cambios.
