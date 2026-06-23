import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import PageMeta from "@/components/page-meta";
import { Mail, Lock, User, ChevronLeft, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CureCheckMark } from "@/components/logo";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

export default function Login() {
  const { signIn, signUp, signInGoogle, signOut, user, loading } = useAuth();
  const { tKey } = useLanguage();
  const [, navigate] = useLocation();
  const [mode, setMode]       = useState<"login" | "signup">("login");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState(false);
  const [done, setDone]       = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    if (mode === "login") {
      const { error: err } = await signIn(email, password);
      if (err) { setError(err); setBusy(false); return; }
      navigate("/dashboard");
    } else {
      const { error: err } = await signUp(email, password, name);
      if (err) { setError(err); setBusy(false); return; }
      setDone(true);
    }
    setBusy(false);
  };

  if (loading) return (
    <div className="relative z-10 min-h-[80vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (user) return (
    <div className="relative z-10 min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-3xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-serif font-800 text-foreground mb-1">{tKey("auth.signedIn")}</h2>
        <p className="text-sm text-muted-foreground mb-6">{user.email}</p>
        <Button variant="outline" className="rounded-xl w-full" onClick={async () => { await signOut(); navigate("/"); }}>
          <LogOut className="w-4 h-4 mr-2" /> {tKey("auth.signOut")}
        </Button>
      </motion.div>
    </div>
  );

  if (done) return (
    <div className="relative z-10 min-h-[80vh] flex items-center justify-center px-4">
      <div className="glass-panel rounded-3xl p-10 text-center max-w-sm w-full">
        <p className="text-4xl mb-4">📧</p>
        <h2 className="text-xl font-serif font-800 text-foreground mb-2">{tKey("auth.checkEmail")}</h2>
        <p className="text-sm text-muted-foreground mb-6">{tKey("auth.confirmationSent")} <strong>{email}</strong>.</p>
        <Button className="w-full rounded-xl" onClick={() => { setDone(false); setMode("login"); }}>
          {tKey("auth.backToSignIn")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="relative z-10 min-h-[80vh] flex items-center justify-center px-4 py-12">
      <PageMeta
        title="Sign In — CureCheck"
        description="Sign in to CureCheck to save your health history, access premium tools, and personalise your experience."
        path="/login"
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-sm">
        <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> {tKey("common.home")}
        </span></Link>

        <div className="glass-panel rounded-3xl p-8 border border-border/60">
          <div className="flex items-center gap-3 mb-7">
            <CureCheckMark size={36} id="login-logo" />
            <div>
              <h1 className="text-xl font-serif font-800 text-foreground">
                {mode === "login" ? tKey("auth.welcomeBack") : tKey("auth.createAccount")}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mode === "login" ? tKey("auth.signInSync") : tKey("auth.freeNoCard")}
              </p>
            </div>
          </div>

          <button
            onClick={() => signInGoogle()}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-border/70 bg-muted/30 hover:bg-muted/60 transition-all text-sm font-600 text-foreground mb-5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {tKey("auth.continueGoogle")}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-muted-foreground">{tKey("common.or")}</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder={tKey("auth.fullName")} value={name} onChange={e => setName(e.target.value)} className="pl-9 rounded-xl" required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder={tKey("auth.email")} value={email} onChange={e => setEmail(e.target.value)} className="pl-9 rounded-xl" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="password" placeholder={tKey("auth.password")} value={password} onChange={e => setPassword(e.target.value)} className="pl-9 rounded-xl" required minLength={6} />
            </div>
            {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full rounded-xl mt-1">
              <LogIn className="w-4 h-4 mr-2" />
              {busy ? tKey("auth.pleaseWait") : mode === "login" ? tKey("auth.signIn") : tKey("auth.createAccountBtn")}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-5">
            {mode === "login" ? tKey("auth.noAccount") : tKey("auth.hasAccount")}{" "}
            <button
              onClick={() => { setMode(m => m === "login" ? "signup" : "login"); setError(""); }}
              className="text-primary hover:text-primary/80 font-600 transition-colors"
            >
              {mode === "login" ? tKey("auth.signUpFree") : tKey("auth.signIn")}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
