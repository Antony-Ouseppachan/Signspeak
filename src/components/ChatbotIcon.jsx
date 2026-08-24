export default function ChatbotIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="var(--bg-panel)" />
      <circle cx="32" cy="32" r="20" fill="var(--maroon)" />
      <path d="M32 13v5" stroke="var(--bg-panel)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="11" r="2.5" fill="var(--bg-panel)" />
      <rect x="19" y="22" width="26" height="21" rx="9" fill="var(--bg-panel)" />
      <rect x="23" y="26" width="18" height="13" rx="6" fill="var(--rose)" />
      <circle cx="28.5" cy="32.5" r="2" fill="var(--maroon)" />
      <circle cx="35.5" cy="32.5" r="2" fill="var(--maroon)" />
      <path d="M19 29h-3v9h3M45 29h3v9h-3" stroke="var(--bg-panel)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M28 43h8" stroke="var(--bg-panel)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
