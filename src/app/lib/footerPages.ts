export type FooterPage = {
  category: "Product" | "Creators" | "Company" | "Legal";
  label: string;
  path: string;
  description: string;
  bullets: string[];
};

export type LegalClause = {
  title: string;
  body: string;
};

export type BlogPostPreview = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: string;
};

export type ChangelogEntry = {
  version: string;
  date: string;
  summary: string;
  changes: string[];
};

export const FOOTER_PAGES: FooterPage[] = [
  {
    category: "Product",
    label: "Features",
    path: "/features",
    description: "Explore the core tools that help creators produce and publish faceless videos faster.",
    bullets: ["AI script generation", "One-click scene assembly", "Multi-platform exports"],
  },
  {
    category: "Product",
    label: "RetentionAI™",
    path: "/retention-ai",
    description: "RetentionAI analyzes hooks, pacing, and cut points to improve watch time.",
    bullets: ["Hook scoring", "Drop-off prediction", "Frame-level pacing tips"],
  },
  {
    category: "Product",
    label: "VoiceClone™",
    path: "/voice-clone",
    description: "Create consistent narration with natural sounding cloned voices for your channel.",
    bullets: ["Brand-safe presets", "Multilingual support", "Fine-grained tone controls"],
  },
  {
    category: "Product",
    label: "Trend Scanner",
    path: "/trend-scanner",
    description: "Find fast-moving topics in your niche before they peak.",
    bullets: ["Niche trend feed", "Keyword velocity", "Opportunity alerts"],
  },
  {
    category: "Product",
    label: "Pricing",
    path: "/pricing",
    description: "Choose a plan that fits your creator stage and publishing frequency.",
    bullets: ["Starter, Growth, Scale", "Monthly and yearly billing", "Upgrade anytime"],
  },
  {
    category: "Product",
    label: "Changelog",
    path: "/changelog",
    description: "Track product updates, improvements, and bug fixes across releases.",
    bullets: ["Release notes", "Patch summaries", "Roadmap highlights"],
  },
  {
    category: "Creators",
    label: "Getting Started",
    path: "/getting-started",
    description: "Set up your workspace and publish your first faceless video quickly.",
    bullets: ["Account setup", "First workflow walkthrough", "Publishing checklist"],
  },
  {
    category: "Creators",
    label: "Video Templates",
    path: "/video-templates",
    description: "Start from proven templates optimized for shorts and long-form formats.",
    bullets: ["Hooks and story arcs", "Vertical-first layouts", "Caption-ready timing"],
  },
  {
    category: "Creators",
    label: "Niche Guides",
    path: "/niche-guides",
    description: "Discover niche playbooks with sample scripts and posting strategies.",
    bullets: ["Finance", "Fitness", "Education"],
  },
  {
    category: "Creators",
    label: "Community",
    path: "/community",
    description: "Join creators sharing tactics, prompt packs, and growth wins.",
    bullets: ["Creator forum", "Weekly live sessions", "Peer feedback loops"],
  },
  {
    category: "Creators",
    label: "Affiliate Program",
    path: "/affiliate-program",
    description: "Refer creators to ViralKraft and earn recurring commissions.",
    bullets: ["Custom referral links", "Real-time payouts dashboard", "Partner assets"],
  },
  {
    category: "Company",
    label: "About Us",
    path: "/about-us",
    description: "Learn about ViralKraft mission, team, and product philosophy.",
    bullets: ["Creator-first approach", "AI + workflow focus", "Long-term platform vision"],
  },
  {
    category: "Company",
    label: "Blog",
    path: "/blog",
    description: "Read practical insights on retention, distribution, and content operations.",
    bullets: ["Algorithm updates", "Case studies", "Execution frameworks"],
  },
  {
    category: "Company",
    label: "Careers",
    path: "/careers",
    description: "Help build the operating system for modern creator businesses.",
    bullets: ["Remote-first roles", "Product and engineering", "High ownership culture"],
  },
  {
    category: "Company",
    label: "Press Kit",
    path: "/press-kit",
    description: "Access logos, brand assets, company facts, and media resources.",
    bullets: ["Brand guidelines", "Logo downloads", "Company boilerplate"],
  },
  {
    category: "Company",
    label: "Contact",
    path: "/contact",
    description: "Reach our team for support, partnerships, and enterprise discussions.",
    bullets: ["Support channel", "Partnership inquiries", "Enterprise sales"],
  },
  {
    category: "Legal",
    label: "Privacy Policy",
    path: "/privacy-policy",
    description: "Understand how we collect, process, and safeguard your data.",
    bullets: ["Data handling", "User rights", "Security practices"],
  },
  {
    category: "Legal",
    label: "Terms of Service",
    path: "/terms-of-service",
    description: "Review platform usage terms, responsibilities, and account conditions.",
    bullets: ["Acceptable use", "Billing terms", "Service limitations"],
  },
  {
    category: "Legal",
    label: "Refund Policy",
    path: "/refund-policy",
    description: "See eligibility and timelines for refunds and payment reversals.",
    bullets: ["Request windows", "Approval criteria", "Processing timelines"],
  },
  {
    category: "Legal",
    label: "Cookie Policy",
    path: "/cookie-policy",
    description: "Learn which cookies we use and how to manage tracking preferences.",
    bullets: ["Essential cookies", "Analytics cookies", "Preference controls"],
  },
];

