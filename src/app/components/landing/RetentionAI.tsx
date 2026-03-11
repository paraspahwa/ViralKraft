import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Brain, Eye, Clock, TrendingUp, Zap, BarChart2 } from "lucide-react";

const retentionData = [
  { time: "0s", you: 100, avg: 100, label: "Hook" },
  { time: "5s", you: 95, avg: 78, label: "Intro" },
  { time: "15s", you: 88, avg: 61, label: "Value drop" },
  { time: "30s", you: 82, avg: 48, label: "Mid-point" },
  { time: "45s", you: 76, avg: 35, label: "Re-hook" },
  { time: "60s", you: 72, avg: 24, label: "CTA" },
];

const aiInsights = [
  { icon: Eye, label: "Scroll-Stop Hook", value: "0.0–1.5s", desc: "AI detected low-energy opener. Auto-inserted visual hook.", color: "#EC4899" },
  { icon: Zap, label: "Re-Engagement Trigger", value: "22s mark", desc: "Pattern interrupt added to prevent drop-off at 20s cliff.", color: "#A78BFA" },
  { icon: Brain, label: "Pacing Optimization", value: "18 cuts/min", desc: "Cut frequency adjusted to match viral content pattern.", color: "#06B6D4" },
  { icon: TrendingUp, label: "CTA Placement", value: "58s mark", desc: "Call-to-action placed at peak engagement moment.", color: "#34D399" },
];

export function RetentionAI() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeInsight, setActiveInsight] = useState(0);

  return (
    <section id="retentionai" ref={ref} className="relative py-24 px-4 scroll-mt-24">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 30% 60%, rgba(167,139,250,0.07) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs mb-4">
            <Brain className="w-3 h-3" />
            RetentionAI™ — Exclusive Technology
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
            AI That Keeps Viewers{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #A78BFA, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Glued to Your Video
            </span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-sm leading-relaxed">
            Trained on 50M+ viral short videos, RetentionAI™ analyzes and rewrites your video structure in real-time 
            to maximize watch time — the metric that 2026 algorithms reward most.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Retention chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="rounded-2xl border border-white/8 bg-white/3 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white text-sm font-semibold mb-0.5" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  Retention Curve Comparison
                </h3>
                <p className="text-white/40 text-xs">ViralCraft AI vs Industry Average</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-0.5 rounded-full bg-purple-400" />
                  <span className="text-white/50 text-xs">ViralCraft</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-0.5 rounded-full bg-white/20" style={{ borderTop: "2px dashed rgba(255,255,255,0.2)" }} />
                  <span className="text-white/30 text-xs">Avg AI</span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="relative h-44 mb-4">
              {/* Y axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between">
                {[100, 75, 50, 25, 0].map((v) => (
                  <span key={v} className="text-white/20 text-[0.6rem]">{v}%</span>
                ))}
              </div>

              {/* Grid lines */}
              <div className="absolute left-7 right-0 top-0 bottom-0">
                {[0, 25, 50, 75, 100].map((v) => (
                  <div
                    key={v}
                    className="absolute w-full border-t border-white/5"
                    style={{ bottom: `${v}%` }}
                  />
                ))}

                {/* SVG lines */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  {/* Industry average - dashed */}
                  <polyline
                    points={retentionData.map((d, i) => `${(i / (retentionData.length - 1)) * 100}%,${100 - d.avg}%`).join(" ")}
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* ViralCraft - filled */}
                  <defs>
                    <linearGradient id="retentionGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#A78BFA" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    <linearGradient id="retentionFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(167,139,250,0.15)" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={[
                      ...retentionData.map((d, i) => `${(i / (retentionData.length - 1)) * 100}%,${100 - d.you}%`),
                      "100%,100%", "0%,100%"
                    ].join(" ")}
                    fill="url(#retentionFill)"
                  />
                  <polyline
                    points={retentionData.map((d, i) => `${(i / (retentionData.length - 1)) * 100}%,${100 - d.you}%`).join(" ")}
                    fill="none"
                    stroke="url(#retentionGrad)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Dots */}
                  {retentionData.map((d, i) => (
                    <circle
                      key={i}
                      cx={`${(i / (retentionData.length - 1)) * 100}%`}
                      cy={`${100 - d.you}%`}
                      r="3"
                      fill="#A78BFA"
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* X axis */}
            <div className="flex justify-between pl-7">
              {retentionData.map((d) => (
                <span key={d.time} className="text-white/25 text-[0.6rem]">{d.time}</span>
              ))}
            </div>

            {/* Comparison stats */}
            <div className="mt-5 flex gap-3">
              <div className="flex-1 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <p className="text-purple-300 font-bold text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>72%</p>
                <p className="text-white/40 text-xs">ViralCraft Avg Retention</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-white/4 border border-white/8 text-center">
                <p className="text-white/40 font-bold text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>24%</p>
                <p className="text-white/30 text-xs">Industry Avg Retention</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                <p className="text-cyan-300 font-bold text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>3×</p>
                <p className="text-white/40 text-xs">Better Watch Time</p>
              </div>
            </div>
          </motion.div>

          {/* AI insights panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <h3 className="text-white text-sm font-semibold mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              RetentionAI™ Real-Time Insights
            </h3>

            <div className="flex flex-col gap-3 mb-5">
              {aiInsights.map((insight, i) => {
                const Icon = insight.icon;
                return (
                  <motion.div
                    key={insight.label}
                    onClick={() => setActiveInsight(i)}
                    whileHover={{ x: 4 }}
                    className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      activeInsight === i
                        ? "border-white/20 bg-white/6"
                        : "border-white/6 bg-white/2 hover:border-white/12"
                    }`}
                  >
                    {activeInsight === i && (
                      <div
                        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                        style={{ background: insight.color }}
                      />
                    )}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${insight.color}18` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: insight.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-xs font-medium">{insight.label}</span>
                          <span
                            className="text-xs font-mono px-2 py-0.5 rounded-md"
                            style={{ color: insight.color, background: `${insight.color}15` }}
                          >
                            {insight.value}
                          </span>
                        </div>
                        <p className="text-white/40 text-xs leading-relaxed">{insight.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom stat */}
            <div
              className="p-4 rounded-xl border border-purple-500/20"
              style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(6,182,212,0.05))" }}
            >
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-white text-xs font-semibold mb-0.5">Trained on 50M+ viral videos</p>
                  <p className="text-white/40 text-xs">RetentionAI™ continuously learns from newly viral content — your videos get smarter every week automatically.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
