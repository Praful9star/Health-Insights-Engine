import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, User, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

// Blood groups are medical codes — always keep in English
const BLOOD_GROUPS = ["A+", "A−", "B+", "B−", "O+", "O−", "AB+", "AB−"];

export default function Profile() {
  const { user, profile, profileLoading, updateProfile, refreshProfile } = useAuth();
  const { tKey } = useLanguage();

  // Gender options: keys for value, tKey for display label
  const GENDERS = [
    { value: "male",          label: tKey("profile.genderMale")      },
    { value: "female",        label: tKey("profile.genderFemale")    },
    { value: "non-binary",    label: tKey("profile.genderNonBinary") },
    { value: "prefer not to say", label: tKey("profile.genderPreferNot") },
  ];

  const [form, setForm] = useState({
    name: "", age: "", gender: "", blood_group: "", city: "", allergies: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  if (profileLoading && !profile) {
    return (
      <div className="relative z-10 min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    const { error: err } = await updateProfile(form);
    if (err) { setError(err); }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  return (
    <div className="relative z-10 max-w-xl mx-auto px-4 py-10">
      <motion.div initial={{ y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link href="/dashboard">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer">
            <ChevronLeft className="w-4 h-4" /> {tKey("profile.dashboard")}
          </span>
        </Link>

        <div className="glass-panel rounded-3xl p-8 border border-border/60">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-800 text-foreground">{tKey("profile.title")}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1.5">{tKey("profile.fullName")}</label>
              <Input
                value={form.name} onChange={(e) => set("name")(e.target.value)}
                placeholder={tKey("profile.namePlaceholder")} className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1.5">{tKey("profile.age")}</label>
                <Input
                  type="number" min={1} max={120}
                  value={form.age} onChange={(e) => set("age")(e.target.value)}
                  placeholder={tKey("profile.agePlaceholder")} className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-600 text-muted-foreground mb-1.5">{tKey("profile.city")}</label>
                <Input
                  value={form.city} onChange={(e) => set("city")(e.target.value)}
                  placeholder={tKey("profile.cityPlaceholder")} className="rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1.5">{tKey("profile.gender")}</label>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.value} type="button"
                    onClick={() => set("gender")(g.value)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-600 border transition-all ${
                      form.gender === g.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/60 text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1.5">{tKey("profile.bloodGroup")}</label>
              <div className="flex flex-wrap gap-2">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    key={bg} type="button"
                    onClick={() => set("blood_group")(bg)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-600 border transition-all ${
                      form.blood_group === bg
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/60 text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-600 text-muted-foreground mb-1.5">{tKey("profile.allergies")}</label>
              <Input
                value={form.allergies} onChange={(e) => set("allergies")(e.target.value)}
                placeholder={tKey("profile.allergiesPlaceholder")} className="rounded-xl"
              />
            </div>

            {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>}

            <Button type="submit" disabled={saving} className="w-full rounded-xl gap-2 mt-2">
              {saved ? (
                <><CheckCircle className="w-4 h-4" /> {tKey("profile.saved")}</>
              ) : (
                <><Save className="w-4 h-4" /> {saving ? tKey("profile.saving") : tKey("profile.save")}</>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
