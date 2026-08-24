export default function Logo({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="35" r="18" fill="var(--bg-panel)" stroke="var(--text)" strokeWidth="1.8" />
      <path d="M18 23 L23 30 L14 32 Z" fill="var(--bg-panel)" stroke="var(--text)" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M37 30 C36 28 38 26 40 27 L42 28 L43 17 C43 15 45 14 46 16 L46 25 L48 14 C48 12 51 12 51 15 L50 25 L52 18 C53 16 55 16 55 19 L53 27 L55 23 C56 21 58 22 57 25 L54 32 C53 35 49 37 45 35 L40 33 Z" fill="var(--rose)" stroke="var(--rose)" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="26" cy="34" r="1.6" fill="var(--text)" />
      <circle cx="38" cy="34" r="1.6" fill="var(--text)" />
      <path d="M30.5 40 Q32 42 33.5 40" stroke="var(--text)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
