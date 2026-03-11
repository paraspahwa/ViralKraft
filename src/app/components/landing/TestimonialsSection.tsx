import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Star, TrendingUp } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    handle: "@sarahviraltech",
    platform: "TikTok Creator",
    avatar: "SC",
    color: "#A78BFA",
    views: "8.2M views",
    rating: 5,
    text: "ViralCraft's RetentionAI™ changed everything. My watch time went from 18% to 71% in 2 weeks. I had a video hit 8.2M views — all without showing my face. This is legitimately the best AI video tool I've used.",
  },
  {
    name: "Marcus Williams",
    handle: "@mw_finance",
    platform: "YouTube Shorts Creator",
    avatar: "MW",
    color: "#06B6D4",
    views: "3.1M views",
    rating: 5,
    text: "I switched from FacelessVideo.ai (which literally charged my card 3 times without consent) to ViralCraft. Night and day difference. Transparent billing, incredible AI voices, and my Shorts are actually performing.",
  },
  {
    name: "Priya Nair",
    handle: "@priyanairlifestyle",
    platform: "Instagram Reels Creator",
    avatar: "PN",
    color: "#EC4899",
    views: "12M views",
    rating: 5,
    text: "The Trend Scanner told me about a topic 48 hours before it blew up. I had my video ready and it hit 12M views in 4 days. I make $8K/month from ad revenue now — all faceless, all ViralCraft.",
  },
  {
    name: "Jake Torres",
    handle: "@jakedigitalagency",
    platform: "Digital Agency Owner",
    avatar: "JT",
    color: "#34D399",
    views: "50+ clients",
    rating: 5,
    text: "We run the Agency plan for 50 clients. The API is rock solid, the white-label option means our clients never know we're using ViralCraft, and the quality genuinely outperforms our previous video editors.",
  },
  {
    name: "Aisha Okonkwo",
    handle: "@aishaeducation",
    platform: "Educational Content Creator",
    avatar: "AO",
    color: "#F59E0B",
    views: "4.7M views",
    rating: 5,
    text: "The character consistency feature is mind-blowing. My AI avatar 'Professor Aisha' has her own personality and stays consistent across 200+ videos. My subscribers think I'm real!",
  },
  {
    name: "Ryan Nakamura",
    handle: "@ryanhustletips",
    platform: "Business Content Creator",
    avatar: "RN",
    color: "#A78BFA",
    views: "2.9M views",
    rating: 5,
    text: "Went from 0 to 2.9M views in 60 days using only ViralCraft. The voice emotion control makes my content feel authentic, not robotic. Other tools sound like robots. This sounds human.",
  },
];

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-xs mb-4">
            ⭐ Real Results from Real Creators
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
            50,000+ Creators.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Billions of Views.
            </span>
          </h2>
          <p className="text-white/50 text-sm">
            Join creators who switched from robotic competitors to algorithm-optimized AI video.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.09, duration: 0.5 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="relative rounded-2xl border border-white/8 bg-white/3 p-5 cursor-default group transition-all duration-300 hover:border-white/15 overflow-hidden"
            >
              {/* Hover glow */}
              <div
                className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400 blur-2xl"
                style={{ background: `${t.color}25` }}
              />

              <div className="relative">
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Views badge */}
                <div
                  className="absolute top-0 right-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                  style={{ background: `${t.color}15`, color: t.color }}
                >
                  <TrendingUp className="w-3 h-3" />
                  {t.views}
                </div>

                <p className="text-white/60 text-sm leading-relaxed mb-4 pr-2">{t.text}</p>

                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}80)` }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p
                      className="text-white text-xs font-semibold"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {t.name}
                    </p>
                    <p className="text-white/30 text-[0.65rem]">
                      {t.handle} · {t.platform}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
