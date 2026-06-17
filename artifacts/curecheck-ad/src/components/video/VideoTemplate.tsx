import { AnimatePresence, motion } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { useEffect } from 'react';
import Scene1POV from './video_scenes/Scene1POV';
import Scene2Google from './video_scenes/Scene2Google';
import Scene3Symptom from './video_scenes/Scene3Symptom';
import Scene4CTA from './video_scenes/Scene4CTA';

export const SCENE_DURATIONS: Record<string, number> = {
  pov:     3000,
  google:  4000,
  symptom: 8000,
  cta:     4000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  pov:     Scene1POV,
  google:  Scene2Google,
  symptom: Scene3Symptom,
  cta:     Scene4CTA,
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

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const SceneComponent = SCENE_COMPONENTS[currentSceneKey];

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: '#020509' }}>
      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>
    </div>
  );
}
