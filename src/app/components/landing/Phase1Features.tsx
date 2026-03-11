import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Video, Mic2, Type, Users, Share2,
  Play, Waves, Subtitles, MonitorSmartphone, Wand2
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Text-to-Video Generation",
    description: "Write your script and watch AI transform it into a cinematic 9:16 video optimized for short-form feeds. Auto-selects B-roll, transitions, and pacing.",
    tag: "Core",
    color: "#A78BFA",
    glow: "rgba(167,139,250,0.15)",
    demo: "🎬 Generating 60s reel from script...",
  },
  {
    icon: Mic2,
    title: "AI Voiceover — 50+ Languages",
    description: "Natural-sounding voices with ElevenLabs-quality synthesis. Choose from 50+ languages, 200+ voices, and control emotion — not just text-to-speech.",
    tag: "Phase 1",
    color: "#06B6D4",
    glow: "rgba(6,182,212,0.15)",
    demo: "🎙️ Rendering voice: English (US) — Excited",
  },
  {
    icon: Subtitles,
    title: "Animated Auto-Captions",
    description: "Trending TikTok-style captions that appear word-by-word with customizable fonts, colors, and animations. Proven to boost watch time by 40%.",
    tag: "Phase 1",
    color: "#EC4899",
    glow: "rgba(236,72,153,0.15)",
    demo: "💬 Caption style: Neon Pop · Word highlight",
  },
  {
    icon: Users,
    title: "Character Consistency",
    description: "Your AI avatar stays consistent across every video in your series. Same face, same voice, same style — building your brand without showing your real face.",
    tag: "Phase 1",
    color: "#34D399",
    glow: "rgba(52,211,153,0.15)",
    demo: "🧑‍💼 Avatar: Alex — Finance Host v3",
  },
  {
    icon: MonitorSmartphone,
    title: "Multi-Platform Export",
    description: "One click exports optimized for TikTok, Instagram Reels, YouTube Shorts, Facebook Reels, and Snapchat — each with platform-perfect specs.",
    tag: "Phase 1",
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.15)",
    demo: "📤 Exporting to 5 platforms simultaneously...",
  },
  {
    icon: Wand2,
    title: "9:16 Scene AI Director",
    description: "Our AI director knows where to cut, zoom, and transition for maximum scroll-stopping impact. Every frame is optimized for vertical viewing.",
    tag: "Core",
    color: "#A78BFA",
    glow: "rgba(167,139,250,0.15)",
    demo: "🎥 Scene direction: Dynamic zoom at 0:04s",
  },
];

export function Phase1Features() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="relative py-24 px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs mb-4"
          >
            🚀 Phase 1 — Launch Features
          </span>
          <h2
            className="text-white mb-4"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Everything You Need to{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #A78BFA, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Go Viral Today
            </span>
          </h2>
          <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
            The complete toolkit that faceless creators need — built for 2026 algorithm changes, not 2024 automation trends.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className="relative rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5 cursor-default group transition-all duration-300 overflow-hidden"
              >
                {/* Background glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${f.glow}, transparent 70%)` }}
                />
                {/* Top accent border */}
                <div
                  className="absolute top-0 left-4 right-4 h-px rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${f.color}60, transparent)` }}
                />

                <div className="relative">
                  {/* Tag + Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[0.62rem] font-medium"
                      style={{
                        background: `${f.color}18`,
                        color: f.color,
                        border: `1px solid ${f.color}25`,
                      }}
                    >
                      {f.tag}
                    </span>
                  </div>

                  <h3
                    className="text-white mb-2"
                    style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: "0.95rem" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-white/45 text-sm leading-relaxed mb-4">{f.description}</p>

                  {/* Live demo hint */}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: f.color }} />
                    <span className="text-white/35">{f.demo}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
