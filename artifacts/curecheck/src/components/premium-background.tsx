/**
 * PremiumBackground — fixed, GPU-light animated backdrop for the whole app.
 * Pure CSS (radial gradients + slow aurora drift + faint grid). No WebGL,
 * so it stays smooth on low-end mobile devices common in India.
 */
export default function PremiumBackground() {
  return (
    <>
      <div className="premium-bg" aria-hidden="true" />
      <div
        className="grid-overlay fixed inset-0 -z-10 pointer-events-none opacity-[0.35]"
        aria-hidden="true"
      />
    </>
  );
}
