import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Repeat, Volume2, VolumeX, Download, Circle, CheckCircle } from 'lucide-react';
import VideoTemplate, { SCENE_DURATIONS } from './VideoTemplate';
import { useSceneControls } from './useSceneControls';

const PROGRESS_TICK_MS = 60;
const TOTAL_DURATION_MS = Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);

type RecordState = 'idle' | 'preparing' | 'recording' | 'processing' | 'done';

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function ProgressSegments({
  sceneKeys,
  activeIndex,
  activeDuration,
  tick,
  onJumpTo,
}: {
  sceneKeys: string[];
  activeIndex: number;
  activeDuration: number;
  tick: number;
  onJumpTo: (index: number) => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    const start = performance.now();
    const id = window.setInterval(() => {
      setElapsed(performance.now() - start);
    }, PROGRESS_TICK_MS);
    return () => window.clearInterval(id);
  }, [tick]);

  const progress = activeDuration > 0 ? Math.min(1, elapsed / activeDuration) : 0;

  return (
    <div className="flex-1 flex items-center gap-1.5">
      {sceneKeys.map((key, i) => {
        const isActive = i === activeIndex;
        const fill = isActive ? progress * 100 : 0;
        return (
          <button
            key={key}
            onClick={() => onJumpTo(i)}
            className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-4 hover:bg-white/25 transition-all relative min-h-[12px]"
            aria-label={`Jump to scene ${i + 1}`}
            aria-current={isActive ? 'true' : undefined}
          >
            <div
              className="absolute inset-y-0 left-0 bg-white/90 rounded-full transition-[width] duration-100"
              style={{ width: `${fill}%` }}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function VideoWithControls() {
  const {
    sceneKeys,
    activeIndex,
    locked,
    mountKey,
    tick,
    durations,
    activeDuration,
    onSceneChange,
    jumpTo,
    toggleLock,
  } = useSceneControls(SCENE_DURATIONS);

  const [muted, setMuted] = useState(true);
  const sensorRef = useRef<HTMLDivElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [tapPinned, setTapPinned] = useState(false);

  // Recording state
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') rec.stop();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setRecordState('preparing');

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          frameRate: { ideal: 60 },
        },
        audio: false,
        // @ts-expect-error Chrome-specific hint — pre-selects current tab
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
      } as DisplayMediaStreamOptions);

      chunksRef.current = [];

      const mimeType =
        ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(
          (m) => MediaRecorder.isTypeSupported(m),
        ) ?? 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8_000_000,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        setRecordState('processing');
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `curecheck-ad-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
        setRecordState('done');
        setTimeout(() => setRecordState('idle'), 4000);
      };

      // If user stops sharing via browser UI
      stream.getTracks()[0].onended = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
        if (recorder.state !== 'inactive') recorder.stop();
      };

      recorderRef.current = recorder;

      // Collapse controls for a clean capture, reset to scene 1
      setCollapsed(true);
      jumpTo(0);

      recorder.start(500);
      setRecordState('recording');
      setRecordSeconds(0);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 500);

      // Auto-stop after all scenes finish + 0.8s buffer
      stopTimeoutRef.current = setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop();
        if (timerRef.current) clearInterval(timerRef.current);
      }, TOTAL_DURATION_MS + 800);
    } catch {
      // User cancelled the screen-picker
      setRecordState('idle');
    }
  }, [jumpTo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, []);

  const handlePointerEnter = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') setHovering(true);
  }, []);
  const handlePointerLeave = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') setHovering(false);
  }, []);
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse') return;
      if (collapsed) setTapPinned(true);
    },
    [collapsed],
  );
  const handleToggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      if (!c) { setHovering(false); setTapPinned(false); }
      return !c;
    });
  }, []);

  const barVisible = !collapsed || hovering || tapPinned;
  const isRecording = recordState === 'recording';

  return (
    <div className="relative w-full h-full">
      <VideoTemplate
        key={mountKey}
        durations={durations}
        loop={!isRecording}
        muted={muted}
        onSceneChange={onSceneChange}
      />

      {/* ── Recording overlay (top badge) ── */}
      {isRecording && (
        <div
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)' }}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-white text-sm font-semibold tracking-wide">REC</span>
          </div>
          <div className="text-white font-mono text-sm tabular-nums">
            {formatTime(recordSeconds)} / {formatTime(Math.round(TOTAL_DURATION_MS / 1000))}
          </div>
          <button
            className="pointer-events-auto text-white/70 hover:text-white text-xs border border-white/30 rounded px-2 py-1 bg-black/40 hover:bg-black/60 transition-colors"
            onClick={stopRecording}
          >
            Stop
          </button>
        </div>
      )}

      {/* ── Processing / Done toast ── */}
      {(recordState === 'processing' || recordState === 'done') && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 bg-black/75 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/10">
            {recordState === 'processing' ? (
              <>
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <div className="text-white font-semibold text-sm">Preparing download…</div>
              </>
            ) : (
              <>
                <CheckCircle className="text-green-400 w-9 h-9" />
                <div className="text-white font-semibold text-sm">Downloaded!</div>
                <div className="text-white/50 text-xs">curecheck-ad.webm</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Control bar sensor area ── */}
      <div
        ref={sensorRef}
        className="absolute bottom-0 left-0 right-0 z-40 flex flex-col justify-end"
        style={{ height: '30%' }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      >
        {/* Record button — shown when controls visible and not currently recording */}
        {!isRecording && barVisible && (
          <div className="flex justify-center pb-2 px-4">
            <button
              onClick={recordState === 'idle' ? startRecording : undefined}
              disabled={recordState !== 'idle'}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all
                ${recordState === 'idle'
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400 active:scale-95 cursor-pointer'
                  : 'bg-white/5 border border-white/10 text-white/30 cursor-default'
                }`}
            >
              {recordState === 'idle' ? (
                <><Circle className="w-3.5 h-3.5 fill-red-500 text-red-500" /> Record &amp; Download</>
              ) : recordState === 'preparing' ? (
                <><div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" /> Opening tab picker…</>
              ) : (
                <><Download className="w-3.5 h-3.5" /> Processing…</>
              )}
            </button>
          </div>
        )}

        <div className="flex-1 w-full" aria-hidden="true" />

        {/* Main control bar */}
        <div
          className={`flex items-center gap-3 bg-black/50 backdrop-blur-sm px-5 py-4 transition-all duration-200 ease-out ${
            barVisible
              ? 'translate-y-0 opacity-100 pointer-events-auto'
              : 'translate-y-full opacity-0 pointer-events-none'
          }`}
          aria-hidden={!barVisible}
        >
          <button
            onClick={toggleLock}
            className={`w-14 h-14 flex items-center justify-center transition-colors rounded-lg shrink-0 ${
              locked
                ? 'text-white bg-white/15 hover:bg-white/25'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title={locked ? 'Loop scene: on' : 'Loop scene: off'}
            aria-label={locked ? 'Loop scene: on' : 'Loop scene: off'}
            aria-pressed={locked}
          >
            <Repeat className="w-8 h-8" />
          </button>

          <button
            onClick={() => setMuted((m) => !m)}
            className={`w-14 h-14 flex items-center justify-center transition-colors rounded-lg shrink-0 ${
              muted
                ? 'text-white/60 hover:text-white hover:bg-white/10'
                : 'text-white bg-white/15 hover:bg-white/25'
            }`}
            title={muted ? 'Unmute' : 'Mute'}
            aria-label={muted ? 'Unmute' : 'Mute'}
            aria-pressed={!muted}
          >
            {muted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
          </button>

          <div className="w-px self-stretch bg-white/15" aria-hidden="true" />

          <ProgressSegments
            sceneKeys={sceneKeys}
            activeIndex={activeIndex}
            activeDuration={activeDuration}
            tick={tick}
            onJumpTo={jumpTo}
          />

          <div className="text-xl text-white/60 font-mono tabular-nums shrink-0">
            {activeIndex + 1}/{sceneKeys.length}
          </div>

          <button
            onClick={handleToggleCollapsed}
            className="w-14 h-14 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-lg shrink-0"
            title={collapsed ? 'Show controls' : 'Hide controls'}
            aria-label={collapsed ? 'Show controls' : 'Hide controls'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronUp className="w-10 h-10" /> : <ChevronDown className="w-10 h-10" />}
          </button>
        </div>
      </div>
    </div>
  );
}
