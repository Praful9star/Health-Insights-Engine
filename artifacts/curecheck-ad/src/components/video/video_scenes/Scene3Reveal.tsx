import { motion } from 'framer-motion';
import { CureCheckMark } from '@/components/logo';
import { useState, useEffect } from 'react';

const WORDMARK = 'CureCheck';

export default function Scene3Reveal() {
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    if (visibleChars >= WORDMARK.length) return;
    const t = setTimeout(() => setVisibleChars(v => v + 1), visibleChars < 4 ? 90 : 70);
    return () => clearTimeout(t);
  }, [visibleChars]);

  useEffect(() => {
    const t = setTimeout(() => setVisibleChars(1), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: 'center', padding: '0 8%' }}
    >
      {/* Giant glow pulse */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '120%', height: '120%',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, rgba(124,58,237,0.06) 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8] }}
        transition={{ delay: 0.3, duration: 1.4, ease: 'easeOut' }}
      />

      {/* Concentric ring pulses */}
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="absolute rounded-full" style={{
          border: '1px solid rgba(0,212,255,0.25)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
          initial={{ width: '20%', height: '20%', opacity: 0.8 }}
          animate={{ width: ['20%', '90%'], height: ['20%', '90%'], opacity: [0.6, 0] }}
          transition={{ delay: 0.4 + i * 0.45, duration: 1.4, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.9 }}
        />
      ))}

      {/* Shield logo */}
      <motion.div
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.9, type: 'spring', stiffness: 240, damping: 18 }}
        style={{
          position: 'relative', zIndex: 2, marginBottom: '6%',
          filter: 'drop-shadow(0 0 28px rgba(0,212,255,0.55)) drop-shadow(0 0 60px rgba(0,212,255,0.25))',
        }}
      >
        <CureCheckMark size={88} id="reveal-logo" />
      </motion.div>

      {/* ECG pulse under logo */}
      <svg style={{ width: '70%', height: 28, marginBottom: '4%', opacity: 0.5 }} viewBox="0 0 300 28" preserveAspectRatio="none">
        <motion.path
          d="M0,14 L55,14 L70,3 L84,25 L98,7 L112,22 L122,14 L180,14 L195,3 L209,25 L223,7 L237,22 L247,14 L300,14"
          stroke="#00d4ff" strokeWidth="2.5" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 1.0, ease: 'easeInOut' }}
        />
      </svg>

      {/* Wordmark typewriter */}
      <div style={{ position: 'relative', zIndex: 2, marginBottom: '4%', height: 'clamp(3rem,12vw,5.5rem)' }}>
        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontSize: 'clamp(2.8rem,11vw,5rem)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #ffffff 0%, rgba(0,212,255,0.9) 60%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          letterSpacing: '-0.025em', lineHeight: 1,
          display: 'inline-block',
        }}>
          {WORDMARK.slice(0, visibleChars)}
          {visibleChars < WORDMARK.length && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.45, repeat: Infinity }}
              style={{ color: '#00d4ff', WebkitTextFillColor: '#00d4ff' }}
            >|</motion.span>
          )}
        </div>
      </div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.0, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative', zIndex: 2,
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(0.8rem,3.2vw,1.2rem)',
          fontWeight: 500, color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.4, maxWidth: '80%',
          margin: '0 auto',
        }}
      >
        Healthcare Information<br />
        <span style={{ color: '#00d4ff', fontWeight: 600 }}>You Can Actually Understand</span>
      </motion.div>

      {/* "Free · India · AI Powered" pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 4.5, duration: 0.6 }}
        style={{ display: 'flex', gap: '3%', marginTop: '6%', position: 'relative', zIndex: 2 }}
      >
        {['100% Free', 'Made for India', 'AI Powered'].map((label, i) => (
          <motion.div key={label}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 4.6 + i * 0.15, type: 'spring', stiffness: 320, damping: 22 }}
            style={{
              padding: '2% 4%', borderRadius: 999,
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.3)',
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.55rem,2.2vw,0.75rem)',
              fontWeight: 600, color: '#00d4ff',
              whiteSpace: 'nowrap',
            }}
          >{label}</motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
