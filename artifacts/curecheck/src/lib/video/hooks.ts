import { useState, useEffect } from 'react';

export function useVideoPlayer({ durations }: { durations: Record<string, number> }) {
  const [currentScene, setCurrentScene] = useState(0);
  const sceneKeys = Object.keys(durations);
  
  useEffect(() => {
    // window.startRecording?.();
    let isSubscribed = true;
    let timeout: NodeJS.Timeout;

    const playScene = (index: number) => {
      if (!isSubscribed) return;
      setCurrentScene(index);
      
      const key = sceneKeys[index];
      const duration = durations[key];

      timeout = setTimeout(() => {
        if (index + 1 < sceneKeys.length) {
          playScene(index + 1);
        } else {
          // window.stopRecording?.();
          playScene(0); // loop
        }
      }, duration);
    };

    playScene(0);

    return () => {
      isSubscribed = false;
      clearTimeout(timeout);
    };
  }, [durations]);

  return { currentScene };
}
