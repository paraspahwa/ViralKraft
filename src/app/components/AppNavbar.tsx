import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import { Sparkles, Menu, X, Zap, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "../lib/supabaseClient";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "RetentionAI", href: "#retentionai", badge: "NEW" },
];

export function AppNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/create";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      navigate("/", { replace: true });
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || "Failed to sign out");
      return;
    }

    toast.success("Signed out successfully");
    navigate("/", { replace: true });
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isDashboard
          ? "backdrop-blur-2xl bg-[#03000f]/85 shadow-2xl shadow-purple-950/20 border-b border-purple-500/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.button
            className="flex items-center gap-2.5 cursor-pointer"
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate("/")}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-white tracking-tight"
              style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "1.15rem" }}
            >
              Viral<span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #A78BFA, #06B6D4)" }}>Craft</span>
              <span className="text-white/40 text-xs ml-1">AI</span>
            </span>
          </motion.button>

          {/* Desktop Links */}
          {!isDashboard && (
            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={isHome ? link.href : `/${link.href}`}
                  className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors duration-200 text-sm"
                >
                  {link.label}
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[0.6rem] rounded-full bg-purple-500/25 text-purple-300 border border-purple-500/30">
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}

          {isDashboard && (
            <div className="hidden md:flex items-center gap-6 text-sm">
              <button
                onClick={() => navigate("/")}
                className="text-white/50 hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-white/60 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/create")}
                className="text-purple-300 hover:text-purple-200 transition-colors"
              >
                Create Video
              </button>
            </div>
          )}

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isDashboard ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => void handleSignOut()}
                  className="px-4 py-2 text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/25 rounded-xl transition-all"
                >
                  Sign Out
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/create")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", boxShadow: "0 4px 24px rgba(139,92,246,0.35)" }}
                >
                  <Zap className="w-3.5 h-3.5" />
                  New Video
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/25 rounded-xl transition-all"
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/startfree")}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-xl"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Start Free
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white/70 hover:text-white p-1"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#03000f]/97 backdrop-blur-xl border-t border-white/5"
          >
            <div className="px-6 py-5 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={isHome ? link.href : `/${link.href}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-white/60 hover:text-white text-sm flex items-center gap-2"
                >
                  {link.label}
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[0.6rem] rounded-full bg-purple-500/25 text-purple-300">
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}
              {isDashboard ? (
                <div className="flex flex-col gap-2 pt-3 border-t border-white/8">
                  <button
                    onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}
                    className="w-full py-2.5 text-sm text-white/70 border border-white/10 rounded-xl"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { navigate("/create"); setMenuOpen(false); }}
                    className="w-full py-2.5 text-sm text-white rounded-xl"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
                  >
                    New Video
                  </button>
                  <button
                    onClick={() => { void handleSignOut(); setMenuOpen(false); }}
                    className="w-full py-2.5 text-sm text-white/70 border border-white/10 rounded-xl"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-3 border-t border-white/8">
                  <button
                    onClick={() => { navigate("/login"); setMenuOpen(false); }}
                    className="w-full py-2.5 text-sm text-white/70 border border-white/10 rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { navigate("/startfree"); setMenuOpen(false); }}
                    className="w-full py-2.5 text-sm text-white rounded-xl"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
                  >
                    Start Free — No Credit Card
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
