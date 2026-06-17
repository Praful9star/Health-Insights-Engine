import { motion } from 'framer-motion';

const reportLines = [
  { label: 'Hemoglobin', value: '7.2 g/dL', tag: 'LOW ↓' },
  { label: 'Blood Glucose', value: '312 mg/dL', tag: 'HIGH ↑' },
  { label: 'TSH', value: '8.9 mIU/L', tag: 'HIGH ↑' },
  { label: 'Cholesterol', value: '248 mg/dL', tag: 'HIGH ↑' },
  { label: 'Platelets', value: '1,42,000', tag: 'LOW ↓' },
  { label: 'Creatinine', value: '2.1 mg/dL', tag: 'HIGH ↑' },
];

export default function Scene1Hook() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
    >
      {/* Blurred lab report bg */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-center"
        initial={{ scale: 1.6, opacity: 0 }}
        animate={{ scale: 1.05, opacity: 0.13 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ padding: '12% 8%', filter: 'blur(3px)' }}
      >
        <div style={{ fontFamily: 'Inter, monospace', fontSize: 'clamp(0.6rem,2.5vw,0.85rem)', color: '#fff', marginBottom: '6%', opacity: 0.6, letterSpacing: '0.1em' }}>
          PATHOLOGY REPORT — BLOOD TEST
        </div>
        {reportLines.map((line, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '2.5% 0', borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.55rem,2.2vw,0.8rem)' }}>{line.label}</span>
            <span style={{ color: '#ef4444', fontWeight: 800, fontFamily: 'Inter, monospace', fontSize: 'clamp(0.55rem,2.2vw,0.8rem)' }}>{line.value} &nbsp;<span style={{ background: '#ef4444', color: '#fff', borderRadius: 3, padding: '1px 5px', fontSize: '0.75em' }}>{line.tag}</span></span>
          </div>
        ))}
      </motion.div>

      {/* Red scan line sweep */}
      <motion.div
        className="absolute left-0 right-0"
        style={{ height: 2, background: 'linear-gradient(90deg, transparent, #ef4444, transparent)', zIndex: 5 }}
        initial={{ top: '-2px', opacity: 0 }}
        animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
        transition={{ delay: 0.1, duration: 0.7, ease: 'linear' }}
      />

      {/* Main text */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 8%' }}>
        <div style={{ overflow: 'hidden', marginBottom: '2%' }}>
          <motion.div
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ delay: 0.05, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(1.5rem,6.5vw,3rem)',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1.1,
            }}
          >
            Blood report mein
          </motion.div>
        </div>

        <motion.div
          initial={{ scale: 4, opacity: 0, rotateZ: -5 }}
          animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
          transition={{ delay: 0.35, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 'clamp(3rem,12vw,5.5rem)',
            fontWeight: 900,
            color: '#ef4444',
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            textShadow: '0 0 40px rgba(239,68,68,0.7), 0 0 80px rgba(239,68,68,0.3)',
            marginBottom: '2%',
          }}
        >
          "HIGH"
        </motion.div>

        <div style={{ overflow: 'hidden', marginBottom: '2%' }}>
          <motion.div
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ delay: 0.62, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(1.5rem,6.5vw,3rem)',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1.1,
            }}
          >
            likha dekh ke
          </motion.div>
        </div>

        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.5, type: 'spring', stiffness: 280, damping: 14 }}
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 'clamp(2.2rem,9vw,4.2rem)',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #fbbf24 0%, #ef4444 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
          }}
        >
          dar gaye? 😨
        </motion.div>
      </div>

      {/* Floating red question marks */}
      {[
        { size: '2.2rem', top: '12%', right: '7%', delay: 0.7 },
        { size: '3rem',   top: '28%', left: '4%',  delay: 1.0 },
        { size: '1.8rem', top: '62%', right: '5%', delay: 1.2 },
      ].map((q, i) => (
        <motion.div key={i} style={{
          position: 'absolute', color: 'rgba(239,68,68,0.55)',
          fontSize: q.size, fontWeight: 900, top: q.top,
          ...(q.right ? { right: q.right } : { left: q.left }),
        }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.6, 1], scale: [0, 1.3, 1] }}
          transition={{ delay: q.delay, duration: 0.6, repeat: Infinity, repeatDelay: 1.2 }}
        >
          ?
        </motion.div>
      ))}

      {/* Caption bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        style={{
          position: 'absolute', bottom: '6%', left: '6%', right: '6%',
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          borderRadius: 10, padding: '3% 5%', textAlign: 'center',
          border: '1px solid rgba(239,68,68,0.2)',
        }}
      >
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.65rem,2.5vw,0.9rem)', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
          You're not alone. 1 in 3 Indians can't read their own lab report.
        </div>
      </motion.div>
    </motion.div>
  );
}
