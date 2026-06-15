import { motion } from 'framer-motion';

const features = [
  {
    icon: '🗺️',
    title: 'Disease Journey Map',
    desc: 'Phase-by-phase roadmap for any condition — symptoms, milestones, warning signs.',
    color: '#00d4ff',
    glow: 'rgba(0,212,255,0.15)',
  },
  {
    icon: '💪',
    title: 'Fitness Hub',
    desc: 'Personalised workout plans and nutrition insights aligned to your health goals.',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.15)',
  },
  {
    icon: '📅',
    title: 'Health Timeline',
    desc: 'Save and track all your health events, reports and insights in one place.',
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.15)',
  },
];

export default function SceneFeatures() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '0 6vw' }}
    >
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
          color: '#7c3aed',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}
      >
        MORE FEATURES
      </motion.div>

      {/* Headline */}
      <div style={{ overflow: 'hidden', marginBottom: '2.5rem' }}>
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
          Everything your health<br />
          <span style={{ background: 'linear-gradient(90deg, #7c3aed, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            journey needs.
          </span>
        </motion.div>
      </div>

      {/* Feature cards */}
      <div style={{ display: 'flex', gap: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ y: 60, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{
              delay: 0.7 + i * 0.2,
              duration: 0.7,
              type: 'spring',
              stiffness: 260,
              damping: 22,
            }}
            style={{
              flex: 1,
              borderRadius: '16px',
              background: 'rgba(13,21,48,0.9)',
              border: `1px solid ${f.color}28`,
              padding: 'clamp(1rem, 2.5vh, 1.6rem) clamp(0.75rem, 2vw, 1.4rem)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Corner glow */}
            <div style={{
              position: 'absolute',
              top: '-30%',
              right: '-20%',
              width: '60%',
              height: '60%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${f.glow} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            <div style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
              marginBottom: '0.75rem',
            }}>
              {f.icon}
            </div>
            <div style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(0.9rem, 1.8vw, 1.2rem)',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '0.5rem',
              lineHeight: 1.2,
            }}>
              {f.title}
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.65rem, 1.2vw, 0.85rem)',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.5,
            }}>
              {f.desc}
            </div>

            {/* Bottom accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.2 + i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
                transformOrigin: 'left',
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
