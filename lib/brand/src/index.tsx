export function CureCheckMark({
  size = 32,
  id = "cc-logo",
  className = "",
}: {
  size?: number;
  id?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-label="CureCheck logo mark"
    >
      <defs>
        <linearGradient
          id={`${id}-grad`}
          x1="0" y1="0" x2="40" y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M20,3 L35,9 L35,21 Q35,33 20,38 Q5,33 5,21 L5,9 Z"
        stroke={`url(#${id}-grad)`}
        strokeWidth="2.5"
        fill="rgba(0,229,255,0.12)"
        strokeLinejoin="round"
        filter={`url(#${id}-glow)`}
      />
      <path
        d="M8,20 L13,20 L15,13 L17,27 L19,13 L21,27 L23,20 L32,20"
        stroke={`url(#${id}-grad)`}
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${id}-glow)`}
      />
    </svg>
  );
}
