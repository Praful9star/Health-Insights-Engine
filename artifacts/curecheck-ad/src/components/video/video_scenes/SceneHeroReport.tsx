import { motion } from 'framer-motion';

const reportLines = [
  { label: 'HAEMOGLOBIN', value: '11.2 g/dL', status: 'Low', color: '#f59e0b', icon: '⚠' },
  { label: 'PLATELETS', value: '148 ×10³/μL', status: 'Normal', color: '#10b981', icon: '✓' },
  { label: 'TSH (THYROID)', value: '6.8 mIU/L', status: 'High', color: '#ef4444', icon: '✗' },
  { label: 'BLOOD GLUCOSE', value: '87 mg/dL', status: 'Normal', color: '#10b981', icon: '✓' },
];

export default function SceneHeroReport() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.6 }}
      style={{ padding: '0 6vw' }}
    >
      <div style={{ width: '100%', maxWidth: '900px' }}>
        {/* Scene label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.65rem, 1.1vw, 0.85rem)',
            fontWeight: 600,
            letterSpacing: '0.3em',
            color: '#00d4ff',
            textTransform: 'uppercase',
            marginBottom: '1.2rem',
          }}
        >
          REPORT EXPLAINER
        </motion.div>

        {/* Title */}
        <div style={{ overflow: 'hidden', marginBottom: '2rem' }}>
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(1.8rem, 4.5vw, 3.5rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
            }}
          >
            Your lab report,<br />
            <span style={{ background: 'linear-gradient(90deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              explained simply.
            </span>
          </motion.div>
        </div>

        {/* Report card with scan animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            borderRadius: '16px',
            background: 'rgba(13,21,48,0.85)',
            border: '1px solid rgba(0,212,255,0.18)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Scan line animation */}
          <motion.div
            initial={{ top: '0%', opacity: 0.9 }}
            animate={{ top: '100%', opacity: 0 }}
            transition={{ delay: 1.2, duration: 1.4, ease: 'linear' }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
              boxShadow: '0 0 12px 4px rgba(0,212,255,0.4)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />

          {/* Report rows */}
          <div style={{ padding: '0.5rem 0' }}>
            {reportLines.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 + i * 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'clamp(0.6rem, 1.5vh, 1rem) clamp(1rem, 3vw, 2rem)',
                  borderBottom: i < reportLines.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.55)',
                  letterSpacing: '0.05em',
                }}>
                  {row.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(0.8rem, 1.6vw, 1.05rem)',
                    fontWeight: 600,
                    color: '#ffffff',
                  }}>
                    {row.value}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '999px',
                    background: `${row.color}18`,
                    border: `1px solid ${row.color}40`,
                    color: row.color,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(0.65rem, 1.2vw, 0.85rem)',
                    fontWeight: 600,
                    minWidth: '90px',
                    justifyContent: 'center',
                  }}>
                    <span>{row.icon}</span>
                    <span>{row.status}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI explanation strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.0, duration: 0.6 }}
            style={{
              padding: 'clamp(0.75rem, 1.8vh, 1.2rem) clamp(1rem, 3vw, 2rem)',
              borderTop: '1px solid rgba(0,212,255,0.12)',
              background: 'rgba(0,212,255,0.04)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00d4ff22, #7c3aed22)',
              border: '1px solid rgba(0,212,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              flexShrink: 0,
            }}>
              ✦
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.7rem, 1.3vw, 0.9rem)',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.5,
            }}>
              <span style={{ color: '#00d4ff', fontWeight: 600 }}>AI Insight: </span>
              Your haemoglobin is slightly below normal — common in women. Your TSH is elevated, suggesting the thyroid may need attention. Ask your doctor about a follow-up panel.
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
