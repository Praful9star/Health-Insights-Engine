import VideoWithControls from "@/components/video/VideoWithControls";

export default function App() {
  return (
    <div style={{
      minHeight: '100svh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#020810',
    }}>
      {/* 9:16 vertical container — sized to fill screen height */}
      <div style={{
        position: 'relative',
        height: '100svh',
        aspectRatio: '9/16',
        maxWidth: '100vw',
        overflow: 'hidden',
        borderRadius: typeof window !== 'undefined' && window.innerWidth > 430 ? 24 : 0,
        boxShadow: typeof window !== 'undefined' && window.innerWidth > 430
          ? '0 0 0 1px rgba(0,212,255,0.12), 0 40px 120px rgba(0,0,0,0.8)'
          : 'none',
      }}>
        <VideoWithControls />
      </div>
    </div>
  );
}
