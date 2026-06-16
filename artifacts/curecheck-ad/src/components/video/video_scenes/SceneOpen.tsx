import { motion } from 'framer-motion';

function LogoMark() {
  return (
    <svg width="56" height="56" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="open-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00c6ff" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#open-logo-grad)" />
      <rect x="14.5" y="7" width="3" height="18" rx="1.5" fill="white" />
      <rect x="7" y="14.5" width="18" height="3" rx="1.5" fill="white" />
    </svg>
  );
}

export default function SceneOpen() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.7 }}
    >
      {/* radial glow behind text */}
      <motion.div
        className="absolute"
        style={{
          width: '70vw',
          height: '70vh',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 1.2, ease: 'easeOut' }}
      />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.7, type: 'spring', stiffness: 260, damping: 22 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}
        >
          <LogoMark />
        </motion.div>

        {/* First line */}
        <div style={{ overflow: 'hidden', marginBottom: '0.25em' }}>
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(2.8rem, 7.5vw, 6.5rem)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.025em',
              lineHeight: 1,
              textShadow: '0 2px 40px rgba(0,212,255,0.15)',
            }}
          >
            YOUR HEALTH
          </motion.div>
        </div>

        {/* Cyan sweep line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #00d4ff 30%, #7c3aed 70%, transparent 100%)',
            transformOrigin: 'left center',
            margin: '1rem auto',
            width: '80%',
          }}
          transition={{ delay: 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Second line */}
        <div style={{ overflow: 'hidden', marginTop: '0.25em' }}>
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(2.8rem, 7.5vw, 6.5rem)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.025em',
              lineHeight: 1,
            }}
          >
            DESERVES CLARITY.
          </motion.div>
        </div>

        {/* Brand label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.6 }}
          style={{
            marginTop: '2.5rem',
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.65rem, 1.2vw, 0.9rem)',
            fontWeight: 600,
            letterSpacing: '0.35em',
            color: 'rgba(255,255,255,0.78)',
            textTransform: 'uppercase',
          }}
        >
          CURECHECK · INDIA
        </motion.div>
      </div>
    </motion.div>
  );
}
