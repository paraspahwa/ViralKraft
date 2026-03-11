import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";

const plans = [
  {
    name: "Starter",
    icon: Sparkles,
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for creators just getting started",
    color: "#A78BFA",
    popular: false,
    features: [
      "5 videos/month",
      "720p export quality",
      "10 AI voices",
      "Basic captions",
      "TikTok & Reels export",
      "Watermarked output",
    ],
    notIncluded: ["RetentionAI™", "VoiceClone™", "Trend Scanner"],
    cta: "Start Free Forever",
  },
  {
    name: "Creator",
    icon: Zap,
    price: { monthly: 29, yearly: 19 },
    description: "For creators serious about going viral",
    color: "#A78BFA",
    popular: true,
    features: [
      "Unlimited videos",
      "4K export quality",
      "200+ AI voices + emotions",
      "RetentionAI™ optimization",
      "Animated captions (20+ styles)",
      "5 platform export",
      "Character consistency",
      "Trend Scanner access",
      "No watermark",
      "Priority rendering",
    ],
    notIncluded: [],
    cta: "Start 14-Day Free Trial",
  },
  {
    name: "Agency",
    icon: Building2,
    price: { monthly: 99, yearly: 79 },
    description: "For teams, agencies & brands",
    color: "#06B6D4",
    popular: false,
    features: [
      "Everything in Creator",
      "10 team seats",
      "VoiceClone™ — clone any voice",
      "White-label branding",
      "API access",
      "Bulk video generation",
      "Custom AI avatars",
      "Dedicated account manager",
      "SLA uptime guarantee",
      "Early access to new features",
    ],
    notIncluded: [],
    cta: "Start Agency Trial",
  },
];

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" ref={ref} className="relative py-24 px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 80%, rgba(139,92,246,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs mb-4">
            💎 Transparent Pricing — No Hidden Fees, Ever
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
            Simple Pricing.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #A78BFA, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Instant Refunds.
            </span>{" "}
            No Surprises.
          </h2>
          <p className="text-white/50 text-sm mb-6">Unlike competitors — we show you exactly what you pay. Cancel anytime in 2 clicks.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-white/5 border border-white/8">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-lg text-sm transition-all ${
                !yearly ? "bg-purple-500/30 text-purple-200 border border-purple-500/30" : "text-white/40"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm transition-all ${
                yearly ? "bg-purple-500/30 text-purple-200 border border-purple-500/30" : "text-white/40"
              }`}
            >
              Yearly
              <span className="px-1.5 py-0.5 rounded-full text-[0.6rem] bg-green-500/20 text-green-400 border border-green-500/25">
                Save 35%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className={`relative rounded-2xl p-6 border overflow-hidden transition-all duration-300 ${
                  plan.popular
                    ? "border-purple-500/40 bg-gradient-to-b from-purple-500/10 to-purple-900/5"
                    : "border-white/8 bg-white/3"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-medium"
                      style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Top border glow */}
                <div
                  className="absolute top-0 left-4 right-4 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${plan.color}60, transparent)` }}
                />

                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}25` }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: plan.color }} />
                  </div>
                  <div>
                    <h3
                      className="text-white"
                      style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "1rem" }}
                    >
                      {plan.name}
                    </h3>
                    <p className="text-white/35 text-xs">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-end gap-1.5">
                    <span
                      className="text-white"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: "2.8rem",
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      ${yearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-white/35 text-sm mb-1">/month</span>
                    )}
                  </div>
                  {plan.price.monthly === 0 && (
                    <p className="text-green-400 text-xs mt-1">Free forever</p>
                  )}
                  {yearly && plan.price.monthly > 0 && (
                    <p className="text-green-400 text-xs mt-1">
                      Save ${(plan.price.monthly - plan.price.yearly) * 12}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                      <span className="text-white/60 text-xs">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={
                    plan.popular
                      ? {
                          background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                          color: "white",
                          boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.7)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }
                  }
                >
                  {plan.cta}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-8 flex flex-wrap justify-center gap-5"
        >
          {[
            "✅ No credit card for free trial",
            "✅ Instant refunds within 48h",
            "✅ Cancel in 2 clicks",
            "✅ No hidden fees. Ever.",
          ].map((t) => (
            <span key={t} className="text-white/35 text-xs">{t}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
