import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

function AnimatedScore({ target, delay }: { target: number; delay: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const startedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!startedRef.current) {
        startedRef.current = true;
        animate(count, target, { duration: 1.5, ease: 'easeOut' });
      }
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [count, target, delay]);

  return <motion.span>{rounded}</motion.span>;
}

export default function SceneClaimChecker() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '0 6vw' }}
    >
      <div style={{ width: '100%', maxWidth: '800px' }}>
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
          CLAIM CHECKER
        </motion.div>

        {/* Headline */}
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
            Fact-check any health claim<br />
            <span style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              instantly.
            </span>
          </motion.div>
        </div>

        {/* WhatsApp bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            borderRadius: '16px 16px 16px 4px',
            background: '#1f2f1f',
            border: '1px solid rgba(37,211,102,0.25)',
            padding: '1rem 1.4rem',
            marginBottom: '1.5rem',
            position: 'relative',
            maxWidth: '85%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#25d366' }} />
            <span style={{ fontFamily: 'Inter', fontSize: 'clamp(0.6rem, 1vw, 0.75rem)', color: '#25d366', fontWeight: 600 }}>WhatsApp Forward</span>
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.85rem, 1.7vw, 1.1rem)',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.5,
            fontStyle: 'italic',
          }}>
            "🌿 URGENT!! Drinking raw neem juice every morning CURES diabetes permanently!!! Share with family before doctors hide this!!"
          </div>
        </motion.div>

        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            borderRadius: '16px',
            background: 'rgba(13,21,48,0.85)',
            border: '1px solid rgba(239,68,68,0.2)',
            padding: 'clamp(1rem, 2.5vh, 1.6rem) clamp(1rem, 3vw, 2rem)',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          {/* Score circle */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width="clamp(70px,10vw,100px)" height="clamp(70px,10vw,100px)" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#ef4444"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="263.9"
                strokeDashoffset={263.9}
                animate={{ strokeDashoffset: 263.9 - (263.9 * 22 / 100) }}
                transition={{ delay: 1.8, duration: 1.5, ease: 'easeOut' }}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)',
              color: '#ef4444',
            }}>
              <AnimatedScore target={22} delay={1.8} />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0, duration: 0.5 }}
              style={{
                display: 'inline-block',
                padding: '0.3rem 0.9rem',
                borderRadius: '999px',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: '#ef4444',
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(0.65rem, 1.2vw, 0.85rem)',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              MISLEADING
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.3, duration: 0.5 }}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(0.75rem, 1.4vw, 0.95rem)',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.5,
              }}
            >
              Neem may help with blood sugar management but cannot cure diabetes. No peer-reviewed evidence supports this claim. Always consult your doctor.
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
