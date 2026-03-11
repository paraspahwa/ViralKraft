import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { TrendingUp, PenLine, Wand2, Download } from "lucide-react";

const steps = [
  {
    icon: TrendingUp,
    number: "01",
    title: "Pick a Trending Topic",
    description: "Use our Trend Scanner or enter your own idea. Our AI suggests viral hooks and scripts based on what's blowing up right now in your niche.",
    color: "#A78BFA",
    tip: "💡 Trend Scanner refreshes every 6 hours",
  },
  {
    icon: PenLine,
    number: "02",
    title: "Write or Generate Script",
    description: "Paste your script or let AI write it. Our RetentionAI™ analyzes and rewrites it for maximum watch time with hooks, re-engagement moments, and pacing.",
    color: "#06B6D4",
    tip: "🧠 RetentionAI™ analyzes 50M+ viral patterns",
  },
  {
    icon: Wand2,
    number: "03",
    title: "Customize & Generate",
    description: "Choose your AI avatar, voice, caption style, and background. Hit generate and watch your video appear in under 90 seconds — fully optimized.",
    color: "#EC4899",
    tip: "⚡ Average generation time: 87 seconds",
  },
  {
    icon: Download,
    number: "04",
    title: "Export & Go Viral",
    description: "One click exports your video for TikTok, Reels, Shorts, and more — each platform-optimized. Schedule directly or download in 4K.",
    color: "#34D399",
    tip: "📤 5 platforms, 1 click, zero re-editing",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs mb-4">
            ⚡ Fast & Simple
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
            From Idea to{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #06B6D4, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Viral Video
            </span>{" "}
            in 4 Steps
          </h2>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            No video editing skills needed. No camera. No face. Just your idea and 90 seconds.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-10 left-0 right-0 px-24">
            <div
              className="h-px w-full"
              style={{
                background: "linear-gradient(90deg, #A78BFA50, #06B6D450, #EC489950, #34D39950)",
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="relative"
                >
                  {/* Step number bg */}
                  <div
                    className="absolute -top-3 -left-1 text-6xl font-black select-none pointer-events-none opacity-[0.035]"
                    style={{ fontFamily: "Space Grotesk, sans-serif", color: step.color }}
                  >
                    {step.number}
                  </div>

                  <div className="relative text-center">
                    {/* Icon bubble */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="relative mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-5 cursor-default"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}20, ${step.color}08)`,
                        border: `1px solid ${step.color}30`,
                        boxShadow: `0 0 30px ${step.color}15`,
                      }}
                    >
                      <Icon className="w-7 h-7" style={{ color: step.color }} />
                      <div
                        className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[0.6rem] font-bold"
                        style={{ background: step.color }}
                      >
                        {i + 1}
                      </div>
                    </motion.div>

                    <h3
                      className="text-white mb-2"
                      style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: "0.9rem" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-white/45 text-xs leading-relaxed mb-3">{step.description}</p>

                    {/* Tip */}
                    <div
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[0.62rem]"
                      style={{ background: `${step.color}12`, color: step.color }}
                    >
                      {step.tip}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 50px rgba(139,92,246,0.4)" }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 text-white rounded-xl text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              boxShadow: "0 4px 30px rgba(139,92,246,0.3)",
            }}
          >
            ✨ Try It Free — Create Your First Video Now
          </motion.button>
          <p className="text-white/25 text-xs mt-3">
            No credit card • 14-day free trial • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
