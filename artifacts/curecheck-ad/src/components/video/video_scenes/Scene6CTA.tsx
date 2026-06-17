import { motion } from 'framer-motion';
import { CureCheckMark } from '@/components/logo';

export default function Scene6CTA() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{ textAlign: 'center', padding: '0 8%' }}
    >
      {/* Giant pulsing glow */}
      <motion.div className="absolute rounded-full" style={{
        width: '140%', height: '140%', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(0,212,255,0.09) 0%, rgba(124,58,237,0.05) 40%, transparent 70%)',
        pointerEvents: 'none',
      }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.9, type: 'spring', stiffness: 220, damping: 18 }}
        style={{ position: 'relative', zIndex: 2, marginBottom: '5%', filter: 'drop-shadow(0 0 32px rgba(0,212,255,0.5)) drop-shadow(0 0 70px rgba(0,212,255,0.2))' }}
      >
        <CureCheckMark size={96} id="cta-logo" />
      </motion.div>

      {/* Brand name */}
      <div style={{ overflow: 'hidden', position: 'relative', zIndex: 2, marginBottom: '3%' }}>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ delay: 0.75, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 'clamp(2.8rem,11vw,5rem)', fontWeight: 900,
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(0,212,255,0.85) 60%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            letterSpacing: '-0.025em',
          }}
        >
          CureCheck
        </motion.div>
      </div>

      {/* URL pill — the CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, duration: 0.6, type: 'spring', stiffness: 300, damping: 22 }}
        style={{
          position: 'relative', zIndex: 2, marginBottom: '6%',
          padding: '3% 8%', borderRadius: 999,
          background: 'linear-gradient(135deg, rgba(0,212,255,0.18) 0%, rgba(124,58,237,0.14) 100%)',
          border: '1.5px solid rgba(0,212,255,0.45)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <motion.div
          animate={{ textShadow: ['0 0 8px rgba(0,212,255,0.4)', '0 0 20px rgba(0,212,255,0.8)', '0 0 8px rgba(0,212,255,0.4)'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 'clamp(1.3rem,5.5vw,2.2rem)', fontWeight: 800,
            color: '#00d4ff', letterSpacing: '0.01em',
          }}
        >
          curecheck.in
        </motion.div>
      </motion.div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 2, marginBottom: '8%' }}
      >
        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontSize: 'clamp(1.1rem,4.5vw,1.9rem)', fontWeight: 700,
          color: '#fff', lineHeight: 1.3,
        }}>
          Apni health, finally
        </div>
        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontSize: 'clamp(1.1rem,4.5vw,1.9rem)', fontWeight: 800,
          background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          samajh mein aayegi. ✨
        </div>
      </motion.div>

      {/* Arrow CTA button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.8, duration: 0.6 }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            display: 'flex', alignItems: 'center', gap: '3%', justifyContent: 'center',
            padding: '3.5% 9%', borderRadius: 999,
            background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 'clamp(0.85rem,3.5vw,1.3rem)', fontWeight: 800,
            color: '#fff', letterSpacing: '0.02em',
            boxShadow: '0 8px 30px rgba(0,212,255,0.35)',
            cursor: 'pointer',
          }}
        >
          Visit curecheck.in →
        </motion.div>
      </motion.div>

      {/* ECG line bottom decoration */}
      <svg style={{ position: 'absolute', bottom: '3%', left: 0, right: 0, width: '100%', height: 24, opacity: 0.2 }} viewBox="0 0 400 24" preserveAspectRatio="none">
        <motion.path
          d="M0,12 L70,12 L85,2 L98,22 L111,5 L124,20 L134,12 L210,12 L225,2 L238,22 L251,5 L264,20 L274,12 L400,12"
          stroke="#00d4ff" strokeWidth="2" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: 1.0, duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.5 }}
        />
      </svg>

      {/* Final freeze-frame fade — subtle vignette for thumbnail */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(6,13,31,0.65) 100%)', zIndex: 1 }}
      />

      {/* Fade to dark at very end */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: '#060d1f', zIndex: 30 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 8.5, duration: 1.5 }}
      />
    </motion.div>
  );
}
