import { motion } from 'framer-motion';

export default function SceneOutro() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{ textAlign: 'center' }}
    >
      {/* Large glow pulse behind logo */}
      <motion.div
        className="absolute"
        style={{
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.10) 0%, rgba(124,58,237,0.06) 40%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Logo mark */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.9, type: 'spring', stiffness: 240, damping: 20 }}
        style={{
          position: 'relative',
          zIndex: 1,
          marginBottom: '1.5rem',
        }}
      >
        <div style={{
          width: 'clamp(64px, 10vw, 96px)',
          height: 'clamp(64px, 10vw, 96px)',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(124,58,237,0.2) 100%)',
          border: '1.5px solid rgba(0,212,255,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          boxShadow: '0 0 40px rgba(0,212,255,0.2), 0 0 80px rgba(124,58,237,0.12)',
        }}>
          <span style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>✦</span>
        </div>
      </motion.div>

      {/* Brand name */}
      <div style={{ overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}
        >
          CureCheck
        </motion.div>
      </div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.7 }}
        style={{
          position: 'relative',
          zIndex: 1,
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(0.85rem, 1.8vw, 1.2rem)',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.55)',
          marginTop: '0.75rem',
          letterSpacing: '0.01em',
        }}
      >
        AI-Powered Health Clarity for India
      </motion.div>

      {/* Divider with dots */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          zIndex: 1,
          margin: '2rem auto',
          width: 'clamp(120px, 20vw, 200px)',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)',
        }}
      />

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.7 }}
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.6rem',
          justifyContent: 'center',
          maxWidth: '600px',
          padding: '0 2rem',
        }}
      >
        {['Report Explainer', 'Claim Checker', 'Disease Journey', 'Myth Buster', 'Fitness Hub', 'Health Timeline'].map((f, i) => (
          <motion.div
            key={f}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.3 + i * 0.1, duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.2)',
              color: 'rgba(255,255,255,0.65)',
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.6rem, 1.1vw, 0.8rem)',
              fontWeight: 500,
            }}
          >
            {f}
          </motion.div>
        ))}
      </motion.div>

      {/* Final fade to dark overlay */}
      <motion.div
        className="absolute inset-0"
        style={{ background: '#0a0f1e', pointerEvents: 'none', zIndex: 20 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.0, duration: 1.0 }}
      />
    </motion.div>
  );
}
