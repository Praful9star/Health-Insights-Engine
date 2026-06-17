import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const FEATURE_DURATION = 3800;

const features = [
  {
    id: 'report',
    label: '🔬 Report Explainer',
    title: 'Lab report ka matlab samjho',
    color: '#00d4ff',
    content: <ReportCard />,
  },
  {
    id: 'symptom',
    label: '🩺 Symptom Checker',
    title: 'Symptoms check karo — instantly',
    color: '#22d3ee',
    content: <SymptomCard />,
  },
  {
    id: 'myth',
    label: '🛡️ Myth Buster',
    title: 'WhatsApp myths ka sach',
    color: '#a78bfa',
    content: <MythCard />,
  },
  {
    id: 'medicine',
    label: '💊 Medicine Explainer',
    title: 'Apni dawa samjho',
    color: '#34d399',
    content: <MedicineCard />,
  },
  {
    id: 'fitness',
    label: '💪 Fitness Hub',
    title: 'Health goals track karo',
    color: '#f472b6',
    content: <FitnessCard />,
  },
];

function ReportCard() {
  const params = [
    { name: 'Hemoglobin', val: '10.2 g/dL', from: 'red', to: 'green', delay: 0.5 },
    { name: 'Blood Sugar', val: '312 mg/dL', from: 'red', to: 'green', delay: 0.9 },
    { name: 'TSH', val: '2.1 mIU/L', from: 'red', to: 'green', delay: 1.3 },
  ];
  const [done, setDone] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDone(true), 1600); return () => clearTimeout(t); }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8%' }}>
      {params.map((p, i) => (
        <motion.div key={i} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: p.delay, duration: 0.4 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4% 5%', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.6rem,2.5vw,0.82rem)', color: 'rgba(255,255,255,0.8)' }}>{p.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Inter, monospace', fontSize: 'clamp(0.6rem,2.5vw,0.82rem)', color: 'rgba(255,255,255,0.7)' }}>{p.val}</span>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: p.delay + 0.25, type: 'spring', stiffness: 350, damping: 18 }}
              style={{ width: 22, height: 22, borderRadius: '50%', background: done ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, transition: 'background 0.4s', transitionDelay: `${p.delay + 0.3}s` }}>
              {done ? '✓' : '!'}
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SymptomCard() {
  const symptoms = ['Vomiting 🤢', 'Stomach Pain 😣', 'Fever 🤒', 'Headache 🤕'];
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6%', marginBottom: '6%' }}>
        {symptoms.map((s, i) => (
          <motion.div key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 + i * 0.18, type: 'spring', stiffness: 340, damping: 20 }}
            style={{ padding: '3% 5%', borderRadius: 999, background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)', fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.55rem,2.2vw,0.75rem)', color: '#22d3ee', fontWeight: 600 }}>
            {s}
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.5 }}
        style={{ padding: '4% 5%', borderRadius: 10, background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)' }}>
        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(0.75rem,3vw,1.05rem)', fontWeight: 700, color: '#22d3ee' }}>AI Analysis 🤖</div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.6rem,2.3vw,0.8rem)', color: 'rgba(255,255,255,0.75)', marginTop: '3%', lineHeight: 1.4 }}>
          Likely: Gastroenteritis — Food poisoning possible. See doctor today.
        </div>
      </motion.div>
    </div>
  );
}

function MythCard() {
  const [busted, setBusted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBusted(true), 1400); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'relative' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{ padding: '5% 5%', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.62rem,2.5vw,0.85rem)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
        📲 <em>"Giloy juice roz piyo — COVID, cancer, sab theek ho jayega!"</em>
        <div style={{ marginTop: '3%', fontSize: '0.85em', color: 'rgba(255,255,255,0.45)' }}>— WhatsApp forward, 3:47 AM</div>
      </motion.div>
      <AnimatePresence>
        {busted && (
          <motion.div
            initial={{ scale: 3, opacity: 0, rotate: -15 }} animate={{ scale: 1, opacity: 1, rotate: -8 }} exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 16 }}
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ padding: '5% 10%', border: '4px solid #ef4444', borderRadius: 8, fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 900, fontSize: 'clamp(1.6rem,7vw,2.8rem)', color: '#ef4444', letterSpacing: '0.12em', textShadow: '0 0 20px rgba(239,68,68,0.5)', transform: 'rotate(-8deg)' }}>
              BUSTED
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: busted ? 1 : 0, y: busted ? 0 : 10 }} transition={{ duration: 0.4 }}
        style={{ marginTop: '5%', fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.6rem,2.3vw,0.8rem)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>
        ✅ Giloy may have mild immune support — but it does NOT cure cancer. Consult a doctor.
      </motion.div>
    </div>
  );
}

