import { motion } from 'framer-motion';

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
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 1.2, ease: 'easeOut' }}
      />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
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
            marginTop: '3rem',
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.65rem, 1.2vw, 0.9rem)',
            fontWeight: 600,
            letterSpacing: '0.35em',
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
          }}
        >
          CURECHECK · INDIA
        </motion.div>
      </div>
    </motion.div>
  );
}
