import { motion } from "motion/react";
import { Sparkles, Twitter, Instagram, Youtube, Github, Mail, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

const footerLinks = {
  Product: ["Features", "RetentionAI™", "VoiceClone™", "Trend Scanner", "Pricing", "Changelog"],
  Creators: ["Getting Started", "Video Templates", "Niche Guides", "Community", "Affiliate Program"],
  Company: ["About Us", "Blog", "Careers", "Press Kit", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Refund Policy", "Cookie Policy"],
};

export function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="relative pt-20 pb-8 px-4 border-t border-white/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden mb-16 p-10 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(6,182,212,0.08) 50%, rgba(236,72,153,0.08) 100%)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.1), transparent 70%)" }}
          />

          <div className="relative">
            <h3
              className="text-white mb-3"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Ready to Create Your First{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #A78BFA, #06B6D4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Viral Video?
              </span>
            </h3>
            <p className="text-white/50 text-sm mb-7 max-w-lg mx-auto">
              Join 50,000+ creators generating billions of views without showing their face. Start free. No card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(139,92,246,0.5)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login?next=/dashboard")}
                className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-white text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                  boxShadow: "0 4px 24px rgba(139,92,246,0.35)",
                }}
              >
                <Sparkles className="w-4 h-4" />
                Start Free — No Card Required
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-white/70 border border-white/10 text-sm"
              >
                Watch a 2-min Demo
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 mb-4"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-white"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "1.1rem" }}
              >
                Viral<span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #A78BFA, #06B6D4)" }}>Craft</span>
                <span className="text-white/30 text-xs ml-1">AI</span>
              </span>
            </button>
            <p className="text-white/35 text-xs leading-relaxed mb-5 max-w-xs">
              The world's most advanced AI faceless video platform. Built for 2026 algorithms. Trusted by 50,000+ creators.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "YouTube" },
                { icon: Github, label: "GitHub" },
              ].map(({ icon: Icon, label }) => (
                <motion.a
                  key={label}
                  href="#"
                  aria-label={label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/35 hover:text-purple-300 hover:border-purple-500/30 transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([cat, links]) => (
            <div key={cat}>
              <h4
                className="text-white/60 text-xs uppercase tracking-wider mb-4"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                {cat}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-white/30 hover:text-purple-300 text-xs transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/5">
          <p className="text-white/20 text-xs">
            © 2026 ViralCraft AI Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-white/20 text-xs">
            <span>125% market growth in 2025</span>
            <span>•</span>
            <span>4.9★ rated by 50,000+ creators</span>
            <span>•</span>
            <span>Made with ❤️ for creators</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
