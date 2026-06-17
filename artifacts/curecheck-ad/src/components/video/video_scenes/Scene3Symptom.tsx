import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CureCheckMark } from '@/components/logo';

const SYMPTOMS = [
  { label: 'Fever 102°F', urgency: 'monitor', icon: '🌡️' },
  { label: 'Chest tightness', urgency: 'urgent', icon: '💔' },
  { label: 'Mild headache', urgency: 'mild', icon: '🤕' },
  { label: 'Nausea + dizziness', urgency: 'monitor', icon: '😵' },
];

const URGENCY_CONFIG = {
  mild:    { label: 'Mild — Rest at home',       color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)'  },
  monitor: { label: 'Monitor — Watch for 24h',   color: '#eab308', bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.3)'  },
  urgent:  { label: 'See Doctor — Don\'t delay', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'  },
};

// Simple body silhouette SVG paths
function BodyDiagram({ visibleDots }: { visibleDots: number }) {
  const dots = [
    { cx: 50, cy: 18, urgency: 'mild',    label: 'Head' },
    { cx: 50, cy: 35, urgency: 'urgent',  label: 'Chest' },
    { cx: 50, cy: 47, urgency: 'monitor', label: 'Abdomen' },
    { cx: 50, cy: 60, urgency: 'monitor', label: 'Lower' },
  ];
  const colors = { mild: '#22c55e', monitor: '#eab308', urgent: '#ef4444' };

  return (
    <svg viewBox="0 0 100 90" style={{ width: '100%', height: '100%' }}>
      {/* Body silhouette — very simple */}
      {/* Head */}
      <ellipse cx="50" cy="12" rx="8" ry="9" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* Neck */}
      <rect x="47" y="20" width="6" height="5" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      {/* Torso */}
      <path d="M36,25 Q28,28 27,40 L28,58 Q33,62 50,63 Q67,62 72,58 L73,40 Q72,28 64,25 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* Arms */}
      <path d="M36,26 Q28,32 25,45 Q24,50 26,53 Q28,55 30,53 Q33,45 37,38 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <path d="M64,26 Q72,32 75,45 Q76,50 74,53 Q72,55 70,53 Q67,45 63,38 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      {/* Legs */}
      <path d="M40,63 Q38,72 37,82 Q37,87 40,87 Q44,87 45,82 L47,63 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <path d="M60,63 Q62,72 63,82 Q63,87 60,87 Q56,87 55,82 L53,63 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />

      {/* Urgency dots */}
      {dots.slice(0, visibleDots).map((dot, i) => (
        <g key={i}>
          <motion.circle
            cx={dot.cx} cy={dot.cy} r="4"
            fill={`${colors[dot.urgency as keyof typeof colors]}33`}
            stroke={colors[dot.urgency as keyof typeof colors]}
            strokeWidth="1.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.3, duration: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
          />
          {/* Pulse ring */}
          <motion.circle
            cx={dot.cx} cy={dot.cy} r="4"
            fill="none"
            stroke={colors[dot.urgency as keyof typeof colors]}
            strokeWidth="1"
            initial={{ r: 4, opacity: 0.7 }}
            animate={{ r: [4, 9], opacity: [0.5, 0] }}
            transition={{ delay: i * 0.3 + 0.3, duration: 1.0, repeat: Infinity, repeatDelay: 1.5 }}
          />
        </g>
      ))}
    </svg>
  );
}

