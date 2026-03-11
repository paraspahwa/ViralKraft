import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Brain, Shield, Mic, TrendingUp, Zap, Award } from "lucide-react";

const differentiators = [
  {
    icon: Brain,
    title: "RetentionAI™",
    subtitle: "Your Unfair Advantage",
    description: "The only platform that analyzes and optimizes video pacing for watch time. RetentionAI™ studies 50M+ viral videos to place hooks, cuts, and re-engagement moments at the exact milliseconds that prevent scrolling.",
    highlight: "Avg +38% watch time vs standard AI video",
    color: "#A78BFA",
    badge: "Exclusive",
  },
  {
    icon: Shield,
    title: "Trust & Safety First",
    subtitle: "No Scams. No Hidden Fees.",
    description: "While FacelessVideo.ai has a 1.9-star rating for billing fraud, we offer instant refunds, transparent pricing, and a 14-day free trial with no card required. Your trust is our competitive moat.",
    highlight: "4.9★ rating • Instant refund policy",
    color: "#34D399",
    badge: "Trustworthy",
  },
  {
    icon: Mic,
    title: "VoiceClone™ with Emotion",
    subtitle: "Not Just Text-to-Speech",
    description: "Clone any voice with 30 seconds of audio, then control emotion — excitement, urgency, calm, humor. Our emotion engine makes viewers feel connected, not robotic. 200+ premium voice presets included.",
    highlight: "Clone your voice or choose from 200+ presets",
    color: "#06B6D4",
    badge: "Phase 2",
  },
  {
    icon: TrendingUp,
    title: "Trend Scanner",
    subtitle: "Viral Topics Before They Peak",
    description: "Our AI scans TikTok, Reels, and Shorts every 6 hours to identify trending topics 24-48 hours before they peak. Get AI-generated scripts for trending content automatically delivered to your dashboard.",
    highlight: "24-48h early trend detection across 12 platforms",
    color: "#EC4899",
    badge: "Phase 2",
  },
];

export function Phase2Differentiators() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-24 px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 70% 50%, rgba(6,182,212,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs mb-4">
            ⚡ Phase 2 — Where You Win
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
            Your{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #06B6D4, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Competitive Moat
            </span>{" "}
            — Features No One Else Has
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-sm leading-relaxed">
            While competitors deliver robotic voices and charge hidden fees, ViralCraft gives you premium quality, 
            honest pricing, and algorithm-native intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {differentiators.map((d, i) => {
            const Icon = d.icon;
            return (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                whileHover={{ y: -4 }}
                className="relative rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-6 group overflow-hidden transition-all duration-300 hover:border-white/15"
              >
                {/* Hover glow */}
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                  style={{ background: `${d.color}20` }}
                />

                <div className="relative">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${d.color}18`, border: `1px solid ${d.color}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: d.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3
                          className="text-white"
                          style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "1rem" }}
                        >
                          {d.title}
                        </h3>
                        <span
                          className="px-1.5 py-0.5 rounded-full text-[0.58rem] font-semibold"
                          style={{ background: `${d.color}25`, color: d.color }}
                        >
                          {d.badge}
                        </span>
                      </div>
                      <p className="text-white/40 text-xs">{d.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-white/55 text-sm leading-relaxed mb-4">{d.description}</p>

                  {/* Highlight */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: `${d.color}12`, border: `1px solid ${d.color}25` }}
                  >
                    <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: d.color }} />
                    <span className="text-xs font-medium" style={{ color: d.color }}>
                      {d.highlight}
                    </span>
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
