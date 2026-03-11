import { motion } from "motion/react";
import { FormEvent } from "react";
import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AppNavbar } from "../components/AppNavbar";
import { CinematicBackground } from "../components/CinematicBackground";
import {
  BLOG_POST_PREVIEWS,
  CHANGELOG_ENTRIES,
  FOOTER_PAGE_BY_PATH,
  FOOTER_PAGES,
  LEGAL_DOCUMENTS,
} from "../lib/footerPages";

type PageNarrative = {
  sections: Array<{ title: string; body: string }>;
  faqs: Array<{ q: string; a: string }>;
};

const PAGE_NARRATIVES: Record<string, PageNarrative> = {
  "/features": {
    sections: [
      {
        title: "End-to-End Video Workflow",
        body: "ViralKraft combines ideation, scripting, scene generation, and export in one flow so teams avoid tool-switching overhead and publish with consistent quality.",
      },
      {
        title: "Built for Repeatable Output",
        body: "Templates, reusable prompts, and project-level defaults help creators move from one viral concept to many variations without rebuilding from scratch.",
      },
      {
        title: "Operational Visibility",
        body: "Usage metrics, version history, and review checkpoints make it easier to run content operations as a system rather than one-off experiments.",
      },
    ],
    faqs: [
      { q: "Can I use this as a solo creator?", a: "Yes. The same workflow scales from one-person channels to larger editorial teams." },
      { q: "Do I need editing expertise?", a: "No. The product is designed to remove technical bottlenecks for non-editors." },
      { q: "How quickly can I publish?", a: "Most users can produce a first publish-ready draft in one working session." },
    ],
  },
  "/retention-ai": {
    sections: [
      { title: "Predictive Retention Signals", body: "RetentionAI evaluates hooks, pacing changes, and moment-to-moment narrative tension so creators can improve watch-through before publishing." },
      { title: "Actionable Recommendations", body: "Instead of vague scores, the engine points to exact segments to tighten, reorder, or rewrite for higher completion and replay potential." },
      { title: "Optimized for Short-Form", body: "The analysis is tuned for rapid-consumption formats where first seconds determine whether a viewer stays or swipes away." },
    ],
    faqs: [
      { q: "Does this replace creative judgment?", a: "No. It augments editorial decisions with measurable audience behavior patterns." },
      { q: "Can I test different hooks?", a: "Yes. You can compare alternatives and quickly iterate toward stronger openers." },
      { q: "Is this useful for long-form videos too?", a: "Yes, especially for intros, transitions, and chapter-level pacing." },
    ],
  },
  "/voice-clone": {
    sections: [
      { title: "Consistent Brand Voice", body: "VoiceClone helps channels keep narration style stable across batches, which strengthens recognition and audience trust over time." },
      { title: "Flexible Delivery Control", body: "Adjust cadence, emphasis, and tone to match educational, entertainment, or commentary formats without re-recording sessions." },
      { title: "Production Throughput", body: "Creators can rapidly produce multilingual or variant narrations while preserving message clarity and tone consistency." },
    ],
    faqs: [
      { q: "Can I fine-tune speaking style?", a: "Yes. Tone and pacing controls are designed for practical storytelling use cases." },
      { q: "Is it suitable for daily posting?", a: "Yes. Voice profiles are built for repeat workflows and high publishing cadence." },
      { q: "Can teams share voice presets?", a: "Yes. Shared projects can use common voice configurations for consistency." },
    ],
  },
  "/trend-scanner": {
    sections: [
      { title: "Early Opportunity Detection", body: "Trend Scanner surfaces topics during momentum build-up, allowing creators to publish before saturation peaks." },
      { title: "Niche-Specific Monitoring", body: "Signals are filtered by vertical so teams can focus on relevance, not generic trend noise." },
      { title: "Execution-Ready Insights", body: "Trend insights pair with content angles and keyword direction to speed ideation-to-publish cycles." },
    ],
    faqs: [
      { q: "How often are trends refreshed?", a: "Continuously, with practical relevance prioritized over vanity spikes." },
      { q: "Can I track multiple niches?", a: "Yes. Workspaces can monitor multiple categories in parallel." },
      { q: "Will this replace manual research?", a: "It reduces manual load significantly, while still supporting strategic editorial judgment." },
    ],
  },
  "/pricing": {
    sections: [
      { title: "Transparent Plans", body: "Plans are structured for clear usage boundaries and predictable costs, with upgrade paths aligned to creator growth stages." },
      { title: "Flexible Billing", body: "Monthly and yearly options support both short experimentation cycles and long-term content operations planning." },
      { title: "Team-Ready Expansion", body: "As production volume grows, advanced capabilities and collaboration features become available without migration friction." },
    ],
    faqs: [
      { q: "Can I start free and upgrade later?", a: "Yes. You can start with lightweight usage and upgrade when publishing volume increases." },
      { q: "Can I change billing cycle?", a: "Yes. Billing options are flexible and can be adjusted as needed." },
      { q: "Do teams get shared workflow features?", a: "Yes. Higher tiers include collaboration and operational controls." },
    ],
  },
  "/changelog": {
    sections: [
      { title: "Release Transparency", body: "The changelog records product updates, behavior changes, and improvement context so users can adapt confidently." },
      { title: "Operational Confidence", body: "Teams can track enhancements affecting scripts, exports, and analytics without guessing what changed." },
      { title: "Forward Momentum", body: "Roadmap-aligned updates are documented to help customers plan workflows around upcoming capabilities." },
    ],
    faqs: [
      { q: "How frequently is it updated?", a: "Major and minor releases are documented on an ongoing basis." },
      { q: "Will breaking changes be noted?", a: "Yes. Impactful changes are highlighted with migration guidance where needed." },
      { q: "Can I use it for team planning?", a: "Yes. Many teams use changelog notes to coordinate process updates." },
    ],
  },
  "/getting-started": {
    sections: [
      { title: "Fast Setup Path", body: "Getting Started is designed to move users from account creation to first publish-ready asset with minimal configuration." },
      { title: "Practical First Workflow", body: "The onboarding flow emphasizes repeatable habits, not just one-time setup, so creators can build sustainable cadence." },
      { title: "Foundational Best Practices", body: "Early guidance covers structure, hooks, and exports to reduce trial-and-error in initial weeks." },
    ],
    faqs: [
      { q: "How long does onboarding take?", a: "Most users complete their first operational workflow in under one day." },
      { q: "Do I need prior AI tooling experience?", a: "No. The onboarding content is built for all experience levels." },
      { q: "Can I onboard a team together?", a: "Yes. The setup supports shared workflows and role-based collaboration." },
    ],
  },
  "/video-templates": {
    sections: [
      { title: "Proven Structural Formats", body: "Templates provide tested narrative patterns for quick production while preserving room for niche-specific customization." },
      { title: "Platform-Aware Defaults", body: "Layouts and pacing are optimized for modern social formats to reduce adaptation time across channels." },
      { title: "Scale Through Reuse", body: "Template systems let teams publish consistently while keeping quality standards across creators and editors." },
    ],
    faqs: [
      { q: "Can I customize every template?", a: "Yes. Templates are starter frameworks, not locked formats." },
      { q: "Are templates niche-specific?", a: "Yes. Many templates are designed for distinct audience expectations by vertical." },
      { q: "Can we create internal template libraries?", a: "Yes. Teams can standardize and share template sets." },
    ],
  },
  "/niche-guides": {
    sections: [
      { title: "Vertical Playbooks", body: "Niche Guides translate broad content strategy into actionable channel-specific approaches for ideation and positioning." },
      { title: "Message-Market Fit", body: "Guides focus on audience intent and repeatable framing so creators can improve relevance and retention." },
      { title: "Execution Clarity", body: "Each guide helps creators move from theory to practical publishing routines with measurable output goals." },
    ],
    faqs: [
      { q: "Are guides beginner-friendly?", a: "Yes. They are structured for clarity and action, even for new creators." },
      { q: "Can guides be combined?", a: "Yes. Cross-niche experimentation is supported when audience overlap exists." },
      { q: "Do guides include examples?", a: "Yes. Guidance is built around practical execution scenarios." },
    ],
  },
  "/community": {
    sections: [
      { title: "Peer Learning Network", body: "Community connects creators sharing systems, growth loops, and production practices that actually worked." },
      { title: "Faster Problem Solving", body: "Members can unblock technical and strategic issues quickly through shared prompts, workflows, and critiques." },
      { title: "Compounding Insights", body: "As members document wins and misses, the community knowledge base improves operational outcomes for everyone." },
    ],
    faqs: [
      { q: "Is the community active for feedback?", a: "Yes. Discussions prioritize practical advice over generic commentary." },
      { q: "Can I share experiments and results?", a: "Yes. Experiment logs are encouraged to help others learn faster." },
      { q: "Is there support for collaboration?", a: "Yes. Creators often form partnerships for script, edit, and distribution workflows." },
    ],
  },
  "/affiliate-program": {
    sections: [
      { title: "Recurring Revenue Potential", body: "The affiliate program is built for creators, educators, and operators who want sustainable referral income." },
      { title: "Clear Attribution", body: "Tracked links and transparent reporting support confidence in referral performance and payout visibility." },
      { title: "Partner Enablement", body: "Affiliates receive messaging support and assets to communicate value effectively without overcomplicating offers." },
    ],
    faqs: [
      { q: "Who can apply?", a: "Creators, communities, agencies, and educators with relevant audiences can apply." },
      { q: "How are referrals tracked?", a: "Referrals use partner-specific links with clear attribution windows." },
      { q: "Are assets provided?", a: "Yes. Partners receive lightweight collateral for promotions and onboarding." },
    ],
  },
  "/about-us": {
    sections: [
      { title: "Mission", body: "ViralKraft is focused on making high-quality faceless video production operationally simple for modern creator teams." },
      { title: "Product Philosophy", body: "The platform combines automation with human editorial control so teams can scale output without sacrificing brand quality." },
      { title: "Execution Culture", body: "We optimize for practical outcomes: faster publish cycles, better retention, and sustainable creator economics." },
    ],
    faqs: [
      { q: "Who is ViralKraft for?", a: "Independent creators, content teams, agencies, and media operators." },
      { q: "What problem does it solve?", a: "It removes production bottlenecks in script-to-publish workflows." },
      { q: "What is the long-term direction?", a: "A full operating system for AI-driven creator businesses." },
    ],
  },
  "/blog": {
    sections: [
      { title: "Actionable Strategy", body: "The blog focuses on tactical execution: retention mechanics, distribution systems, and operational playbooks." },
      { title: "Evidence-Based Lessons", body: "Articles translate observed creator outcomes into usable frameworks rather than abstract trend commentary." },
      { title: "Continuous Learning", body: "Content is designed to help teams adapt quickly as platform dynamics and audience behavior evolve." },
    ],
    faqs: [
      { q: "Is content beginner-friendly?", a: "Yes. The blog balances fundamentals with advanced execution concepts." },
      { q: "Do articles include frameworks?", a: "Yes. Most posts include practical models and implementation steps." },
      { q: "How often is content published?", a: "New insights are published regularly based on product and market learnings." },
    ],
  },
  "/careers": {
    sections: [
      { title: "High-Ownership Teams", body: "Careers at ViralKraft emphasize impact, autonomy, and measurable outcomes across product and go-to-market functions." },
      { title: "Remote-First Collaboration", body: "Teams operate asynchronously with clear decision records and strong execution velocity." },
      { title: "Creator Economy Focus", body: "Work directly on tools that shape how modern creators build sustainable businesses." },
    ],
    faqs: [
      { q: "Are roles remote-friendly?", a: "Yes. Many roles are built for distributed collaboration." },
      { q: "What profiles are prioritized?", a: "People who combine technical depth with execution bias and customer empathy." },
      { q: "How does hiring evaluate fit?", a: "Hiring emphasizes problem-solving, ownership, and communication clarity." },
    ],
  },
  "/press-kit": {
    sections: [
      { title: "Brand Consistency", body: "Press Kit provides approved assets and usage guidance to help media teams represent ViralKraft accurately." },
      { title: "Media Efficiency", body: "Key facts, logos, and boilerplate summaries reduce back-and-forth for interviews and coverage requests." },
      { title: "Partnership Support", body: "The kit also helps ecosystem partners maintain consistent messaging across co-marketing materials." },
    ],
    faqs: [
      { q: "Can media use logos directly?", a: "Yes, following published brand usage guidelines." },
      { q: "Is company boilerplate included?", a: "Yes. Standard language is provided for press mentions." },
      { q: "Can partners request additional assets?", a: "Yes. Extended assets can be requested through contact channels." },
    ],
  },
  "/contact": {
    sections: [
      { title: "Support and Success", body: "Contact channels are structured to route product support, onboarding help, and account questions quickly." },
      { title: "Partnership Requests", body: "Agencies, creators, and ecosystem partners can reach out for collaboration opportunities and integrations." },
      { title: "Enterprise Conversations", body: "Larger teams can discuss workflow requirements, governance needs, and rollout plans." },
    ],
    faqs: [
      { q: "What is the fastest support path?", a: "Use the primary support channel listed for your account tier." },
      { q: "Can agencies request custom onboarding?", a: "Yes. Agency onboarding support is available." },
      { q: "Do you handle enterprise discovery calls?", a: "Yes. Enterprise teams can schedule structured discovery conversations." },
    ],
  },
  "/privacy-policy": {
    sections: [
      { title: "Data Collection Scope", body: "Privacy Policy explains what data is collected for product operation, analytics, and account security." },
      { title: "Usage and Protection", body: "Policy details how data is processed, protected, and retained according to operational and legal requirements." },
      { title: "User Control", body: "Users retain rights around access, correction, and request-based data management workflows." },
    ],
    faqs: [
      { q: "Can users request data access?", a: "Yes. Users can request account-related data access and clarification." },
      { q: "How is security addressed?", a: "Security controls are applied across storage, access, and operational monitoring." },
      { q: "Can data handling preferences change?", a: "Yes. Preferences and rights requests are supported through policy channels." },
    ],
  },
  "/terms-of-service": {
    sections: [
      { title: "Service Use Boundaries", body: "Terms of Service define expected platform use, account responsibilities, and acceptable behavior standards." },
      { title: "Billing and Access", body: "Terms describe subscription behavior, entitlement scope, and account lifecycle considerations." },
      { title: "Governance and Updates", body: "Legal updates, limitation clauses, and dispute handling mechanisms are documented for transparency." },
    ],
    faqs: [
      { q: "Do terms apply to all plans?", a: "Yes. Core terms apply across plans, with tier-specific details where relevant." },
      { q: "Can terms change over time?", a: "Yes. Updates are communicated and become effective according to policy terms." },
      { q: "Where are billing terms defined?", a: "Billing obligations and conditions are covered in the terms and associated policy pages." },
    ],
  },
  "/refund-policy": {
    sections: [
      { title: "Eligibility Criteria", body: "Refund Policy explains the scenarios in which refunds are reviewed and potentially approved." },
      { title: "Submission Windows", body: "Policy includes timelines and required context for refund requests to ensure fair review." },
      { title: "Processing Expectations", body: "Approved refunds follow documented processing timelines based on payment method and provider constraints." },
    ],
    faqs: [
      { q: "How do I request a refund?", a: "Submit a request with order details through the listed support channel." },
      { q: "How long does review take?", a: "Review timelines vary by case complexity but are designed for prompt resolution." },
      { q: "Are payment-provider timelines included?", a: "Yes. Post-approval timing depends in part on payment rails and issuer processing." },
    ],
  },
  "/cookie-policy": {
    sections: [
      { title: "Cookie Categories", body: "Cookie Policy outlines essential, analytics, and preference cookies used to operate and improve the service." },
      { title: "Purpose and Retention", body: "Each category is tied to practical product functions with retention behavior described transparently." },
      { title: "Preference Controls", body: "Users can manage non-essential cookie preferences while preserving critical platform functionality." },
    ],
    faqs: [
      { q: "Can I disable non-essential cookies?", a: "Yes. Preference controls are available for non-essential categories." },
      { q: "Do essential cookies remain active?", a: "Yes. Essential cookies support core product reliability and security." },
      { q: "How are cookie policies updated?", a: "Policy changes are published with updated effective details when applicable." },
    ],
  },
};

