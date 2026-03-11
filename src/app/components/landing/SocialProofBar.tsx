import { motion, useInView } from "motion/react";
import { useRef } from "react";

const platforms = [
  { name: "TikTok", icon: "🎵" },
  { name: "Instagram Reels", icon: "📸" },
  { name: "YouTube Shorts", icon: "▶️" },
  { name: "Facebook Reels", icon: "👍" },
  { name: "Snapchat", icon: "👻" },
  { name: "Pinterest", icon: "📌" },
];

const stats = [
  { value: "2.8B+", label: "Videos Generated" },
  { value: "125%", label: "Market Growth 2025" },
  { value: "< 90s", label: "Avg Creation Time" },
  { value: "4.9★", label: "User Rating" },
];

export function SocialProofBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative py-10 px-4 border-y border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Platform icons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center items-center gap-5 mb-8"
        >
          <span className="text-white/25 text-xs mr-2">Export to:</span>
          {platforms.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="flex items-center gap-1.5 text-white/40 text-sm hover:text-white/70 transition-colors cursor-default"
            >
              <span>{p.icon}</span>
              <span style={{ fontFamily: "Space Grotesk, sans-serif" }}>{p.name}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className="text-center p-4 rounded-xl border border-white/5 bg-white/2"
            >
              <div
                className="text-white mb-1"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  background: i % 2 === 0
                    ? "linear-gradient(135deg, #A78BFA, #06B6D4)"
                    : "linear-gradient(135deg, #06B6D4, #EC4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {s.value}
              </div>
              <p className="text-white/40 text-xs">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
