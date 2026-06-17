import { motion } from 'framer-motion';

const badges = [
  { icon: '🆓', title: '100% Free', sub: 'Koi hidden charge nahi', color: '#22c55e', delay: 0.3 },
  { icon: '🚫', title: 'No Signup Needed', sub: 'Seedha use karo, no account', color: '#00d4ff', delay: 0.9 },
  { icon: '🇮🇳', title: 'Hindi + English', sub: 'Apni bhasha mein samjho', color: '#f97316', delay: 1.5 },
  { icon: '❤️', title: 'Built for India', sub: 'Indian health context — always', color: '#f472b6', delay: 2.1 },
];

export default function Scene5Trust() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '6% 6%' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', marginBottom: '8%' }}
      >
        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.6rem,2.2vw,0.8rem)',
          fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase', marginBottom: '3%',
        }}>
          WHY CURECHECK
        </div>
        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontSize: 'clamp(1.6rem,6.5vw,2.8rem)', fontWeight: 800,
          color: '#fff', lineHeight: 1.15,
        }}>
          Sab kuch jo<br />
          <span style={{
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>chahiye tha aapko</span>
        </div>
      </motion.div>

      {/* Badges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4%' }}>
        {badges.map((b, i) => (
          <motion.div
            key={i}
            initial={{ x: i % 2 === 0 ? -80 : 80, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ delay: b.delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex', alignItems: 'center', gap: '5%',
              padding: '4.5% 5%', borderRadius: 14,
              background: `rgba(${b.color === '#22c55e' ? '34,197,94' : b.color === '#00d4ff' ? '0,212,255' : b.color === '#f97316' ? '249,115,22' : '244,114,182'},0.07)`,
              border: `1px solid ${b.color}33`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ delay: b.delay + 0.3, duration: 0.5 }}
              style={{ fontSize: 'clamp(1.6rem,6.5vw,2.4rem)', flexShrink: 0 }}
            >
              {b.icon}
            </motion.div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(1rem,4vw,1.5rem)', fontWeight: 800,
                color: b.color, lineHeight: 1.1,
              }}>
                {b.title}
              </div>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(0.6rem,2.4vw,0.85rem)',
                color: 'rgba(255,255,255,0.6)', marginTop: '3%',
              }}>
                {b.sub}
              </div>
            </div>
            {/* Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: b.delay + 0.4, type: 'spring', stiffness: 360, damping: 20 }}
              style={{
                width: 'clamp(20px,6vw,28px)', height: 'clamp(20px,6vw,28px)',
                borderRadius: '50%', background: `${b.color}22`,
                border: `2px solid ${b.color}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'clamp(0.6rem,2.5vw,0.85rem)', flexShrink: 0,
              }}
            >✓</motion.div>
          </motion.div>
        ))}
      </div>

      {/* Bottom stat bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 4.0, duration: 0.6 }}
        style={{ marginTop: '6%', display: 'flex', justifyContent: 'space-around', padding: '4% 5%', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {[
          { val: '7+', label: 'AI Features' },
          { val: '0₹', label: 'Cost' },
          { val: '2', label: 'Languages' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(1.2rem,5vw,2rem)', fontWeight: 900, color: '#00d4ff' }}>{s.val}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.55rem,2.1vw,0.75rem)', color: 'rgba(255,255,255,0.5)', marginTop: '3%' }}>{s.label}</div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
