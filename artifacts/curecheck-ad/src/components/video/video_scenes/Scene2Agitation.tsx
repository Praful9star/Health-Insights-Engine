import { motion } from 'framer-motion';

const pains = [
  {
    icon: '🔍',
    bold: 'Google kiya, aur dar gaye',
    sub: 'Self-diagnosis spiral — 10 tabs, 10 diseases.',
    color: '#f97316',
    delay: 0.15,
  },
  {
    icon: '📲',
    bold: 'WhatsApp pe ek myth aaya',
    sub: '"Sach hai ya jhooth?" — koi nahi batata.',
    color: '#eab308',
    delay: 0.9,
  },
  {
    icon: '🩺',
    bold: 'Doctor 2 minute mein gaye',
    sub: 'Prescription toh mili, samajh nahi aaya.',
    color: '#ef4444',
    delay: 1.65,
  },
];

export default function Scene2Agitation() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-center"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ padding: '0 6%' }}
    >
      {/* Label */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(0.6rem,2.2vw,0.8rem)',
          fontWeight: 700,
          letterSpacing: '0.28em',
          color: '#ef4444',
          textTransform: 'uppercase',
          marginBottom: '6%',
        }}
      >
        SOUNDS FAMILIAR?
      </motion.div>

      {/* Pain point cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4%' }}>
        {pains.map((p, i) => (
          <motion.div
            key={i}
            initial={{ x: -90, opacity: 0, scale: 0.92 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ delay: p.delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex', alignItems: 'center', gap: '4%',
              padding: '4% 5%', borderRadius: 14,
              background: `rgba(${p.color === '#f97316' ? '249,115,22' : p.color === '#eab308' ? '234,179,8' : '239,68,68'},0.08)`,
              border: `1px solid ${p.color}33`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ delay: p.delay + 0.4, duration: 0.5 }}
              style={{ fontSize: 'clamp(1.8rem,7vw,2.6rem)', flexShrink: 0 }}
            >
              {p.icon}
            </motion.div>
            <div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(1rem,4vw,1.55rem)',
                fontWeight: 800, color: '#fff', lineHeight: 1.2,
              }}>
                {p.bold} 😤
              </div>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(0.65rem,2.5vw,0.9rem)',
                color: 'rgba(255,255,255,0.65)', marginTop: '3%', lineHeight: 1.35,
              }}>
                {p.sub}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transition hook */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginTop: '7%', display: 'flex', alignItems: 'center', gap: '3%' }}
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 3.3, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: 2, width: '15%', background: '#00d4ff', transformOrigin: 'left', flexShrink: 0 }}
        />
        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontSize: 'clamp(1.1rem,4.5vw,1.7rem)', fontWeight: 700,
          background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Ab badlega — CureCheck se.
        </div>
      </motion.div>

      {/* ECG line decoration */}
      <svg style={{ position: 'absolute', bottom: '4%', left: 0, right: 0, width: '100%', height: 30, opacity: 0.18 }} viewBox="0 0 400 30" preserveAspectRatio="none">
        <motion.path
          d="M0,15 L60,15 L75,2 L90,28 L105,5 L120,25 L130,15 L200,15 L215,2 L230,28 L245,5 L260,25 L270,15 L400,15"
          stroke="#00d4ff" strokeWidth="2" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
        />
      </svg>
    </motion.div>
  );
}
