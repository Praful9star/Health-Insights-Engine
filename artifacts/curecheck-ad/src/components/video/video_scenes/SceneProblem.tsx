import { motion } from 'framer-motion';

const problems = [
  { text: 'WhatsApp health forwards spread daily', sub: 'Fact or fiction? Hard to tell.' },
  { text: 'Lab reports feel like another language', sub: 'Numbers with no context.' },
  { text: 'Generic advice, no personal clarity', sub: 'Your body is not average.' },
];

export default function SceneProblem() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '0 8vw' }}
    >
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(0.65rem, 1.1vw, 0.85rem)',
          fontWeight: 600,
          letterSpacing: '0.3em',
          color: '#ef4444',
          textTransform: 'uppercase',
          marginBottom: '2rem',
        }}
      >
        THE PROBLEM
      </motion.div>

      {/* Problem cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {problems.map((p, i) => (
          <motion.div
            key={i}
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '1.2rem 1.6rem',
              borderRadius: '12px',
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ color: '#ef4444', fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', flexShrink: 0 }}>✗</div>
            <div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(1rem, 2.2vw, 1.6rem)',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.2,
              }}>
                {p.text}
              </div>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(0.75rem, 1.4vw, 1rem)',
                color: 'rgba(255,255,255,0.72)',
                marginTop: '0.25rem',
              }}>
                {p.sub}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Resolution line */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          marginTop: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 2.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '2px',
            width: '4rem',
            background: '#00d4ff',
            transformOrigin: 'left',
            flexShrink: 0,
          }}
        />
        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)',
          fontWeight: 700,
          background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          CureCheck changes that.
        </div>
      </motion.div>
    </motion.div>
  );
}
