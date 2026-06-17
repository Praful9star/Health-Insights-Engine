import { motion } from 'framer-motion';

export default function Scene1POV() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#020509' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Phone screen glow from bottom — the only light source */}
      <motion.div
        className="absolute"
        style={{
          bottom: '-5%', left: '50%', transform: 'translateX(-50%)',
          width: '90%', height: '55%',
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(120,160,255,0.13) 0%, rgba(80,120,220,0.06) 40%, transparent 70%)',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
        animate={{ opacity: [0.7, 1, 0.8, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Clock — 2:07 AM */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{
          position: 'absolute', top: '10%',
          fontFamily: 'Inter, monospace',
          fontSize: 'clamp(0.7rem,2.8vw,1rem)',
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.15em',
          fontWeight: 300,
        }}
      >
        2:07 AM
      </motion.div>

      {/* Subtle heartbeat pulse ring */}
      {[0, 1].map(i => (
        <motion.div key={i} className="absolute rounded-full" style={{
          border: '1px solid rgba(255,100,100,0.12)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
          animate={{ width: ['15%', '80%'], height: ['15%', '80%'], opacity: [0.5, 0] }}
          transition={{ delay: 0.8 + i * 1.1, duration: 1.8, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.4 }}
        />
      ))}

      {/* Main text — staggered punch-in */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 8%' }}>
        {/* POV: */}
        <div style={{ overflow: 'hidden', marginBottom: '2%' }}>
          <motion.div
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ delay: 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.9rem,3.5vw,1.3rem)',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            POV:
          </motion.div>
        </div>

        {/* it's 2am */}
        <div style={{ overflow: 'hidden', marginBottom: '1%' }}>
          <motion.div
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ delay: 0.38, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(2.4rem,9.5vw,4.2rem)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
            }}
          >
            it's 2am
          </motion.div>
        </div>

        {/* and you don't know */}
        <div style={{ overflow: 'hidden', marginBottom: '1%' }}>
          <motion.div
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ delay: 0.72, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(1.3rem,5.5vw,2.2rem)',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.2,
            }}
          >
            and you don't know
          </motion.div>
        </div>

        {/* if this is serious */}
        <div style={{ overflow: 'hidden' }}>
          <motion.div
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ delay: 1.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(1.3rem,5.5vw,2.2rem)',
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>if </span>
            <motion.span
              animate={{ color: ['rgba(255,255,255,0.7)', 'rgba(255,80,80,0.9)', 'rgba(255,255,255,0.7)'] }}
              transition={{ delay: 1.6, duration: 1.5, ease: 'easeInOut' }}
              style={{ fontWeight: 800 }}
            >
              this is serious
            </motion.span>
          </motion.div>
        </div>
      </div>

      {/* Bottom vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to top, rgba(2,5,9,0.9) 0%, transparent 40%)',
      }} />
    </motion.div>
  );
}
