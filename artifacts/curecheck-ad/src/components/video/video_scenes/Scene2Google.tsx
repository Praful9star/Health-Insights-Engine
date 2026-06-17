import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const SEARCHES = [
  'headache nausea dizziness causes',
  'chest tightness at night symptoms',
  'fever 103 adults when dangerous',
  'heart pounding fast at rest',
  'stomach pain left side serious',
  'shortness of breath anxiety or heart',
  'blurry vision sudden cause',
  'numbness in arm meaning',
];

export default function Scene2Google() {
  const [idx, setIdx] = useState(0);
  const [showStop, setShowStop] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx(prev => {
        if (prev >= SEARCHES.length - 1) {
          clearInterval(interval);
          setTimeout(() => setShowStop(true), 150);
          return prev;
        }
        return prev + 1;
      });
    }, 340);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#020509' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
    >
      {/* Flashing background tint on each search */}
      <motion.div
        className="absolute inset-0"
        key={idx}
        initial={{ opacity: 0.15 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: 'rgba(255,50,50,0.08)' }}
      />

      {/* Fake search bar area */}
      <AnimatePresence mode="wait">
        {!showStop && (
          <motion.div
            key="searches"
            className="absolute inset-0 flex flex-col items-center justify-center"
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
            transition={{ duration: 0.3 }}
            style={{ padding: '0 8%' }}
          >
            {/* Label */}
            <motion.div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.55rem,2.2vw,0.75rem)',
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '5%',
              fontWeight: 500,
            }}>
              You searched...
            </motion.div>

            {/* Search box */}
            <div style={{
              width: '100%',
              padding: '4% 5%',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', gap: '3%',
              marginBottom: '4%',
            }}>
              <span style={{ fontSize: 'clamp(0.8rem,3.2vw,1.1rem)', opacity: 0.35 }}>🔍</span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(0.8rem,3.2vw,1.1rem)',
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 400,
                    filter: 'blur(1.5px)',
                  }}
                >
                  {SEARCHES[idx]}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Fake scary results — blurred */}
            {[
              { color: '#ef4444', width: '75%' },
              { color: '#f97316', width: '60%' },
              { color: '#ef4444', width: '80%' },
            ].map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.2 }}
                style={{
                  width: '100%', padding: '3% 4%', marginBottom: '2%',
                  borderRadius: 8, background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', flexDirection: 'column', gap: '6px',
                  filter: 'blur(2px)',
                }}>
                <div style={{ height: 8, width: r.width, borderRadius: 4, background: `${r.color}55` }} />
                <div style={{ height: 6, width: '90%', borderRadius: 3, background: 'rgba(255,255,255,0.12)' }} />
                <div style={{ height: 6, width: '70%', borderRadius: 3, background: 'rgba(255,255,255,0.08)' }} />
              </motion.div>
            ))}

            {/* Panic counter */}
            <motion.div style={{
              marginTop: '4%',
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.6rem,2.3vw,0.8rem)',
              color: 'rgba(255,80,80,0.6)',
              fontWeight: 500,
            }}
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              😰 Your anxiety: {Math.min(99, 60 + idx * 5)}%
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STOP X — slams in */}
      <AnimatePresence>
        {showStop && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {/* Red flash */}
            <motion.div className="absolute inset-0" style={{ background: '#ef4444' }}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />

            <motion.div
              initial={{ scale: 4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 'clamp(80px,28vw,120px)', height: 'clamp(80px,28vw,120px)',
                borderRadius: '50%',
                background: 'rgba(239,68,68,0.15)',
                border: '3px solid rgba(239,68,68,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'clamp(2.5rem,10vw,4.5rem)',
                marginBottom: '6%',
                boxShadow: '0 0 40px rgba(239,68,68,0.3)',
              }}
            >
              ✕
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(1.6rem,6.5vw,2.6rem)',
                fontWeight: 900,
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 1.15,
                padding: '0 10%',
              }}
            >
              Stop Googling<br />yourself sick.
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              style={{
                marginTop: '5%',
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(0.7rem,2.8vw,1rem)',
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center',
              }}
            >
              There's a better way →
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
