import { motion } from 'framer-motion';
import { CureCheckMark } from '@/components/logo';

export default function Scene4CTA() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: 'center', padding: '0 8%' }}
    >
      {/* Background — bright, clean, calm */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(0,212,255,0.1) 0%, rgba(124,58,237,0.06) 50%, transparent 80%)',
      }} />
      {/* Grid */}
      <div className="absolute inset-0" style={{
        opacity: 0.025,
        backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }} />

      {/* Rings */}
      {[0, 1].map(i => (
        <motion.div key={i} className="absolute rounded-full" style={{
          border: '1px solid rgba(0,212,255,0.12)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
          animate={{ width: ['25%', '100%'], height: ['25%', '100%'], opacity: [0.5, 0] }}
          transition={{ delay: 0.3 + i * 0.6, duration: 1.8, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.5 }}
        />
      ))}

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.7, type: 'spring', stiffness: 240, damping: 18 }}
        style={{ position: 'relative', zIndex: 2, marginBottom: '5%', filter: 'drop-shadow(0 0 24px rgba(0,212,255,0.5))' }}
      >
        <CureCheckMark size={72} id="cta2-logo" />
      </motion.div>

      {/* "Know before you panic" */}
      <div style={{ overflow: 'hidden', position: 'relative', zIndex: 2, marginBottom: '3%' }}>
        <motion.div
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 'clamp(1.6rem,6.8vw,2.8rem)',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Know before
        </motion.div>
      </div>
      <div style={{ overflow: 'hidden', position: 'relative', zIndex: 2, marginBottom: '6%' }}>
        <motion.div
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          transition={{ delay: 0.68, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 'clamp(1.6rem,6.8vw,2.8rem)',
            fontWeight: 900,
            background: 'linear-gradient(90deg, #00d4ff 0%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          you panic.
        </motion.div>
      </div>

      {/* URL — the hero element */}
      <motion.div
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, duration: 0.6, type: 'spring', stiffness: 280, damping: 22 }}
        style={{ position: 'relative', zIndex: 2, marginBottom: '5%' }}
      >
        <motion.div
          animate={{ boxShadow: [
            '0 0 0px rgba(0,212,255,0)',
            '0 0 30px rgba(0,212,255,0.35)',
            '0 0 0px rgba(0,212,255,0)',
          ]}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            padding: '3.5% 9%', borderRadius: 999,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(124,58,237,0.12) 100%)',
            border: '1.5px solid rgba(0,212,255,0.5)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 'clamp(1.5rem,6.2vw,2.4rem)',
            fontWeight: 900,
            color: '#00d4ff',
            letterSpacing: '0.01em',
          }}>
            curecheck.in
          </div>
        </motion.div>
      </motion.div>

      {/* Subline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.5 }}
        style={{
          position: 'relative', zIndex: 2,
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(0.65rem,2.6vw,0.9rem)',
          color: 'rgba(255,255,255,0.5)',
          fontWeight: 400,
          letterSpacing: '0.02em',
        }}
      >
        Free · No signup · Hindi + English
      </motion.div>

      {/* ECG bottom */}
      <svg style={{ position: 'absolute', bottom: '3%', left: 0, right: 0, width: '100%', height: 20, opacity: 0.15 }} viewBox="0 0 400 20" preserveAspectRatio="none">
        <motion.path
          d="M0,10 L80,10 L92,2 L104,18 L116,4 L128,17 L136,10 L220,10 L232,2 L244,18 L256,4 L268,17 L276,10 L400,10"
          stroke="#00d4ff" strokeWidth="2" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: 0.8, duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
        />
      </svg>
    </motion.div>
  );
}
