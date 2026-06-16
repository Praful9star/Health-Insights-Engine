import { motion } from 'framer-motion';

export default function SceneMythBuster() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '0 6vw', perspective: '1200px' }}
    >
      <div style={{ width: '100%', maxWidth: '750px' }}>
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.65rem, 1.1vw, 0.85rem)',
            fontWeight: 600,
            letterSpacing: '0.3em',
            color: '#f59e0b',
            textTransform: 'uppercase',
            marginBottom: '1.2rem',
          }}
        >
          MYTH BUSTER
        </motion.div>

        {/* Title */}
        <div style={{ overflow: 'hidden', marginBottom: '2rem' }}>
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(1.8rem, 4.2vw, 3.2rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
            }}
          >
            Separate fact<br />
            <span style={{ background: 'linear-gradient(90deg, #f59e0b, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              from fiction.
            </span>
          </motion.div>
        </div>

        {/* Card flip area */}
        <div style={{ position: 'relative', height: 'clamp(130px, 20vh, 180px)' }}>
          {/* Myth card — fades out */}
          <motion.div
            initial={{ opacity: 0, rotateY: 0 }}
            animate={{ opacity: [0, 1, 1, 0], rotateY: [0, 0, -15, -90] }}
            transition={{ delay: 0.8, times: [0, 0.1, 0.55, 0.75], duration: 2.0 }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))',
              border: '1px solid rgba(239,68,68,0.3)',
              padding: 'clamp(1rem, 2.5vh, 1.5rem) clamp(1.2rem, 3vw, 2rem)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              backfaceVisibility: 'hidden',
            }}
          >
            <div style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              flexShrink: 0,
            }}>🚫</div>
            <div>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(0.6rem, 1vw, 0.75rem)',
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: '#ef4444',
                textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}>MYTH</div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(1rem, 2.2vw, 1.5rem)',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.3,
              }}>
                "Drinking ghee daily clogs your arteries."
              </div>
            </div>
          </motion.div>

          {/* Fact card — fades in */}
          <motion.div
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: [0, 0, 0, 1], rotateY: [90, 90, 15, 0] }}
            transition={{ delay: 0.8, times: [0, 0.55, 0.75, 1.0], duration: 2.0 }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.10), rgba(16,185,129,0.06))',
              border: '1px solid rgba(0,212,255,0.25)',
              padding: 'clamp(1rem, 2.5vh, 1.5rem) clamp(1.2rem, 3vw, 2rem)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              backfaceVisibility: 'hidden',
            }}
          >
            <div style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              flexShrink: 0,
            }}>✅</div>
            <div>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(0.6rem, 1vw, 0.75rem)',
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: '#10b981',
                textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}>FACT</div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(1rem, 2.2vw, 1.5rem)',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.3,
              }}>
                Moderate ghee has neutral or positive effects when part of a balanced diet.
              </div>
            </div>
          </motion.div>
        </div>

        {/* Source note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.0, duration: 0.5 }}
          style={{
            marginTop: '1.2rem',
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.6rem, 1vw, 0.75rem)',
            color: 'rgba(255,255,255,0.58)',
          }}
        >
          Sources reviewed by AI · Always consult a healthcare professional
        </motion.div>
      </div>
    </motion.div>
  );
}
