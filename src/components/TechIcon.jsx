import {
  siFlutter, siDart, siReact, siNextdotjs, siAngular, siTypescript, siGooglegemini, siClaude, siOpenai,
  siAmazonwebservices, siNestjs, siPrisma, siSpringboot, siNodedotjs, siPython, siSupabase, siPostgresql,
  siMysql, siFirebase, siResend, siGoogleplay, siAppstore, siGitlab, siFigma, siNotion, siJira, siGithub, siLinkedin,
} from 'simple-icons';

// Íconos de marca (simple-icons) por nombre de tecnología; el resto usa glifos propios o un monograma
const BRAND = {
  Flutter: siFlutter,
  Dart: siDart,
  'React Native': siReact,
  'React.js': siReact,
  'Next.js': siNextdotjs,
  Angular: siAngular,
  TypeScript: siTypescript,
  Gemini: siGooglegemini,
  Claude: siClaude,
  OpenAI: siOpenai,
  'AWS Bedrock': siAmazonwebservices,
  Bedrock: siAmazonwebservices,
  'Nest.js': siNestjs,
  Prisma: siPrisma,
  'Spring Boot': siSpringboot,
  'Node.js': siNodedotjs,
  Python: siPython,
  Supabase: siSupabase,
  PostgreSQL: siPostgresql,
  MySQL: siMysql,
  Firestore: siFirebase,
  Firebase: siFirebase,
  Resend: siResend,
  'Play Console': siGoogleplay,
  'App Store Connect': siAppstore,
  'GitLab CI/CD': siGitlab,
  Figma: siFigma,
  GitHub: siGithub,
  LinkedIn: siLinkedin,
  Notion: siNotion,
  Jira: siJira,
};

// Glifos de línea para conceptos sin logo de marca
const GLYPH = {
  'AI Agents': 'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  'Agentes IA': 'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  'Prompt engineering': 'M4 6h16M4 12h10M4 18h7 M17 15l3 3-3 3',
  'Reinforcement Learning': 'M12 4a8 8 0 1 1-7.4 5 M4 4v5h5 M12 9v3l2 2',
  Webhooks: 'M9 7a3 3 0 1 1 3 3l-3 6 M15 17a3 3 0 1 1-3-3h6 M6 15a3 3 0 1 1 1.5 2.6',
  Scrum: 'M4 12a8 8 0 0 1 14-5.3 M20 12a8 8 0 0 1-14 5.3 M18 3v4h-4 M6 21v-4h4',
  BLoC: 'M4 4h7v7H4z M13 13h7v7h-7z M11 7.5h4.5V13',
  Provider: 'M12 3v6 M12 15v6 M5 8l5 3 M14 13l5 3 M19 8l-5 3 M10 13l-5 3',
  GetX: 'M5 5l14 14 M19 5L5 19',
};

const isDark = (hex) => {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 70;
};

export const hasIcon = (name) => Boolean(BRAND[name] || GLYPH[name]);

export function brandColor(name) {
  const icon = BRAND[name];
  if (!icon) return null;
  return isDark(icon.hex) ? '#ededf3' : `#${icon.hex}`;
}

export default function TechIcon({ name, size = 16 }) {
  const icon = BRAND[name];
  if (icon) {
    return (
      <svg className="tech-icon" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
        <path d={icon.path} />
      </svg>
    );
  }
  if (GLYPH[name]) {
    return (
      <svg className="tech-icon" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={GLYPH[name]} />
      </svg>
    );
  }
  // monograma para servicios sin logo público (Banco R4, WonderPush, HikCentral, SUMO…)
  return (
    <span className="tech-icon tech-icon--mono" style={{ width: size, height: size, fontSize: size * 0.5 }} aria-hidden="true">
      {name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase()}
    </span>
  );
}

// Chip con ícono; el color de marca aparece al pasar el cursor
export function TechChip({ name, large = false, style }) {
  const color = brandColor(name);
  return (
    <span className={`chip chip--tech ${large ? 'chip--lg' : ''}`} style={{ ...style, '--brand': color || 'var(--accent-soft)' }}>
      <TechIcon name={name} size={large ? 17 : 14} />
      {name}
    </span>
  );
}
