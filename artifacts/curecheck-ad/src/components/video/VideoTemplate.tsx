import { AnimatePresence, motion } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { useEffect, useRef } from 'react';
import SceneOpen from './video_scenes/SceneOpen';
import SceneProblem from './video_scenes/SceneProblem';
import SceneHeroReport from './video_scenes/SceneHeroReport';
import SceneClaimChecker from './video_scenes/SceneClaimChecker';
import SceneFeatures from './video_scenes/SceneFeatures';
import SceneMythBuster from './video_scenes/SceneMythBuster';
import SceneOutro from './video_scenes/SceneOutro';

export const SCENE_DURATIONS: Record<string, number> = {
  open: 3500,
  problem: 4500,
  hero_report: 7000,
  claim_checker: 4000,
  features: 4500,
  myth_buster: 3500,
  outro: 5000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  open: SceneOpen,
  problem: SceneProblem,
  hero_report: SceneHeroReport,
  claim_checker: SceneClaimChecker,
  features: SceneFeatures,
  myth_buster: SceneMythBuster,
  outro: SceneOutro,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

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

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <>
      <div
        className="relative w-full h-screen overflow-hidden"
        style={{ backgroundColor: '#0a0f1e' }}
      >
        {/* Persistent background layers */}
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          {/* Radial gradients */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,255,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 110%, rgba(124,58,237,0.07) 0%, transparent 60%)',
            }}
          />
          {/* Floating ambient orb 1 */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: '45vw',
              height: '45vw',
              top: '-15%',
              left: '-8%',
              background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
            animate={{ x: [0, 25, 0], y: [0, -18, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Floating ambient orb 2 */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: '55vw',
              height: '55vw',
              bottom: '-25%',
              right: '-12%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)',
              filter: 'blur(70px)',
            }}
            animate={{ x: [0, -18, 0], y: [0, 22, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          />
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.022]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,212,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.6) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Scene layer */}
        <AnimatePresence mode="popLayout">
          {SceneComponent && <SceneComponent key={currentSceneKey} />}
        </AnimatePresence>
      </div>

      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </>
  );
}
