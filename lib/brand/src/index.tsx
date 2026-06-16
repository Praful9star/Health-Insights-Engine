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
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="CureCheck logo mark"
    >
      <defs>
        <linearGradient
          id={`${id}-grad`}
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00c6ff" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id}-grad)`} />
      <rect x="14.5" y="7" width="3" height="18" rx="1.5" fill="white" />
      <rect x="7" y="14.5" width="18" height="3" rx="1.5" fill="white" />
    </svg>
  );
}