export default function Scene3Symptom() {
  const [phase, setPhase] = useState(0); // 0=logo, 1=body, 2=symptoms, 3=result
  const [visibleDots, setVisibleDots] = useState(0);
  const [visibleSymptoms, setVisibleSymptoms] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => { setVisibleDots(1); }, 1800),
      setTimeout(() => { setVisibleDots(2); }, 2100),
      setTimeout(() => { setVisibleDots(3); }, 2400),
      setTimeout(() => { setVisibleDots(4); }, 2700),
      setTimeout(() => { setVisibleSymptoms(1); }, 2000),
      setTimeout(() => { setVisibleSymptoms(2); }, 2500),
      setTimeout(() => { setVisibleSymptoms(3); }, 3000),
      setTimeout(() => { setVisibleSymptoms(4); }, 3500),
      setTimeout(() => setPhase(3), 4500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Background brightens gradually
  const bgColor = phase >= 2 ? 'rgba(0,212,255,0.04)' : 'transparent';

  return (
    <motion.div
      className="absolute inset-0 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ background: '#060d1f', padding: '5% 6%' }}
    >
      {/* Brightening background gradient */}
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{ background: [
          'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,212,255,0.0) 0%, transparent 100%)',
          'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,212,255,0.06) 0%, transparent 70%)',
        ]}}
        transition={{ delay: 1.5, duration: 2.0, ease: 'easeInOut' }}
      />

      {/* Logo + title row */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', alignItems: 'center', gap: '3%', marginBottom: '4%', position: 'relative', zIndex: 2 }}
      >
        <div style={{ filter: 'drop-shadow(0 0 12px rgba(0,212,255,0.4))' }}>
          <CureCheckMark size={32} id="s3-logo" />
        </div>
        <div>
          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(0.9rem,3.8vw,1.4rem)', fontWeight: 800, color: '#fff' }}>CureCheck</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.5rem,2vw,0.7rem)', color: 'rgba(0,212,255,0.7)', fontWeight: 500, marginTop: 1 }}>Symptom Checker</div>
        </div>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            marginLeft: 'auto', padding: '2% 4%', borderRadius: 999,
            background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)',
            fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.5rem,1.9vw,0.68rem)',
            color: '#00d4ff', fontWeight: 600,
          }}
        >
          AI Powered
        </motion.div>
      </motion.div>

      {/* Main content: body + symptoms side by side */}
      <div style={{ flex: 1, display: 'flex', gap: '4%', position: 'relative', zIndex: 2, minHeight: 0 }}>

        {/* Body diagram */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: phase >= 1 ? 1 : 0, x: phase >= 1 ? 0 : -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '35%', flexShrink: 0 }}
        >
          <BodyDiagram visibleDots={visibleDots} />
        </motion.div>

        {/* Symptom list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4%', justifyContent: 'center' }}>
          {SYMPTOMS.slice(0, visibleSymptoms).map((s, i) => {
            const cfg = URGENCY_CONFIG[s.urgency as keyof typeof URGENCY_CONFIG];
            return (
              <motion.div
                key={i}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: '3.5% 4%', borderRadius: 10,
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                  display: 'flex', alignItems: 'center', gap: '10%',
                }}
              >
                <span style={{ fontSize: 'clamp(0.9rem,3.5vw,1.3rem)', flexShrink: 0 }}>{s.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(0.62rem,2.5vw,0.9rem)', fontWeight: 700, color: '#fff' }}>{s.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: '8%' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.48rem,1.9vw,0.65rem)', color: cfg.color, fontWeight: 600 }}>{cfg.label}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Final result card */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              marginTop: '4%', padding: '4% 5%', borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(124,58,237,0.08) 100%)',
              border: '1px solid rgba(0,212,255,0.25)',
              position: 'relative', zIndex: 2,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(0.75rem,3vw,1.05rem)', fontWeight: 800, color: '#fff' }}>AI Assessment</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.55rem,2.2vw,0.75rem)', color: 'rgba(255,255,255,0.65)', marginTop: '4%', lineHeight: 1.4 }}>
                  Chest tightness needs same-day attention. Other symptoms manageable.
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  padding: '4% 6%', borderRadius: 8,
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                  fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(0.6rem,2.3vw,0.8rem)',
                  fontWeight: 800, color: '#ef4444', whiteSpace: 'nowrap', marginLeft: '5%', flexShrink: 0,
                }}
              >
                See Doctor
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
