export default function Sdg10Icon({ className = '', size = 220 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="UN Sustainable Development Goal 10: Reduced Inequalities"
      style={{
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
        aspectRatio: '1 / 1',
        borderRadius: '20px',
        overflow: 'hidden'
      }}
    >
      {/* Official UN SDG 10 Vibrant Magenta Background */}
      <rect width="500" height="500" fill="#E11484" />

      {/* Number 10 & Heading Typography */}
      <g fill="#FFFFFF" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif">
        {/* Large Bold "10" */}
        <text
          x="32"
          y="142"
          fontSize="130"
          fontWeight="900"
          letterSpacing="-4px"
        >
          10
        </text>

        {/* Text: REDUCED */}
        <text
          x="160"
          y="84"
          fontSize="46"
          fontWeight="900"
          letterSpacing="0.8px"
        >
          REDUCED
        </text>

        {/* Text: INEQUALITIES */}
        <text
          x="160"
          y="138"
          fontSize="40"
          fontWeight="900"
          letterSpacing="0.4px"
        >
          INEQUALITIES
        </text>
      </g>

      {/* Center Graphic Emblem: 4 Arrows and 3 Horizontal Equal Bars */}
      <g fill="#FFFFFF">
        {/* Top Arrow (pointing UP) */}
        <polygon points="250,182 205,228 295,228" />

        {/* Three Horizontal Equal Bars */}
        <rect x="202" y="268" width="96" height="28" rx="2" />
        <rect x="202" y="316" width="96" height="28" rx="2" />
        <rect x="202" y="364" width="96" height="28" rx="2" />

        {/* Bottom Arrow (pointing DOWN) */}
        <polygon points="250,446 205,400 295,400" />

        {/* Left Arrow (pointing LEFT) */}
        <polygon points="118,330 163,285 163,375" />

        {/* Right Arrow (pointing RIGHT) */}
        <polygon points="382,330 337,285 337,375" />
      </g>
    </svg>
  );
}
