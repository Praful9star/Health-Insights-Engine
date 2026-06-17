import VideoWithControls from "@/components/video/VideoWithControls";

const isCleanMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('clean');

export default function App() {
  return (
    <div style={{
      minHeight: '100svh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isCleanMode ? '#000' : '#020810',
    }}>
      <div style={{
        position: 'relative',
        height: '100svh',
        aspectRatio: '9/16',
        maxWidth: '100vw',
        overflow: 'hidden',
        borderRadius: isCleanMode ? 0 : (typeof window !== 'undefined' && window.innerWidth > 430 ? 24 : 0),
        boxShadow: (!isCleanMode && typeof window !== 'undefined' && window.innerWidth > 430)
          ? '0 0 0 1px rgba(0,212,255,0.12), 0 40px 120px rgba(0,0,0,0.8)'
          : 'none',
      }}>
        <VideoWithControls hideControls={isCleanMode} />
      </div>
    </div>
  );
}
