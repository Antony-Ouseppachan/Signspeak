export default function Logo({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="34" r="18" fill="currentColor" stroke="currentColor" strokeWidth="2" />
      <path d="M17 22 L23 30 L14 32 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M47 22 L41 30 L50 32 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="26" cy="33" r="1.6" fill="var(--bg-panel)" />
      <circle cx="38" cy="33" r="1.6" fill="var(--bg-panel)" />
      <path d="M30.5 38 Q32 40 33.5 38" stroke="var(--bg-panel)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
