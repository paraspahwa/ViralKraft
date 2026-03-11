import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router";
import { Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppNavbar } from "../components/AppNavbar";
import { CinematicBackground } from "../components/CinematicBackground";
import { getSupabaseBrowserClient, hasSupabaseBrowserConfig } from "../lib/supabaseClient";

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

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
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

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      toast.error("Auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }

    try {
      setLoading(true);
      const redirectTo = `${window.location.origin}${nextPath}`;
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast.success("Magic link sent. Check your inbox.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send magic link");
    } finally {
      setLoading(false);
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
            <p className="text-white/50 text-sm mb-6">Use your email to get a magic link. No password needed.</p>

            {!hasSupabaseBrowserConfig() && (
              <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-amber-200 text-xs">
                Auth is not configured in this environment. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
              </div>
            )}

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

              <button
                type="submit"
                disabled={loading || !hasSupabaseBrowserConfig()}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                  boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
                }}
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>

            {emailSent && (
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
