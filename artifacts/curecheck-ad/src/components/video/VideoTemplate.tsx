import { AnimatePresence, motion } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { useEffect, useRef } from 'react';
import Scene1Hook from './video_scenes/Scene1Hook';
import Scene2Agitation from './video_scenes/Scene2Agitation';
import Scene3Reveal from './video_scenes/Scene3Reveal';
import Scene4Features from './video_scenes/Scene4Features';
import Scene5Trust from './video_scenes/Scene5Trust';
import Scene6CTA from './video_scenes/Scene6CTA';

export const SCENE_DURATIONS: Record<string, number> = {
  hook:      3000,
  agitation: 5000,
  reveal:    7000,
  features:  20000,
  trust:     10000,
  cta:       10000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  hook:      Scene1Hook,
  agitation: Scene2Agitation,
  reveal:    Scene3Reveal,
  features:  Scene4Features,
  trust:     Scene5Trust,
  cta:       Scene6CTA,
};

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.35;
    audio.play().catch(() => {});
  }, [currentSceneKey, muted]);

  const SceneComponent = SCENE_COMPONENTS[currentSceneKey];

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor: '#060d1f' }}
    >
      {/* Persistent background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 80% 110%, rgba(124,58,237,0.06) 0%, transparent 60%)',
        }} />
        {/* Grid */}
        <div className="absolute inset-0" style={{
          opacity: 0.018,
          backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Ambient orbs */}
        <motion.div className="absolute rounded-full" style={{
          width: '70%', height: '70%', top: '-20%', left: '-15%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div className="absolute rounded-full" style={{
          width: '80%', height: '80%', bottom: '-25%', right: '-20%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
          animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      {/* Scene layer */}
      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>

      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`} preload="auto" autoPlay muted={muted} />
    </div>
  );
}
