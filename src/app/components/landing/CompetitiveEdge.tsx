import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Check, X, Minus } from "lucide-react";

const competitors = [
  { name: "ViralCraft AI", isUs: true, rating: "4.9★" },
  { name: "FacelessVideo.ai", isUs: false, rating: "1.9★ ⚠️" },
  { name: "InVideo AI", isUs: false, rating: "3.8★" },
  { name: "Pictory", isUs: false, rating: "4.0★" },
];

type CellValue = true | false | "partial" | "soon";

interface CompareRow {
  feature: string;
  values: CellValue[];
}

const compareRows: CompareRow[] = [
  { feature: "RetentionAI™ Optimization", values: [true, false, false, false] },
  { feature: "9:16 Native Generation", values: [true, "partial", true, "partial"] },
  { feature: "Emotional Voice Control", values: [true, false, false, false] },
  { feature: "Trend Scanner (24-48h early)", values: [true, false, false, false] },
  { feature: "Transparent Pricing", values: [true, false, true, true] },
  { feature: "Instant Refund Policy", values: [true, false, "partial", true] },
  { feature: "Character Consistency", values: [true, "partial", "partial", false] },
  { feature: "Multi-Platform 1-click Export", values: [true, true, "partial", "partial"] },
  { feature: "Algorithm-Native Pacing", values: [true, false, false, false] },
  { feature: "Free Trial — No Card", values: [true, false, false, true] },
];

function Cell({ value, isUs }: { value: CellValue; isUs: boolean }) {
  if (value === true)
    return (
      <div className="flex justify-center">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isUs ? "bg-purple-500/20" : "bg-green-500/15"
          }`}
        >
          <Check className={`w-3.5 h-3.5 ${isUs ? "text-purple-300" : "text-green-400"}`} />
        </div>
      </div>
    );
  if (value === false)
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <X className="w-3.5 h-3.5 text-red-400/60" />
        </div>
      </div>
    );
  if (value === "partial")
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center">
          <Minus className="w-3.5 h-3.5 text-yellow-400/60" />
        </div>
      </div>
    );
  return <span className="text-cyan-400 text-xs text-center block">Soon</span>;
}

export function CompetitiveEdge() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-xs mb-4">
            🏆 Why ViralCraft Wins
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
            See How We Stack Up{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #34D399, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Against the Competition
            </span>
          </h2>
          <p className="text-white/50 text-sm max-w-lg mx-auto">
            The market is huge and growing fast. But current players are failing creators. 
            We're the premium, algorithm-optimized, trustworthy alternative.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden"
        >
          {/* Header row */}
          <div className="grid border-b border-white/8" style={{ gridTemplateColumns: "1fr repeat(4, auto)" }}>
            <div className="px-5 py-4 text-white/40 text-xs">Feature</div>
            {competitors.map((c, i) => (
              <div
                key={c.name}
                className={`px-4 py-4 text-center min-w-[110px] ${
                  c.isUs ? "bg-purple-500/8 border-l border-purple-500/20" : ""
                }`}
              >
                <p
                  className={`text-xs font-semibold mb-0.5 ${c.isUs ? "text-purple-300" : "text-white/60"}`}
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {c.name}
                </p>
                <p className={`text-[0.6rem] ${c.isUs ? "text-purple-400" : "text-white/30"}`}>{c.rating}</p>
              </div>
            ))}
          </div>

          {/* Data rows */}
          {compareRows.map((row, ri) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + ri * 0.04, duration: 0.4 }}
              className="grid border-b border-white/5 last:border-b-0 hover:bg-white/2 transition-colors"
              style={{ gridTemplateColumns: "1fr repeat(4, auto)" }}
            >
              <div className="px-5 py-3 flex items-center">
                <span className="text-white/60 text-xs">{row.feature}</span>
              </div>
              {row.values.map((v, ci) => (
                <div
                  key={ci}
                  className={`px-4 py-3 flex items-center justify-center min-w-[110px] ${
                    ci === 0 ? "bg-purple-500/5 border-l border-purple-500/15" : ""
                  }`}
                >
                  <Cell value={v} isUs={ci === 0} />
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center text-white/25 text-xs mt-4"
        >
          ✓ = Full support &nbsp;|&nbsp; − = Partial support &nbsp;|&nbsp; ✗ = Not available &nbsp;|&nbsp; ⚠️ = User-reported billing issues
        </motion.p>
      </div>
    </section>
  );
}
