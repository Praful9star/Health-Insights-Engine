import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, X, Clock, Sparkles, BookOpen, Pill } from "lucide-react";

const STORAGE_KEY = "cc_notif_prefs_v1";

interface NotifPrefs {
  dismissed: boolean;
  enabled: boolean;
  tips: boolean;
  myth: boolean;
  medicine: boolean;
  medicineTime: string;
}

const DEFAULTS: NotifPrefs = {
  dismissed: false,
  enabled: false,
  tips: true,
  myth: true,
  medicine: false,
  medicineTime: "09:00",
};

function loadPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULTS };
}

function savePrefs(p: NotifPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {}
}

function getOneSignal(): Window["OneSignal"] | undefined {
  return typeof window !== "undefined" ? window.OneSignal : undefined;
}

function applyOneSignalTags(prefs: NotifPrefs) {
  const os = getOneSignal();
  if (!os?.User) return;
  try {
    os.User.addTags({
      daily_tips: prefs.tips ? "true" : "false",
      myth_of_day: prefs.myth ? "true" : "false",
      medicine_reminder: prefs.medicine ? "true" : "false",
      medicine_time: prefs.medicineTime,
    });
  } catch {}
}

async function requestNotifPermission(): Promise<boolean> {
  const os = getOneSignal();
  if (!os?.Notifications) return false;
  try {
    await os.Notifications.requestPermission();
    return os.Notifications.permission;
  } catch {
    return false;
  }
}

export default function NotificationPrefs() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULTS);
  const [visible, setVisible] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const loaded = loadPrefs();
    setPrefs(loaded);

    if (loaded.dismissed) return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      setPrefs((p) => ({ ...p, enabled: true }));
      return;
    }
    if (Notification.permission === "denied") return;

    const timer = setTimeout(() => setVisible(true), 45_000);
    return () => clearTimeout(timer);
  }, []);

  const updatePrefs = useCallback((patch: Partial<NotifPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      savePrefs(next);
      if (next.enabled) applyOneSignalTags(next);
      return next;
    });
  }, []);

  const handleEnable = async () => {
    setRequesting(true);
    const granted = await requestNotifPermission();
    setRequesting(false);
    if (granted) {
      updatePrefs({ enabled: true });
      applyOneSignalTags({ ...prefs, enabled: true });
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    updatePrefs({ dismissed: true });
  };

  if (!("Notification" in window)) return null;

  return (
    <>
      <AnimatePresence>
        {visible && !panelOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed bottom-[13rem] left-4 right-4 lg:bottom-24 lg:left-auto lg:right-28 lg:w-80 z-50"
          >
            <div className="glass-panel rounded-xl px-3 py-2.5 border border-primary/20 shadow-xl shadow-black/40 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-700 text-foreground leading-tight">Get daily health tips</p>
                <p className="text-[11px] text-muted-foreground leading-tight">Medicine reminders &amp; myth alerts</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => { setVisible(false); setPanelOpen(true); }}
                  className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[11px] font-700 hover:bg-primary/90 transition-colors"
                >
                  Set up
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:bottom-6 lg:left-auto lg:right-6 lg:w-96"
            >
              <div className="glass-panel rounded-t-2xl lg:rounded-2xl border border-border/50 shadow-2xl shadow-black/60 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-700 text-foreground">Notification Preferences</h2>
                  </div>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {!prefs.enabled ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <BellOff className="w-6 h-6 text-primary/60" />
                    </div>
                    <p className="text-sm font-600 text-foreground mb-1">Stay on top of your health</p>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      Get daily health tips, myth-busting alerts, and personalised medicine reminders — no spam.
                    </p>
                    <button
                      onClick={handleEnable}
                      disabled={requesting}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-700 hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                      {requesting ? "Requesting…" : "Enable Notifications"}
                    </button>
                    <button
                      onClick={() => { setPanelOpen(false); updatePrefs({ dismissed: true }); }}
                      className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Maybe later
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-1">Notifications are enabled. Choose what you receive:</p>

                    <PrefsRow
                      icon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                      label="Daily Health Tip"
                      sublabel="Sent at 8 AM every morning"
                      checked={prefs.tips}
                      onChange={(v) => updatePrefs({ tips: v })}
                    />

                    <PrefsRow
                      icon={<BookOpen className="w-3.5 h-3.5 text-violet-400" />}
                      label="Myth of the Day"
                      sublabel="Common health myths, debunked"
                      checked={prefs.myth}
                      onChange={(v) => updatePrefs({ myth: v })}
                    />

                    <div className="rounded-xl border border-border/40 bg-card/30 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                            <Pill className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-xs font-600 text-foreground leading-none">Medicine Reminder</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Daily reminder to take medicines</p>
                          </div>
                        </div>
                        <Toggle
                          checked={prefs.medicine}
                          onChange={(v) => updatePrefs({ medicine: v })}
                        />
                      </div>
                      {prefs.medicine && (
                        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <label className="text-[11px] text-muted-foreground">Reminder time</label>
                          <input
                            type="time"
                            value={prefs.medicineTime}
                            onChange={(e) => updatePrefs({ medicineTime: e.target.value })}
                            className="ml-auto text-xs bg-background border border-border/50 rounded-lg px-2 py-1 text-foreground focus:outline-none focus:border-primary/50"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setPanelOpen(false)}
                      className="w-full py-2 rounded-xl bg-primary/10 text-primary text-xs font-700 hover:bg-primary/20 transition-colors mt-1"
                    >
                      Save Preferences
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-primary" : "bg-muted/60"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
}

function PrefsRow({
  icon, label, sublabel, checked, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card/30 p-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-muted/30 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs font-600 text-foreground leading-none">{label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
