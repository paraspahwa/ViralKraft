import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router";
import { Instagram, Lock, Mail, Sparkles, Youtube } from "lucide-react";
import { toast } from "sonner";
import { AppNavbar } from "../components/AppNavbar";
import { CinematicBackground } from "../components/CinematicBackground";
import { getSupabaseBrowserClient, hasSupabaseBrowserConfig } from "../lib/supabaseClient";

type AuthMode = "magic" | "signin" | "signup";
type SocialProvider = "google" | "youtube" | "instagram" | "tiktok";

function envFlag(name: string, defaultValue: boolean) {
  const value = String(import.meta.env[name] || "").toLowerCase();
  if (!value) {
    return defaultValue;
  }
  return value === "1" || value === "true" || value === "yes";
}

const PROVIDER_ENABLED: Record<SocialProvider, boolean> = {
  google: true,
  youtube: true,
  instagram: envFlag("VITE_ENABLE_INSTAGRAM_AUTH", false),
  tiktok: envFlag("VITE_ENABLE_TIKTOK_AUTH", false),
};

function normalizeNext(nextParam: string | null) {
  if (!nextParam || !nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return "/dashboard";
  }
  return nextParam;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = useMemo(() => normalizeNext(searchParams.get("next")), [searchParams]);

  const [mode, setMode] = useState<AuthMode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!hasSupabaseBrowserConfig()) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (mounted && data.session?.user?.id) {
        navigate(nextPath, { replace: true });
      }
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        navigate(nextPath, { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, nextPath]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter your email");
      return;
    }

    if ((mode === "signin" || mode === "signup") && !password) {
      toast.error("Please enter your password");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }

    try {
      setLoading(true);
      const redirectTo = `${window.location.origin}${nextPath}`;
      let error: Error | null = null;

      if (mode === "magic") {
        const result = await supabase.auth.signInWithOtp({
          email: trimmed,
          options: {
            emailRedirectTo: redirectTo,
          },
        });
        error = result.error;
      }

      if (mode === "signin") {
        const result = await supabase.auth.signInWithPassword({
          email: trimmed,
          password,
        });
        error = result.error;
      }

      if (mode === "signup") {
        const result = await supabase.auth.signUp({
          email: trimmed,
          password,
          options: {
            emailRedirectTo: redirectTo,
          },
        });
        error = result.error;
      }

      if (error) {
        throw error;
      }

      if (mode === "magic") {
        setEmailSent(true);
        toast.success("Magic link sent. Check your inbox.");
      } else if (mode === "signup") {
        toast.success("Account created. Check your email if verification is enabled.");
      } else {
        toast.success("Signed in successfully.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function onSocialSignIn(provider: SocialProvider) {
    if (!PROVIDER_ENABLED[provider]) {
      toast.info(`${provider[0].toUpperCase() + provider.slice(1)} login needs provider setup first.`);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }

    try {
      setProviderLoading(provider);
      const redirectTo = `${window.location.origin}${nextPath}`;

      let oauthProvider: "google" | "facebook" | "tiktok" = "google";
      const options: Record<string, unknown> = {
        redirectTo,
      };

      if (provider === "youtube") {
        oauthProvider = "google";
        options.scopes = "openid email profile https://www.googleapis.com/auth/youtube.readonly";
      }

      if (provider === "instagram") {
        oauthProvider = "facebook";
        options.scopes = "public_profile,email,instagram_basic";
      }

      if (provider === "tiktok") {
        oauthProvider = "tiktok";
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: oauthProvider,
        options,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const fallbackMessage =
        provider === "tiktok"
          ? "TikTok sign-in needs provider setup in Supabase Auth."
          : provider === "instagram"
            ? "Instagram sign-in needs Meta/Facebook provider setup in Supabase Auth."
            : provider === "youtube"
              ? "YouTube sign-in needs Google provider setup in Supabase Auth."
              : "Social sign-in failed.";

      toast.error(error instanceof Error ? `${error.message} ${fallbackMessage}` : fallbackMessage);
    } finally {
      setProviderLoading(null);
    }
  }

  return (
    <div className="relative min-h-screen" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>
      <CinematicBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <AppNavbar />

        <div className="max-w-md mx-auto px-4 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-purple-300 text-xs">Secure Sign In</span>
            </div>

            <h1 className="text-white text-2xl font-bold mb-2">Sign in to ViralCraft</h1>
            <p className="text-white/50 text-sm mb-4">
              {mode === "magic" && "Use your email to get a magic link. No password needed."}
              {mode === "signin" && "Sign in with your email and password."}
              {mode === "signup" && "Create an account with email and password."}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("magic");
                  setEmailSent(false);
                }}
                className={`rounded-lg px-2 py-1.5 text-xs border transition-colors ${
                  mode === "magic"
                    ? "border-purple-400/50 bg-purple-400/15 text-purple-200"
                    : "border-white/10 text-white/55 hover:text-white"
                }`}
              >
                Magic Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setEmailSent(false);
                }}
                className={`rounded-lg px-2 py-1.5 text-xs border transition-colors ${
                  mode === "signin"
                    ? "border-purple-400/50 bg-purple-400/15 text-purple-200"
                    : "border-white/10 text-white/55 hover:text-white"
                }`}
              >
                Password Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setEmailSent(false);
                }}
                className={`rounded-lg px-2 py-1.5 text-xs border transition-colors ${
                  mode === "signup"
                    ? "border-purple-400/50 bg-purple-400/15 text-purple-200"
                    : "border-white/10 text-white/55 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {!hasSupabaseBrowserConfig() && (
              <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-amber-200 text-xs">
                Auth is not configured in this environment. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => void onSocialSignIn("google")}
                disabled={providerLoading !== null || !hasSupabaseBrowserConfig()}
                className="py-2.5 rounded-xl text-sm font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {providerLoading === "google" ? "Redirecting..." : "Google"}
              </button>
              <button
                type="button"
                onClick={() => void onSocialSignIn("youtube")}
                disabled={providerLoading !== null || !hasSupabaseBrowserConfig()}
                className="py-2.5 rounded-xl text-sm font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Youtube className="w-4 h-4" />
                {providerLoading === "youtube" ? "Redirecting..." : "YouTube"}
              </button>
              <button
                type="button"
                onClick={() => void onSocialSignIn("instagram")}
                disabled={providerLoading !== null || !hasSupabaseBrowserConfig() || !PROVIDER_ENABLED.instagram}
                className="relative py-2.5 rounded-xl text-sm font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Instagram className="w-4 h-4" />
                {providerLoading === "instagram" ? "Redirecting..." : "Instagram"}
                {!PROVIDER_ENABLED.instagram && (
                  <span className="absolute -top-2 right-2 rounded-full border border-amber-400/35 bg-amber-300/15 px-1.5 py-0.5 text-[0.6rem] text-amber-300">
                    Setup required
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => void onSocialSignIn("tiktok")}
                disabled={providerLoading !== null || !hasSupabaseBrowserConfig() || !PROVIDER_ENABLED.tiktok}
                className="relative py-2.5 rounded-xl text-sm font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {providerLoading === "tiktok" ? "Redirecting..." : "TikTok"}
                {!PROVIDER_ENABLED.tiktok && (
                  <span className="absolute -top-2 right-2 rounded-full border border-amber-400/35 bg-amber-300/15 px-1.5 py-0.5 text-[0.6rem] text-amber-300">
                    Setup required
                  </span>
                )}
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-white/35 text-[0.65rem] uppercase tracking-wide">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block">
                <span className="text-white/60 text-xs">Email</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 py-2">
                  <Mail className="w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/25"
                    autoComplete="email"
                  />
                </div>
              </label>

              {(mode === "signin" || mode === "signup") && (
                <label className="block">
                  <span className="text-white/60 text-xs">Password</span>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 py-2">
                    <Lock className="w-4 h-4 text-white/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/25"
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    />
                  </div>
                </label>
              )}

              {mode === "signup" && (
                <label className="block">
                  <span className="text-white/60 text-xs">Confirm Password</span>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 py-2">
                    <Lock className="w-4 h-4 text-white/40" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/25"
                      autoComplete="new-password"
                    />
                  </div>
                </label>
              )}

              <button
                type="submit"
                disabled={loading || !hasSupabaseBrowserConfig()}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                  boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
                }}
              >
                {loading
                  ? "Please wait..."
                  : mode === "magic"
                    ? "Send Magic Link"
                    : mode === "signup"
                      ? "Create Account"
                      : "Sign In"}
              </button>
            </form>

            {emailSent && mode === "magic" && (
              <p className="text-green-300 text-xs mt-4">
                Magic link sent. Open your email and continue to your account.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