function MedicineCard() {
  const letters = 'Metformin 500mg'.split('');
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (count >= letters.length) return;
    const t = setTimeout(() => setCount(c => c + 1), 70);
    return () => clearTimeout(t);
  }, [count]);
  useEffect(() => { const t = setTimeout(() => setCount(1), 400); return () => clearTimeout(t); }, []);
  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ display: 'flex', alignItems: 'center', gap: '3%', padding: '4% 5%', borderRadius: 10, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', marginBottom: '5%' }}>
        <span style={{ fontSize: 'clamp(1rem,4vw,1.4rem)' }}>💊</span>
        <span style={{ fontFamily: 'Inter, monospace', fontSize: 'clamp(0.8rem,3.2vw,1.1rem)', color: '#34d399', fontWeight: 700 }}>
          {letters.slice(0, count).join('')}
          <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.4, repeat: Infinity }} style={{ color: '#34d399' }}>|</motion.span>
        </span>
      </motion.div>
      {count >= letters.length && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {[
            { label: 'Class', val: 'Anti-diabetic (Biguanide)' },
            { label: 'Used for', val: 'Type 2 Diabetes, PCOS' },
            { label: 'Take with', val: 'Food — reduces side effects' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.18, duration: 0.4 }}
              style={{ display: 'flex', gap: '4%', padding: '3% 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.55rem,2.2vw,0.75rem)', color: 'rgba(255,255,255,0.45)', minWidth: '25%' }}>{item.label}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.55rem,2.2vw,0.75rem)', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{item.val}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function FitnessCard() {
  const [bmi, setBmi] = useState(18);
  const [steps, setSteps] = useState(0);
  useEffect(() => {
    const t1 = setInterval(() => setBmi(v => { if (v >= 24.7) { clearInterval(t1); return v; } return Math.round((v + 0.35) * 10) / 10; }), 80);
    const t2 = setInterval(() => setSteps(v => { if (v >= 8420) { clearInterval(t2); return v; } return v + 280; }), 80);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6%' }}>
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
        style={{ padding: '5% 6%', borderRadius: 12, background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.25)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.55rem,2.2vw,0.78rem)', color: 'rgba(255,255,255,0.5)', marginBottom: '3%' }}>BMI Score</div>
        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(2rem,8vw,3.2rem)', fontWeight: 900, color: '#f472b6' }}>{bmi.toFixed(1)}</div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.55rem,2.2vw,0.75rem)', color: bmi < 18.5 ? '#f97316' : bmi < 25 ? '#22c55e' : '#ef4444', fontWeight: 600, marginTop: '2%' }}>
          {bmi < 18.5 ? 'Underweight' : bmi < 25 ? '✅ Healthy Range' : 'Overweight'}
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.5 }}
        style={{ padding: '4% 6%', borderRadius: 12, background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.18)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.6rem,2.5vw,0.85rem)', color: 'rgba(255,255,255,0.65)' }}>🚶 Daily Steps</span>
        <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(1rem,4vw,1.5rem)', fontWeight: 800, color: '#f472b6' }}>{steps.toLocaleString('en-IN')}</span>
      </motion.div>
    </div>
  );
}

export default function Scene4Features() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive(prev => (prev + 1) % features.length);
    }, FEATURE_DURATION);
    return () => clearInterval(t);
  }, []);

  const feat = features[active];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '6% 6% 5%' }}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ marginBottom: '4%' }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.55rem,2.2vw,0.78rem)', fontWeight: 700, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '2%' }}>
          FEATURES
        </div>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '2%' }}>
          {features.map((_, i) => (
            <motion.div key={i} style={{ height: 3, borderRadius: 999, flex: 1, background: i === active ? feat.color : 'rgba(255,255,255,0.15)', transition: 'background 0.3s' }} />
          ))}
        </div>
      </motion.div>

      {/* Feature pill label */}
      <AnimatePresence mode="wait">
        <motion.div key={feat.id + '-label'}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '3%', display: 'flex', alignItems: 'center', gap: '3%' }}>
          <div style={{ padding: '2% 4%', borderRadius: 999, background: `${feat.color}18`, border: `1px solid ${feat.color}44`, fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.65rem,2.5vw,0.88rem)', fontWeight: 700, color: feat.color }}>
            {feat.label}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feature title */}
      <AnimatePresence mode="wait">
        <motion.div key={feat.id + '-title'}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(1.2rem,5vw,1.9rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '5%' }}>
          {feat.title}
        </motion.div>
      </AnimatePresence>

      {/* Feature card content */}
      <AnimatePresence mode="wait">
        <motion.div key={feat.id + '-content'}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ flex: 1, padding: '5%', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${feat.color}22`, backdropFilter: 'blur(8px)' }}>
          {feat.content}
        </motion.div>
      </AnimatePresence>

      {/* CureCheck watermark */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ marginTop: '4%', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.55rem,2.2vw,0.75rem)', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em' }}>
        CURECHECK.IN
      </motion.div>
    </motion.div>
  );
}
