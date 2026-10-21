// Contenido del portafolio en español e inglés (fuente: CV en ambos idiomas).
// L(es, en) marca un texto con sus dos versiones; i18n.jsx devuelve el árbol ya resuelto al idioma activo.
// Edita este archivo para actualizar textos sin tocar los componentes.

const L = (es, en) => ({ __l: true, es, en });

export const raw = {
  meta: {
    title: L('Whady Martínez — Desarrollador Mobile e IA', 'Whady Martínez — Mobile & AI Developer'),
    description: L(
      'Portafolio de Whady Martínez: desarrollador mobile (Flutter, React Native) especializado en integración de IA generativa, agentes inteligentes y software full stack.',
      'Portfolio of Whady Martínez: mobile developer (Flutter, React Native) specialized in generative AI integration, intelligent agents and full-stack software.'
    ),
  },

  ui: {
    skip: L('Saltar al contenido', 'Skip to content'),
    menu: L('Abrir menú', 'Open menu'),
    mainNav: L('Principal', 'Main'),
    langLabel: L('Idioma', 'Language'),
    nav: {
      about: L('Sobre mí', 'About'),
      focus: L('Especialidades', 'Focus'),
      apps: 'Apps',
      experience: L('Experiencia', 'Experience'),
      projects: L('Proyectos', 'Projects'),
    },
    contactCta: L('Contáctame', 'Contact me'),
    kicker: {
      about: L('Sobre mí', 'About me'),
      focus: L('Especialidades', 'Focus areas'),
      apps: L('Apps móviles', 'Mobile apps'),
      experience: L('Experiencia', 'Experience'),
      projects: L('Proyectos', 'Projects'),
      contact: L('Contacto', 'Contact'),
    },
    hero: {
      talk: L('Hablemos', "Let's talk"),
      cv: L('Descargar CV', 'Download CV'),
      scroll: L('Desliza para descender', 'Scroll to descend'),
      before: L('Construyo ', 'I build '),
      after: L(' que llegan a producción.', ' that reach production.'),
      srWork: L('Trabajo con', 'I work with'),
    },
    contact: {
      lead: L(
        'Una app móvil, un agente de IA o un MVP que necesita salir a producción. Escríbeme y conversemos.',
        "A mobile app, an AI agent or an MVP that needs to ship. Write to me and let's talk."
      ),
    },
    footer: {
      note: L(
        'Aterrizaje completado. Cuando no estoy programando, me encontrarás cerca del campo — la ganadería y la agricultura son mis otras pasiones.',
        "Landing complete. When I'm not coding, you'll find me out in the countryside — livestock farming and agriculture are my other passions."
      ),
      photo: L('Foto:', 'Photo:'),
    },
    altimeter: {
      label: L('Altitud', 'Altitude'),
      layers: {
        thermo: L('Termosfera', 'Thermosphere'),
        meso: L('Mesosfera', 'Mesosphere'),
        strato: L('Estratosfera', 'Stratosphere'),
        tropo: L('Troposfera', 'Troposphere'),
        surface: L('Superficie', 'Surface'),
      },
    },
    illustrative: L('Ilustración con datos de ejemplo', 'Illustration with sample data'),
    recreated: L('Pantalla recreada con datos de ejemplo', 'Recreated screen with sample data'),
    inDevelopment: L('En desarrollo', 'In development'),
    live: L('Ver proyecto en vivo', 'View live project'),
    builtWith: L('Hecho junto a', 'Built together with'),
  },

  profile: {
    name: 'Whady Martínez',
    location: 'Valencia, Venezuela',
    tag: L('Valencia, Venezuela · Desarrollador Mobile & IA', 'Valencia, Venezuela · Mobile & AI Developer'),
    email: 'martinez.whady@gmail.com',
    linkedin: 'https://www.linkedin.com/in/whady-mart%C3%ADnez-249b26300/',
    github: 'https://github.com/Whadyjm',
    rotating: L(
      ['apps móviles', 'agentes de IA', 'productos digitales', 'experiencias Flutter'],
      ['mobile apps', 'AI agents', 'digital products', 'Flutter experiences']
    ),
    pitch: L(
      'Desarrollador Mobile con más de 5 años llevando ideas a producción: apps multiplataforma con Flutter y React Native, potenciadas con IA generativa y agentes que ejecutan tareas reales.',
      'Mobile developer with 5+ years taking ideas to production: cross-platform apps with Flutter and React Native, powered by generative AI and agents that carry out real tasks.'
    ),
    stats: [
      { value: '5+', label: L('años construyendo software', 'years building software') },
      { value: '4', label: L('proveedores de LLM integrados', 'LLM providers integrated') },
      { value: '2', label: L('tiendas oficiales: Play Store y App Store', 'official stores: Play Store and App Store') },
    ],
  },

  about: {
    paragraphs: [
      L(
        'Soy desarrollador de software con más de 5 años de experiencia, especializado en aplicaciones móviles multiplataforma y web modernas, y en la integración avanzada de Inteligencia Artificial.',
        'I am a software developer with 5+ years of experience, specialized in cross-platform mobile apps and modern web, and in advanced Artificial Intelligence integration.'
      ),
      L(
        'Mi base es Flutter y Dart para diseñar arquitecturas móviles escalables, complementada con el ecosistema React (React Native, React.js, Next.js) y un backend sólido con Nest.js, Spring Boot, Python y Supabase.',
        'My foundation is Flutter and Dart for scalable mobile architectures, complemented by the React ecosystem (React Native, React.js, Next.js) and a solid backend with Nest.js, Spring Boot, Python and Supabase.'
      ),
      L(
        'Me apasiona llevar la IA del demo a producción: agentes que ejecutan tareas, asistentes conversacionales y sistemas de visión por computador que generan métricas en tiempo real.',
        'I love taking AI from demo to production: agents that carry out tasks, conversational assistants and computer-vision systems that produce real-time metrics.'
      ),
    ],
    facts: [
      { label: L('Ubicación', 'Location'), value: 'Valencia, Venezuela' },
      { label: L('Formación', 'Education'), value: L('Ingeniería en Electrónica · UJAP', 'B.S. in Electronics Engineering · UJAP') },
      { label: L('Diplomado', 'Diploma'), value: L('Mecatrónica · UJAP', 'Mechatronics · UJAP') },
      { label: L('Idiomas', 'Languages'), value: L('Inglés avanzado', 'Advanced English') },
      { label: L('Intereses', 'Interests'), value: L('Ganadería y agricultura', 'Livestock farming & agriculture') },
    ],
  },

  specialties: [
    {
      id: 'mobile',
      label: 'Mobile',
      title: L('Desarrollo Mobile multiplataforma', 'Cross-platform mobile development'),
      body: L(
        'Apps de alto rendimiento para iOS y Android con Flutter y React Native: arquitectura limpia, widgets personalizados, animaciones fluidas y el ciclo completo de publicación.',
        'High-performance apps for iOS and Android with Flutter and React Native: clean architecture, custom widgets, fluid animations and the full publishing cycle.'
      ),
      points: L(
        ['Flutter & Dart · BLoC, Provider, GetX', 'React Native · React.js · Next.js', 'APIs REST y WebSockets', 'Compilación, firma, betas y despliegue en Play Store y App Store'],
        ['Flutter & Dart · BLoC, Provider, GetX', 'React Native · React.js · Next.js', 'REST APIs and WebSockets', 'Build, signing, betas and release on Google Play and the App Store']
      ),
    },
    {
      id: 'ai',
      label: L('IA & Agentes', 'AI & Agents'),
      title: L('IA generativa y sistemas agénticos', 'Generative AI and agentic systems'),
      body: L(
        'Integración de LLMs para construir agentes que razonan y ejecutan acciones, asistentes conversacionales y flujos de automatización que ahorran trabajo real.',
        'LLM integration to build agents that reason and take action, conversational assistants and automation flows that save real work.'
      ),
      points: L(
        ['Gemini, Claude, OpenAI, AWS Bedrock', 'Agentes con herramientas y prompts avanzados', 'NLP y automatización de flujos de trabajo', 'Reinforcement Learning y visión por computador'],
        ['Gemini, Claude, OpenAI, AWS Bedrock', 'Agents with tools and advanced prompts', 'NLP and workflow automation', 'Reinforcement learning and computer vision']
      ),
    },
    {
      id: 'software',
      label: 'Software',
      title: L('Backend e integraciones full stack', 'Backend and full-stack integrations'),
      body: L(
        'Servicios y APIs que sostienen el producto: modelado de datos, pagos, notificaciones transaccionales y automatizaciones, listos para escalar.',
        'Services and APIs behind the product: data modeling, payments, transactional notifications and automations, ready to scale.'
      ),
      points: L(
        ['Nest.js, Prisma, Spring Boot, Node.js', 'Supabase, PostgreSQL, MySQL, Firestore', 'Pasarela de pago Banco R4, Webhooks', 'WonderPush, Resend, HikCentral'],
        ['Nest.js, Prisma, Spring Boot, Node.js', 'Supabase, PostgreSQL, MySQL, Firestore', 'Banco R4 payment gateway, webhooks', 'WonderPush, Resend, HikCentral']
      ),
    },
  ],

  marquee: [
    'Flutter', 'Dart', 'React Native', 'Next.js', 'TypeScript', 'Angular', L('Agentes IA', 'AI Agents'), 'Gemini', 'Claude',
    'OpenAI', 'AWS Bedrock', 'Nest.js', 'Spring Boot', 'Prisma', 'Node.js', 'Python', 'Supabase', 'PostgreSQL', 'MySQL',
    'Firebase', 'Reinforcement Learning', 'Figma', 'GitLab CI/CD',
  ],

  headlines: {
    about: L('Del *prototipo* a la tienda. Del *prompt* a producción.', 'From *prototype* to the store. From *prompt* to production.'),
    specialties: L('Tres superpoderes, *un solo* producto.', 'Three strengths, *one* product.'),
    specialtiesLead: L(
      'La app es la interfaz, la IA es el cerebro y el backend es la base que lo sostiene. Domino las tres.',
      'The app is the interface, AI is the brain and the backend is the foundation. I work across all three.'
    ),
    apps: L('Apps hechas para *el bolsillo.*', 'Apps made for *your pocket.*'),
    appsLead: L('Diseño y desarrollo de apps móviles, del prototipo a la tienda.', 'Design and development of mobile apps, from prototype to store.'),
    experience: L('Dónde he *construido.*', "Where I've *built.*"),
    projects: L('Más allá de *las apps.*', 'Beyond *the apps.*'),
    projectsLead: L('Agentes de IA, visión por computador y aprendizaje por refuerzo.', 'AI agents, computer vision and reinforcement learning.'),
    contact: L('¿Construimos algo *extraordinario?*', 'Shall we build something *extraordinary?*'),
  },

  // Vitrina de apps móviles.
  // custom: pantalla recreada en HTML (components/AppScreens.jsx); screens: recortes de capturas (public/apps)
  // color: tono de marca de cada app, solo para el halo detrás de los teléfonos
  apps: [
    {
      id: 'herdex',
      name: 'HerDex',
      tagline: L('Tecnología e IA para tu ganado.', 'Technology and AI for your livestock.'),
      place: L('AgroTech · IA', 'AgTech · AI'),
      body: L(
        'Registra, monitorea y analiza a tus animales con inteligencia artificial: estimación de peso y salud a partir de una foto, reconocimiento de cada animal, sincronización en la nube y reportes en tiempo real.',
        'Register, monitor and analyze your animals with artificial intelligence: weight and health estimates from a photo, animal recognition, cloud sync and real-time reports.'
      ),
      tech: [],
      extra: [L('IA', 'AI'), L('Visión por computador', 'Computer vision'), L('Ganadería', 'Livestock')],
      color: '46, 154, 79',
      statusBar: '#f6faf6',
      custom: 'herdex',
      illustrative: true,
      chips: [L('Reconocimiento de animales', 'Animal recognition'), L('Sincronización en la nube', 'Cloud sync')],
    },
    {
      id: 'clockdo',
      name: 'Clock.Do',
      tagline: L('Planifica, organiza, cumple.', 'Plan, organize, deliver.'),
      place: L('Productividad', 'Productivity'),
      body: L(
        'Tu día sobre un reloj: calendarios sincronizados, tareas y recordatorios en bloques de tiempo, logros y hábitos para mantener la racha, e integración con Notion y Jira.',
        'Your day on a clock: synced calendars, tasks and reminders in time blocks, achievements and habits to keep your streak, and Notion and Jira integration.'
      ),
      tech: [],
      extra: ['Notion', 'Jira', L('Hábitos', 'Habits')],
      color: '110, 76, 240',
      statusBar: '#f4f2ff',
      custom: 'clockdo',
      illustrative: true,
      chips: [L('Calendarios sincronizados', 'Synced calendars'), L('Logros y hábitos', 'Achievements and habits')],
    },
    {
      id: 'rimio',
      name: 'Rimio',
      tagline: L('El marketplace de la música.', 'The music marketplace.'),
      place: 'Marketplace',
      status: true,
      body: L(
        'Compra y venta de instrumentos musicales: categorías, búsqueda, publicaciones por ubicación, favoritos, comunidad y ficha de producto con compra.',
        'Buy and sell musical instruments: categories, search, location-based listings, favorites, community and product pages with checkout.'
      ),
      tech: ['Flutter', 'Firebase'],
      extra: [],
      color: '108, 63, 196',
      statusBar: '#6a3dbd',
      screens: ['rimio-grid', 'rimio-home', 'rimio-detail'],
      chips: [L('Guitarras · Baterías · Teclados', 'Guitars · Drums · Keyboards')],
    },
  ],

  experience: [
    {
      role: 'Full Stack Developer',
      company: 'Amalia Salud',
      summary: L(
        'Soluciones tecnológicas integrales para el sector salud, combinando frontend móvil multiplataforma y arquitectura backend. Su app, amalia, reúne tu salud en un solo lugar.',
        'End-to-end healthcare technology solutions combining a cross-platform mobile frontend and backend architecture. Its app, amalia, brings your health into one place.'
      ),
      highlights: L(
        [
          'App para agendar consultas por especialidad o por médico',
          'Consultas, diagnósticos, chats y alertas desde la app',
          'Aplicaciones móviles avanzadas con Flutter',
          'Backend y base de datos con Supabase, automatizaciones con Python',
        ],
        [
          'App to book appointments by specialty or by doctor',
          'Appointments, diagnoses, chats and alerts from the app',
          'Advanced mobile applications with Flutter',
          'Backend and database with Supabase, automations with Python',
        ]
      ),
      tags: ['Flutter', 'Supabase', 'Python'],
      // media: logo + pantalla de la app que se muestran junto a la experiencia
      media: { logo: 'amalia-logo', logoTile: true, screen: 'amalia-screen', statusBar: '#f7f7f8', tone: '149, 170, 222' },
    },
    {
      role: L('Analista Programador', 'Programmer Analyst'),
      company: 'Intelix',
      summary: L(
        'Desarrollo de nuevos requerimientos y funcionalidades para Credix, plataforma financiera en Costa Rica.',
        'Development of new features and requirements for Credix, a financial platform in Costa Rica.'
      ),
      highlights: L(
        ['Evolución de un producto fintech en producción', 'Saldo disponible, detalle de pago en colones y dólares', 'Cuentas IBAN, fechas de corte y movimientos'],
        ['Evolving a fintech product in production', 'Available balance, payment breakdown in colones and dollars', 'IBAN accounts, cut-off dates and transactions']
      ),
      tags: ['Fintech', 'Credix'],
      media: { logo: 'credix-logo', logoTile: true, screen: 'credix-home', statusBar: '#ffffff', tone: '229, 57, 53' },
    },
    {
      role: L('Desarrollador de Software', 'Software Developer'),
      company: L('IA & Integraciones Avanzadas', 'AI & Advanced Integrations'),
      summary: L(
        'Implementación de modelos de IA generativa, visión por computador y sistemas de video para operaciones reales.',
        'Implementation of generative AI models, computer vision and video systems for real operations.'
      ),
      highlights: L(
        [
          'Agentes inteligentes y asistentes conversacionales con APIs de LLMs',
          'Monitoreo de flujo peatonal en centros comerciales (en producción)',
          'Control de accesos y videovigilancia con HikCentral',
        ],
        [
          'Intelligent agents and conversational assistants with LLM APIs',
          'Foot-traffic monitoring in shopping malls (in production)',
          'Access control and video surveillance with HikCentral',
        ]
      ),
      tags: ['LLMs', L('Agentes', 'Agents'), 'Python', L('Visión', 'Vision')],
    },
    {
      role: L('Desarrollador Mobile & Web', 'Mobile & Web Developer'),
      company: L('Proyectos MVP', 'MVP Projects'),
      summary: L(
        'Diseño, arquitectura y construcción de MVPs móviles y web, desde el prototipo en Figma hasta la publicación.',
        'Design, architecture and construction of mobile and web MVPs, from the Figma prototype to release.'
      ),
      highlights: L(
        [
          'Apps multiplataforma con Flutter y React Native',
          'Pagos con Banco R4, push con WonderPush y correo con Resend',
          'Gestión completa de releases en Google Play y App Store',
        ],
        [
          'Cross-platform apps with Flutter and React Native',
          'Payments with Banco R4, push with WonderPush and email with Resend',
          'End-to-end release management on Google Play and the App Store',
        ]
      ),
      tags: ['Flutter', 'React Native', 'Figma', 'CI/CD'],
    },
  ],

  projects: [
    // span: columnas que ocupa en la cuadrícula bento de 6 columnas
    {
      title: L('Oli — Pagos para agentes', 'Oli — Payments for agents'),
      badge: L('Hackathon 30X · Reto Blinka', 'Hackathon 30X · Blinka challenge'),
      body: L(
        'Infraestructura de pagos para agentes de IA. Oli actúa como guardián financiero: lee la factura original, la contrasta con el proveedor, el acuerdo y el presupuesto, aplica el mandato de la empresa y decide aprobar, escalar a una persona o bloquear — cada decisión con su porqué y su rastro.',
        "Payments infrastructure for AI agents. Oli acts as a financial guardian: it reads the original invoice, checks it against the vendor, the agreement and the budget, applies the company's mandate and decides to approve, escalate to a person or block — every decision with its reason and its trail."
      ),
      points: L(
        [
          'Los agentes se conectan vía API y Oli Skill',
          'Conversación por web y móvil, Telegram y email',
          'Límites automáticos, techo absoluto y detección de duplicados',
          'Ante la incertidumbre, siempre revisión humana',
        ],
        [
          'Agents connect through the API and Oli Skill',
          'Conversation on web and mobile, Telegram and email',
          'Automatic limits, absolute ceiling and duplicate detection',
          'When in doubt, always human review',
        ]
      ),
      tags: [L('Agentes IA', 'AI Agents'), 'Fintech', 'Human-in-the-loop', 'API & Skill'],
      url: 'https://oli30x.ultramare.dev/',
      collab: { name: 'Oscar Crescente', url: 'https://crescente.dev/' },
      visual: 'oli',
      span: 6,
    },
    {
      title: L('Agentes y asistentes IA', 'AI agents and assistants'),
      place: L('IA generativa', 'Generative AI'),
      body: L(
        'Agentes inteligentes y asistentes conversacionales sobre Gemini, Claude, OpenAI y AWS Bedrock que orquestan herramientas para optimizar flujos de trabajo y automatizar tareas.',
        'Intelligent agents and conversational assistants on Gemini, Claude, OpenAI and AWS Bedrock that orchestrate tools to optimize workflows and automate tasks.'
      ),
      tags: ['LLMs', L('Agentes', 'Agents'), 'NLP'],
      visual: 'agents',
      span: 4,
    },
    {
      title: L('Flujo peatonal en tiempo real', 'Real-time foot traffic'),
      place: L('Visión por computador · En producción', 'Computer vision · In production'),
      body: L(
        'Monitoreo y análisis de flujo peatonal en centros comerciales: procesamiento de métricas y visualización analítica en tiempo real.',
        'Foot-traffic monitoring and analytics in shopping malls: metric processing and real-time analytical visualization.'
      ),
      tags: ['Python', L('Visión', 'Vision'), L('Analítica', 'Analytics')],
      visual: 'vision',
      span: 2,
    },
    {
      title: L('Tráfico adaptativo con RL', 'Adaptive traffic with RL'),
      place: L('Proyecto personal', 'Personal project'),
      body: L(
        'Modelos de aprendizaje por refuerzo que aprenden a controlar semáforos en intersecciones urbanas, entrenados en el simulador SUMO.',
        'Reinforcement-learning models that learn to control traffic lights at urban intersections, trained in the SUMO simulator.'
      ),
      tags: ['Reinforcement Learning', 'Python', 'SUMO'],
      visual: 'traffic',
      span: 6,
    },
  ],

  // Textos de las ilustraciones y pantallas recreadas
  visuals: {
    invoice: L('factura.pdf', 'invoice.pdf'),
    oliLabel: L('Oli, el guardián financiero, evaluando una factura', 'Oli, the financial guardian, reviewing an invoice'),
    withinRules: L('Dentro de tus reglas', 'Within your rules'),
    needsApproval: L('Necesita tu aprobación', 'Needs your approval'),
    duplicate: L('Factura duplicada', 'Duplicate invoice'),
    occupancy: L('Aforo · 128', 'Occupancy · 128'),
    episode: L('episodio 1 240', 'episode 1,240'),
  },
  screens: {
    herdex: {
      animal: 'Animal #0427',
      breed: L('Raza', 'Breed'),
      breedValue: 'Angus',
      age: L('Edad', 'Age'),
      ageValue: L('3 años', '3 years'),
      sex: L('Género', 'Sex'),
      sexValue: L('Hembra', 'Female'),
      history: L('Historial de peso', 'Weight history'),
      estimated: L('Peso estimado', 'Estimated weight'),
      vsLast: L('vs. último mes', 'vs. last month'),
      analysis: L('Análisis de IA', 'AI analysis'),
      analysisText: L('Crecimiento saludable y buen estado físico.', 'Healthy growth and good physical condition.'),
      status: L('Estado: Óptimo', 'Status: Optimal'),
    },
    clockdo: {
      date: L('Martes, 8 sept.', 'Tuesday, Sept 8'),
      days: L(['SÁB', 'DOM', 'LUN', 'MAR', 'MIÉ'], ['SAT', 'SUN', 'MON', 'TUE', 'WED']),
      task1: L('Almuerzo con mi madre', 'Lunch with my mom'),
      task2: L('Pasear a mi perro', 'Walk my dog'),
      pending: L('Pendiente', 'Pending'),
      nav: L(['Hoy', 'Calendario', 'Logros', 'Más'], ['Today', 'Calendar', 'Achievements', 'More']),
    },
  },
};
