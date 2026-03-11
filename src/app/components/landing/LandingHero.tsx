import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Sparkles, Play, ArrowRight, Video, Mic, Type, Zap,
  TrendingUp, Star, ChevronRight
} from "lucide-react";

const floatingTags = [
  { label: "9:16 Optimized", icon: "📱", delay: 0 },
  { label: "50+ AI Voices", icon: "🎙️", delay: 0.15 },
  { label: "Auto Captions", icon: "💬", delay: 0.3 },
  { label: "TikTok Ready", icon: "🎵", delay: 0.45 },
  { label: "RetentionAI™", icon: "🧠", delay: 0.6 },
  { label: "Viral Trends", icon: "🔥", delay: 0.75 },
];

const videoExamples = [
  { title: "Top 10 Money Facts", niche: "Finance", views: "2.1M", platform: "TikTok" },
  { title: "AI Tools You Need", niche: "Tech", views: "890K", platform: "Reels" },
  { title: "History of Rome", niche: "Education", views: "1.4M", platform: "Shorts" },
];

export function LandingHero() {
  const navigate = useNavigate();
  const [activeNiche, setActiveNiche] = useState(0);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
      {/* Radial glow top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.2) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400" />
              </span>
              <span className="text-purple-300 text-xs">
                🚀 Powered by RetentionAI™ — Go Viral Without Showing Your Face
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
              className="text-white mb-5"
            >
              Create{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #A78BFA 0%, #06B6D4 50%, #EC4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Viral Faceless
              </span>
              <br />
              Videos in{" "}
              <span className="relative">
                <span className="text-white">Seconds</span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full origin-left"
                  style={{ background: "linear-gradient(90deg, #A78BFA, #06B6D4)" }}
                />
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="text-white/55 mb-7 leading-relaxed"
              style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}
            >
              The only AI video platform built for 2026 algorithms. 
              Text-to-video with{" "}
              <span className="text-cyan-400">AI voiceovers</span>, 
              animated captions, and{" "}
              <span className="text-purple-400">RetentionAI™</span>{" "}
              that optimizes every second for maximum watch time. 
              No camera. No face. Just viral content.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 50px rgba(139,92,246,0.5)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/dashboard")}
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)",
                  boxShadow: "0 4px 30px rgba(139,92,246,0.35)",
                }}
              >
                <Sparkles className="w-4 h-4" />
                Create Your First Video Free
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white/70 hover:text-white border border-white/10 hover:border-white/25 transition-all text-sm"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.2)" }}
                >
                  <Play className="w-3 h-3 text-purple-400 ml-0.5" />
                </div>
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap gap-4 items-center"
            >
              <div className="flex -space-x-2">
                {["#A78BFA", "#06B6D4", "#EC4899", "#34D399", "#F59E0B"].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-[#03000f] flex items-center justify-center text-[0.55rem] text-white font-bold"
                    style={{ background: c }}
                  >
                    {["AK", "SR", "MJ", "PL", "RV"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/40 text-xs">50,000+ creators already viral</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-white/40 text-xs">
                <span className="text-white/70">No credit card</span> • Cancel anytime
              </div>
            </motion.div>
          </div>

          {/* Right — Video preview mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* Floating tag pills */}
            <div className="absolute -left-8 top-8 z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="flex flex-col gap-2"
              >
                {floatingTags.slice(0, 3).map((tag) => (
                  <motion.div
                    key={tag.label}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: tag.delay }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-white/60"
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <div className="absolute -right-4 bottom-16 z-10">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="flex flex-col gap-2"
              >
                {floatingTags.slice(3).map((tag) => (
                  <motion.div
                    key={tag.label}
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", delay: tag.delay }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-white/60"
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Phone mockup with video */}
            <div className="flex justify-center">
              <div
                className="relative w-52 rounded-[2.5rem] border-2 overflow-hidden shadow-2xl"
                style={{
                  borderColor: "rgba(139,92,246,0.3)",
                  background: "linear-gradient(180deg, #0D0020 0%, #030010 100%)",
                  boxShadow: "0 0 60px rgba(139,92,246,0.2), 0 0 120px rgba(6,182,212,0.1)",
                  aspectRatio: "9/16",
                  maxHeight: "460px",
                }}
              >
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 pt-3 pb-1">
                  <span className="text-white/50 text-[0.55rem]">9:41</span>
                  <div className="w-16 h-4 rounded-full bg-black/60" />
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-white/30" />
                    <div className="w-2 h-2 rounded-full bg-white/30" />
                  </div>
                </div>

                {/* Video content area */}
                <div className="flex-1 relative px-3 pb-3">
                  {/* Animated gradient video bg */}
                  <div
                    className="w-full rounded-2xl overflow-hidden relative"
                    style={{ aspectRatio: "9/16", background: "linear-gradient(180deg, #1a0040 0%, #000d1a 100%)" }}
                  >
                    {/* Animated bg orb */}
                    <motion.div
                      animate={{
                        background: [
                          "radial-gradient(circle at 30% 40%, rgba(139,92,246,0.4) 0%, transparent 60%)",
                          "radial-gradient(circle at 70% 60%, rgba(6,182,212,0.4) 0%, transparent 60%)",
                          "radial-gradient(circle at 50% 30%, rgba(236,72,153,0.3) 0%, transparent 60%)",
                          "radial-gradient(circle at 30% 40%, rgba(139,92,246,0.4) 0%, transparent 60%)",
                        ]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute inset-0"
                    />

                    {/* Caption overlay */}
                    <div className="absolute bottom-16 left-0 right-0 px-3">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeNiche}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-center"
                        >
                          <div
                            className="inline-block px-2 py-1 rounded-lg mb-1 text-white text-xs font-bold"
                            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
                          >
                            Did you know?
                          </div>
                          <div
                            className="text-white text-sm font-bold leading-tight px-1"
                            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
                          >
                            {videoExamples[activeNiche].title}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Stats */}
                    <div className="absolute top-3 right-2 flex flex-col items-center gap-3">
                      <div className="flex flex-col items-center">
                        <TrendingUp className="w-5 h-5 text-white/80" />
                        <span className="text-white/60 text-[0.55rem] mt-0.5">{videoExamples[activeNiche].views}</span>
                      </div>
                    </div>

                    {/* Platform badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className="text-[0.55rem] px-1.5 py-0.5 rounded-full text-white font-medium"
                        style={{ background: "rgba(139,92,246,0.6)" }}
                      >
                        {videoExamples[activeNiche].platform}
                      </span>
                    </div>

                    {/* Play button center */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                      >
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Bottom nav bar indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full bg-white/30" />
              </div>
            </div>

            {/* Niche selector */}
            <div className="flex justify-center gap-2 mt-5">
              {videoExamples.map((v, i) => (
                <button
                  key={v.niche}
                  onClick={() => setActiveNiche(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                    activeNiche === i
                      ? "text-white border border-purple-500/40 bg-purple-500/15"
                      : "text-white/35 border border-white/8 hover:border-white/15"
                  }`}
                >
                  {v.niche}
                </button>
              ))}
            </div>

            {/* Stats below phone */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-5 flex items-center justify-center gap-4"
            >
              {[
                { label: "Avg Views", value: "850K+" },
                { label: "Retention Rate", value: "72%" },
                { label: "Time to Create", value: "< 2 min" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p
                    className="text-white"
                    style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "0.95rem" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-white/30 text-[0.65rem]">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