export const FOOTER_PAGE_BY_PATH = new Map(FOOTER_PAGES.map((page) => [page.path, page]));

export const FOOTER_LINKS_BY_CATEGORY: Record<FooterPage["category"], FooterPage[]> = {
  Product: FOOTER_PAGES.filter((page) => page.category === "Product"),
  Creators: FOOTER_PAGES.filter((page) => page.category === "Creators"),
  Company: FOOTER_PAGES.filter((page) => page.category === "Company"),
  Legal: FOOTER_PAGES.filter((page) => page.category === "Legal"),
};

export const LEGAL_DOCUMENTS: Record<string, LegalClause[]> = {
  "/privacy-policy": [
    {
      title: "Information We Collect",
      body: "We collect account details, billing metadata, and usage telemetry needed to operate ViralKraft reliably, improve performance, and provide support.",
    },
    {
      title: "How We Use Data",
      body: "Data is used to deliver product functionality, secure accounts, monitor abuse, and provide analytics features relevant to customer workflows.",
    },
    {
      title: "Retention and Security",
      body: "We retain data only for operational, legal, and support requirements, and protect systems through access controls, monitoring, and encryption practices.",
    },
    {
      title: "User Rights",
      body: "Users may request access, correction, or deletion requests for account-associated personal data subject to legal and contractual obligations.",
    },
  ],
  "/terms-of-service": [
    {
      title: "Acceptable Use",
      body: "Users must comply with applicable laws and refrain from abusive, fraudulent, or harmful use of the platform and generated outputs.",
    },
    {
      title: "Account Responsibility",
      body: "You are responsible for safeguarding credentials, maintaining accurate account information, and activity performed under your account.",
    },
    {
      title: "Billing and Renewals",
      body: "Paid plans renew under the selected billing cycle unless canceled. Charges, taxes, and payment provider terms apply as disclosed at checkout.",
    },
    {
      title: "Service Availability",
      body: "We work to maintain reliable service but do not guarantee uninterrupted availability. Planned updates or force-majeure events may affect access.",
    },
  ],
  "/refund-policy": [
    {
      title: "Refund Eligibility",
      body: "Refunds are reviewed case-by-case based on purchase context, plan usage, and request timing relative to the original transaction.",
    },
    {
      title: "Request Window",
      body: "To maximize eligibility, requests should be submitted promptly with relevant order details and the reason for the request.",
    },
    {
      title: "Review Process",
      body: "Our team validates account history and transaction status before approval or denial. Additional information may be requested for verification.",
    },
    {
      title: "Payout Timeline",
      body: "Approved refunds are initiated quickly, while settlement timing depends on your payment provider, issuer, and banking rails.",
    },
  ],
  "/cookie-policy": [
    {
      title: "Essential Cookies",
      body: "Essential cookies enable login sessions, account security, and baseline platform functionality required to use the service.",
    },
    {
      title: "Analytics Cookies",
      body: "Analytics cookies help us understand aggregate product usage and improve performance, reliability, and user experience.",
    },
    {
      title: "Preference Cookies",
      body: "Preference cookies store UI and workflow settings to provide a consistent experience across sessions.",
    },
    {
      title: "Cookie Management",
      body: "Users can adjust non-essential cookie preferences through browser controls and platform-level consent settings where available.",
    },
  ],
};

export const BLOG_POST_PREVIEWS: BlogPostPreview[] = [
  {
    slug: "retention-hooks-2026",
    title: "Hook Architecture for 2026 Attention Curves",
    excerpt: "A practical framework for opening structure, first-5-second pacing, and emotional contrast that improves watch-through.",
    category: "Retention",
    publishedAt: "Mar 4, 2026",
    readTime: "8 min",
  },
  {
    slug: "faceless-content-ops",
    title: "Operating Faceless Content Like a Real Production Team",
    excerpt: "Build repeatable weekly workflows for ideation, scripting, review, and publishing without creative burnout.",
    category: "Operations",
    publishedAt: "Feb 19, 2026",
    readTime: "11 min",
  },
  {
    slug: "distribution-systems-short-form",
    title: "Distribution Systems That Compound Short-Form Growth",
    excerpt: "How to align posting cadence, variant testing, and platform sequencing for better downstream reach.",
    category: "Distribution",
    publishedAt: "Jan 31, 2026",
    readTime: "7 min",
  },
];

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "v2.7.0",
    date: "Mar 08, 2026",
    summary: "Workflow speed and publishing reliability release.",
    changes: [
      "Added multi-variant hook scoring in RetentionAI analysis.",
      "Improved export queue resilience under high concurrent workloads.",
      "Expanded starter template library with 12 new short-form formats.",
    ],
  },
  {
    version: "v2.6.2",
    date: "Feb 25, 2026",
    summary: "Collaboration and project governance update.",
    changes: [
      "Introduced role-based reviewer permissions for team workspaces.",
      "Added project-level defaults for caption and export presets.",
      "Improved activity timeline granularity for audit visibility.",
    ],
  },
  {
    version: "v2.6.0",
    date: "Feb 10, 2026",
    summary: "VoiceClone and Trend Scanner expansion.",
    changes: [
      "Added multilingual voice profile tuning controls.",
      "Upgraded trend anomaly detection in niche discovery dashboards.",
      "Reduced script generation latency for complex outlines.",
    ],
  },
];
