import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Sparkles, X, Mic, MicOff, Send, Volume2, VolumeX,
  Square, RotateCcw, AlertTriangle, MessageCircle, Loader2,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

// Web Speech API types — not yet in all tsconfig DOM lib versions
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionResultEvent) => void) | null;
}

interface SpeechRecognitionResultEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  isEmergency?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HIDE_ON = [
  "/symptom-checker", "/report-explainer",
  "/medicine-explainer", "/claim-checker",
];

const EMERGENCY_RE = [
  /chest\s*pain/i, /heart\s*attack/i, /can'?t?\s*breathe/i,
  /difficult[y]?\s*breath/i, /\bstroke\b/i, /\bunconscious\b/i,
  /severe\s*bleed/i, /\bseizure\b/i, /\bsuicid/i,
  /kill\s*(my\s*)?self/i, /want\s*to\s*die/i, /\boverdos/i,
  /not\s*breathing/i,
  /सीने.*दर्द/, /दिल.*दौरा/, /सांस.*नहीं/,
  /\bबेहोश\b/, /मरना.*चाह/, /खुद.*नुकसान/,
];

const QUICK_CHIPS = {
  en: [
    "What does this symptom mean?",
    "Explain a medicine",
    "When should I see a doctor?",
    "Is this test result normal?",
  ],
  hi: [
    "यह लक्षण क्या है?",
    "दवा समझाएं",
    "डॉक्टर कब जाएं?",
    "यह टेस्ट सामान्य है?",
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function isEmergency(text: string): boolean {
  return EMERGENCY_RE.some((p) => p.test(text));
}

function stripMarkdown(text: string): string {
  return text.replace(/[*_#`~]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FloatingAIButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceOut, setVoiceOut] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [scrolling, setScrolling] = useState(false);
  // Independent voice-input language — defaults to Hindi regardless of UI locale
  // so users who speak Hindi can use voice even when the UI is in English
  const [voiceLang, setVoiceLang] = useState<"hi-IN" | "en-IN">("hi-IN");

  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [location] = useLocation();
  const { language, t } = useLanguage();

  // ── Init ──────────────────────────────────────────────────────────────────

  // Run once on mount to detect speech support and set initial TTS preference
  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setSpeechSupported(!!SR);
    setVoiceOut(language === "hi"); // default: on for Hindi, off for English
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — only set default once, don't override user's toggle

  // Scroll-hide FAB while user scrolls (keeps it from covering text)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      if (open) return;
      setScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => setScrolling(false), 800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(timer); };
  }, [open]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  if (HIDE_ON.includes(location)) return null;

  // ── Voice Input ───────────────────────────────────────────────────────────

  function startListening() {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = voiceLang;
    rec.interimResults = true;
    rec.continuous = false;

    rec.onstart = () => setIsListening(true);

    rec.onresult = (e: SpeechRecognitionResultEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      if (final) {
        setDraft((prev) => (prev + " " + final).trim());
        setInterimText("");
      } else {
        setInterimText(interim);
      }
    };

    rec.onerror = () => { setIsListening(false); setInterimText(""); };
    rec.onend = () => { setIsListening(false); setInterimText(""); };

    recognitionRef.current = rec;
    rec.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText("");
  }

  // ── Voice Output ──────────────────────────────────────────────────────────

  const speakMessage = useCallback((msgId: string, text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(stripMarkdown(text));
    u.lang = language === "hi" ? "hi-IN" : "en-IN";
    u.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const target = language === "hi"
      ? voices.find((v) => v.lang.startsWith("hi"))
      : voices.find((v) => v.lang.startsWith("en-IN") || v.lang.startsWith("en"));
    if (target) u.voice = target;

    u.onstart = () => setSpeakingId(msgId);
    u.onend = () => setSpeakingId(null);
    u.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(u);
  }, [language]);

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
  }

  // ── Send Message ──────────────────────────────────────────────────────────

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setDraft("");
    setInterimText("");

    const userMsg: ChatMsg = { id: uid(), role: "user", content: trimmed };
    const botId = uid();
    const botMsg: ChatMsg = { id: botId, role: "assistant", content: "" };

    // Client-side emergency intercept — immediate, no API call
    if (isEmergency(trimmed)) {
      const emergencyContent = language === "hi"
        ? "🚨 यह एक चिकित्सा आपातकाल लग रहा है। तुरंत **112** पर कॉल करें या नजदीकी अस्पताल जाएं। देर न करें।"
        : "🚨 This sounds like a medical emergency. Please call **112** (India emergency) immediately or go to the nearest hospital. Do not wait.";
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: botId, role: "assistant", content: emergencyContent, isEmergency: true },
      ]);
      if (voiceOut) speakMessage(botId, emergencyContent);
      return;
    }

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setIsStreaming(true);

    // Abort any in-flight stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Keep last 6 messages (3 turns) as context
    const history = [...messages.slice(-5), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let acc = "";
    try {
      const res = await fetch("/api/health-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, locale: language }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Flush any partial UTF-8 bytes buffered by the decoder (e.g. emojis, Hindi accents)
          const tail = dec.decode();
          if (tail) buf += tail;
          break;
        }
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const payload = part.slice(6);
          if (payload === "[DONE]") break outer;
          try {
            const parsed = JSON.parse(payload);
            // Typed error event — replace partial content rather than appending
            if (parsed && typeof parsed === "object" && parsed.type === "error") {
              acc = parsed.message as string;
              setMessages((prev) =>
                prev.map((m) => (m.id === botId ? { ...m, content: acc } : m))
              );
              break outer;
            }
            const chunk = parsed as string;
            acc += chunk;
            setMessages((prev) =>
              prev.map((m) => (m.id === botId ? { ...m, content: acc } : m))
            );
          } catch { /* ignore malformed chunk */ }
        }
      }

      if (voiceOut && acc) speakMessage(botId, acc);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const errMsg = language === "hi"
        ? "माफ करें, कुछ गलत हो गया। फिर से कोशिश करें।"
        : "Sorry, something went wrong. Please try again.";
      setMessages((prev) =>
        prev.map((m) => (m.id === botId ? { ...m, content: errMsg } : m))
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const chips = QUICK_CHIPS[language as "en" | "hi"] ?? QUICK_CHIPS.en;

  return (
    <>
      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed inset-x-2 bottom-[5rem] z-[55] lg:inset-auto lg:bottom-24 lg:right-6 lg:w-[400px] flex flex-col rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/30"
            style={{ maxHeight: "min(68vh, 560px)" }}
            role="dialog"
            aria-label={t("CureCheck Health Assistant", "CureCheck स्वास्थ्य सहायक")}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/40 flex-shrink-0">
              <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-700 text-foreground leading-none">
                  {t("Health Assistant", "स्वास्थ्य सहायक")}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {t("Educational only — not medical advice", "केवल जानकारी के लिए — चिकित्सा सलाह नहीं")}
                </p>
              </div>
              {/* TTS toggle */}
              <button
                onClick={() => { setVoiceOut((v) => !v); stopSpeaking(); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                aria-label={voiceOut ? t("Mute voice", "आवाज़ बंद करें") : t("Enable voice", "आवाज़ चालू करें")}
                title={voiceOut ? t("Voice on", "आवाज़ चालू") : t("Voice off", "आवाज़ बंद")}
              >
                {voiceOut ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                aria-label={t("Close chat", "चैट बंद करें")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
              {messages.length === 0 && (
                <div className="space-y-3">
                  {/* Welcome */}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                    <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                      <p className="text-sm text-foreground leading-relaxed">
                        {t(
                          "Hi! I'm your CureCheck Health Assistant. I can help you understand symptoms, medicines, and test results. I'm here to educate — always consult a doctor for medical decisions.",
                          "नमस्ते! मैं आपका CureCheck स्वास्थ्य सहायक हूँ। लक्षण, दवाएं और टेस्ट परिणाम समझने में मदद कर सकता हूँ। यह जानकारी के लिए है — चिकित्सा निर्णय के लिए डॉक्टर से मिलें।"
                        )}
                      </p>
                    </div>
                  </div>
                  {/* Quick chips */}
                  <div className="flex flex-wrap gap-2 pl-8">
                    {chips.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => sendMessage(chip)}
                        className="px-3 py-1.5 text-xs font-500 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/15 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role === "assistant" && (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 ${msg.isEmergency ? "bg-rose-500/20" : "bg-primary/15"}`}>
                      {msg.isEmergency
                        ? <AlertTriangle className="w-3 h-3 text-rose-400" />
                        : <Sparkles className="w-3 h-3 text-primary" />
                      }
                    </div>
                  )}

                  <div className={`max-w-[82%] group ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : msg.isEmergency
                          ? "bg-rose-500/15 border border-rose-500/30 text-foreground rounded-bl-sm"
                          : "bg-muted/60 text-foreground rounded-bl-sm"
                    }`}>
                      {/* Render **bold** inline */}
                      {msg.content
                        ? msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                            part.startsWith("**") && part.endsWith("**")
                              ? <strong key={i}>{part.slice(2, -2)}</strong>
                              : part
                          )
                        : msg.role === "assistant" && isStreaming
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                          : null
                      }
                    </div>

                    {/* Per-message TTS controls (AI messages only) */}
                    {msg.role === "assistant" && msg.content && "speechSynthesis" in window && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 px-1">
                        {speakingId === msg.id ? (
                          <button
                            onClick={stopSpeaking}
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                            aria-label={t("Stop speaking", "बोलना बंद करें")}
                          >
                            <Square className="w-2.5 h-2.5" /> {t("Stop", "रोकें")}
                          </button>
                        ) : (
                          <button
                            onClick={() => speakMessage(msg.id, msg.content)}
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                            aria-label={t("Read aloud", "ज़ोर से पढ़ें")}
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> {t("Play", "सुनें")}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 border-t border-border/40 px-3 pt-2.5 pb-3 space-y-2">
              {/* Text input row */}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={isListening && interimText ? interimText : draft}
                  onChange={(e) => { if (!isListening) setDraft(e.target.value); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(draft); } }}
                  placeholder={
                    isListening
                      ? t("Listening…", "सुन रहा हूँ…")
                      : t("Type a health question…", "स्वास्थ्य प्रश्न टाइप करें…")
                  }
                  disabled={isStreaming}
                  className="flex-1 text-sm bg-muted/40 border border-border/50 rounded-xl px-3 py-2 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/60 disabled:opacity-50 transition-all"
                  aria-label={t("Health question input", "स्वास्थ्य प्रश्न")}
                />
                {isStreaming ? (
                  <button
                    onClick={() => abortRef.current?.abort()}
                    className="w-9 h-9 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 flex items-center justify-center text-rose-400 transition-colors flex-shrink-0"
                    aria-label={t("Stop generating", "रोकें")}
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => sendMessage(draft)}
                    disabled={!draft.trim() || isStreaming}
                    className="w-9 h-9 rounded-xl bg-primary/90 hover:bg-primary text-primary-foreground flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"
                    aria-label={t("Send", "भेजें")}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Voice row */}
              <div className="flex items-center gap-2">
                {/* Language toggle for voice — independent of UI locale */}
                {speechSupported && (
                  <button
                    onClick={() => {
                      if (isListening) stopListening();
                      setVoiceLang((l) => l === "hi-IN" ? "en-IN" : "hi-IN");
                    }}
                    className="flex-shrink-0 px-2.5 py-2.5 rounded-xl border border-border/50 bg-muted/40 text-xs font-700 text-foreground hover:bg-accent/50 transition-colors w-14 text-center"
                    title={voiceLang === "hi-IN" ? "Switch to English voice" : "हिंदी में बोलें"}
                    aria-label={voiceLang === "hi-IN" ? "Voice: Hindi — tap to switch to English" : "Voice: English — tap to switch to Hindi"}
                  >
                    {voiceLang === "hi-IN" ? "हिंदी" : "EN"}
                  </button>
                )}

                {/* Large mic button — the hero interaction */}
                {speechSupported ? (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isStreaming}
                    className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-600 text-sm transition-all disabled:opacity-40 ${
                      isListening
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                        : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                    }`}
                    aria-label={isListening ? t("Stop listening", "सुनना बंद करें") : t("Tap to speak", "बोलने के लिए दबाएं")}
                    aria-pressed={isListening}
                  >
                    {isListening && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-rose-500 opacity-30 pointer-events-none"
                        animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                      />
                    )}
                    {isListening
                      ? <><MicOff className="w-4 h-4" /> {t("Stop", "रोकें")}</>
                      : <><Mic className="w-4 h-4" /> {t("Tap to speak", "बोलने के लिए दबाएं")}</>
                    }
                  </button>
                ) : (
                  <div className="flex-1 text-center text-xs text-muted-foreground/60 py-1">
                    {t("Voice not supported on this browser", "इस ब्राउज़र में Voice उपलब्ध नहीं")}
                  </div>
                )}
              </div>

              {/* Trust note */}
              {speechSupported && (
                <p className="text-[10px] text-muted-foreground/50 text-center leading-tight">
                  🔒 {t("Voice is processed on your device — only text is sent", "आवाज़ आपके device पर process होती है — केवल text भेजा जाता है")}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB ────────────────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-[5.5rem] right-3 lg:bottom-20 lg:right-6 z-50 transition-all duration-300 ${
          scrolling && !open ? "opacity-0 pointer-events-none scale-90" : "opacity-100"
        }`}
      >
        <motion.button
          onClick={() => setOpen((o) => !o)}
          whileTap={{ scale: 0.92 }}
          className="relative w-11 h-11 lg:w-14 lg:h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:shadow-primary/50 hover:scale-105 transition-all"
          aria-label={open ? t("Close health assistant", "सहायक बंद करें") : t("Open health assistant", "स्वास्थ्य सहायक खोलें")}
          aria-expanded={open}
        >
          {!open && (
            <motion.div
              className="absolute inset-0 rounded-2xl bg-primary opacity-40 pointer-events-none"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
            />
          )}
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-4 h-4 lg:w-5 lg:h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="ai"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}