export function FooterInfoPage() {
  const location = useLocation();
  const page = FOOTER_PAGE_BY_PATH.get(location.pathname);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  if (!page) {
    return <Navigate to="/" replace />;
  }

  const relatedPages = FOOTER_PAGES.filter(
    (entry) => entry.category === page.category && entry.path !== page.path,
  ).slice(0, 3);
  const narrative = PAGE_NARRATIVES[page.path];
  const legalClauses = LEGAL_DOCUMENTS[page.path] || [];

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      fullName: String(formData.get("fullName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      topic: String(formData.get("topic") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    try {
      setContactSubmitting(true);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Could not submit your message");
      }

      form.reset();
      toast.success("Message sent. Our team will get back to you shortly.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setContactSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>
      <CinematicBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <AppNavbar />

        <main className="px-4 pb-16 pt-28 sm:pt-32">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-7 sm:p-10"
            >
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-cyan-300/80">{page.category}</p>
              <h1 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">{page.label}</h1>
              <p className="max-w-2xl text-sm leading-7 text-white/75 sm:text-base">{page.description}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {page.bullets.map((bullet) => (
                  <div key={bullet} className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                    {bullet}
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:border-cyan-300/50 hover:text-cyan-200"
                >
                  Back to Home
                </Link>
                {page.path !== "/pricing" && (
                  <Link
                    to="/pricing"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(56,189,248,0.2)] transition hover:opacity-90"
                  >
                    View Pricing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </motion.div>

            <section className="mt-8 grid gap-4 sm:grid-cols-3">
              {narrative.sections.map((section) => (
                <article key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h2 className="mb-2 text-lg font-semibold text-white">{section.title}</h2>
                  <p className="text-sm leading-relaxed text-white/70">{section.body}</p>
                </article>
              ))}
            </section>

            {page.path === "/blog" && (
              <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Latest Articles</h2>
                <div className="space-y-4">
                  {BLOG_POST_PREVIEWS.map((post) => (
                    <article key={post.slug} className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
                        <span>{post.category}</span>
                        <span>•</span>
                        <span>{post.publishedAt}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="text-base font-semibold text-white">{post.title}</h3>
                      <p className="mt-1 text-sm text-white/70">{post.excerpt}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {page.path === "/changelog" && (
              <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Recent Releases</h2>
                <div className="space-y-4">
                  {CHANGELOG_ENTRIES.map((entry) => (
                    <article key={entry.version} className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-white/50">
                        <span className="font-semibold text-cyan-300">{entry.version}</span>
                        <span>•</span>
                        <span>{entry.date}</span>
                      </div>
                      <h3 className="text-base font-semibold text-white">{entry.summary}</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
                        {entry.changes.map((change) => (
                          <li key={change}>{change}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {page.path === "/contact" && (
              <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Send a Message</h2>
                <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleContactSubmit}>
                  <label className="flex flex-col gap-1 text-xs text-white/60">
                    Full Name
                    <input
                      name="fullName"
                      required
                      className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-white/60">
                    Email
                    <input
                      name="email"
                      required
                      type="email"
                      className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
                    />
                  </label>
                  <label className="sm:col-span-2 flex flex-col gap-1 text-xs text-white/60">
                    Topic
                    <input
                      name="topic"
                      required
                      className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
                    />
                  </label>
                  <label className="sm:col-span-2 flex flex-col gap-1 text-xs text-white/60">
                    Message
                    <textarea
                      name="message"
                      required
                      rows={5}
                      className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {contactSubmitting ? "Sending..." : "Send Message"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </section>
            )}

            {page.category === "Legal" && legalClauses.length > 0 && (
              <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Policy Details</h2>
                <div className="space-y-4">
                  {legalClauses.map((clause) => (
                    <article key={clause.title} className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <h3 className="text-sm font-semibold text-white">{clause.title}</h3>
                      <p className="mt-1 text-sm text-white/70">{clause.body}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Frequently Asked</h2>
              <div className="space-y-4">
                {narrative.faqs.map((faq) => (
                  <article key={faq.q} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <h3 className="text-sm font-semibold text-white">{faq.q}</h3>
                    <p className="mt-1 text-sm text-white/70">{faq.a}</p>
                  </article>
                ))}
              </div>
            </section>

            {relatedPages.length > 0 && (
              <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-white/70">More in {page.category}</h2>
                <div className="flex flex-wrap gap-2">
                  {relatedPages.map((entry) => (
                    <Link
                      key={entry.path}
                      to={entry.path}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/75 transition hover:border-cyan-300/50 hover:text-cyan-200"
                    >
                      {entry.label}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
