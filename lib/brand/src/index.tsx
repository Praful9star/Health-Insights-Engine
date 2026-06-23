export interface CureCheckMarkProps {
  size?: number;
  className?: string;
  /** gradient = filled gradient mark (default). solid = currentColor outline. white = all-white. favicon = thicker, simplified. */
  variant?: "gradient" | "solid" | "white" | "favicon";
  /** Unique prefix so gradient IDs don't collide when multiple instances appear on one page. */
  id?: string;
}

// 48×48 viewBox — integer-snapped paths, pixel-crisp at 16 / 24 / 32 / 48 / 512 px
const SHIELD = "M24,3 L41,10 L41,26 Q41,39 24,46 Q7,39 7,26 L7,10 Z";
const ECG    = "M10,24 L16,24 L18,16 L20,32 L22,16 L24,32 L26,24 L38,24";
// Simplified ECG — one QRS complex, wider strokes, legible at 16 px
const ECG_SM = "M12,24 L18,24 L21,14 L23,34 L26,24 L36,24";

export function CureCheckMark({
  size = 32,
  className = "",
  variant = "gradient",
  id = "cc",
}: CureCheckMarkProps) {
  const v = "0 0 48 48";

  /* ── WHITE (dark-background lockup) ── */
  if (variant === "white") {
    return (
      <svg width={size} height={size} viewBox={v} fill="none"
        aria-label="CureCheck" className={className}>
        <path d={SHIELD}
          fill="rgba(255,255,255,0.18)"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
          strokeLinejoin="round" />
        <path d={ECG}
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round" />
      </svg>
    );
  }

  /* ── SOLID / currentColor (monochrome, adapts to parent color) ── */
  if (variant === "solid") {
    return (
      <svg width={size} height={size} viewBox={v} fill="none"
        aria-label="CureCheck" className={className}>
        <path d={SHIELD}
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round" />
        <path d={ECG}
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round" />
      </svg>
    );
  }

  /* ── FAVICON (gradient fill, simplified ECG, thick strokes) ── */
  if (variant === "favicon") {
    return (
      <svg width={size} height={size} viewBox={v} fill="none"
        aria-label="CureCheck" className={className}>
        <defs>
          <linearGradient id={`${id}-fv-fill`}
            x1="24" y1="3" x2="24" y2="46"
            gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#7DBDF8" />
            <stop offset="100%" stopColor="#1A6FE3" />
          </linearGradient>
        </defs>
        <path d={SHIELD} fill={`url(#${id}-fv-fill)`} />
        <path d={ECG_SM}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round" />
      </svg>
    );
  }

  /* ── GRADIENT (default — header, hero, footer, login) ── */
  return (
    <svg width={size} height={size} viewBox={v} fill="none"
      aria-label="CureCheck" className={className}>
      <defs>
        {/* Vertical gradient: lighter sky-blue → brand primary #1A6FE3 */}
        <linearGradient id={`${id}-fill`}
          x1="24" y1="3" x2="24" y2="46"
          gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#7DBDF8" />
          <stop offset="100%" stopColor="#1A6FE3" />
        </linearGradient>

        {/* Inner glass highlight — top-left bright → transparent */}
        <linearGradient id={`${id}-shine`}
          x1="7" y1="3" x2="36" y2="26"
          gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="white" stopOpacity="0.28" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Soft glow behind the ECG line */}
        <filter id={`${id}-glow`}
          x="-20%" y="-40%" width="140%" height="180%"
          colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shield — gradient fill */}
      <path d={SHIELD} fill={`url(#${id}-fill)`} />
      {/* Shield — glass sheen overlay */}
      <path d={SHIELD} fill={`url(#${id}-shine)`} />
      {/* Shield — subtle white rim for definition */}
      <path d={SHIELD}
        stroke="rgba(255,255,255,0.32)"
        strokeWidth="1"
        strokeLinejoin="round" />

      {/* ECG pulse line — white with soft glow */}
      <path d={ECG}
        stroke="white"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${id}-glow)`} />
    </svg>
  );
}
