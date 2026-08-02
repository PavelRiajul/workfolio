// Shared content shapes used by both the Sanity layer and the offline fallback.

export interface SanityImage {
  asset?: { _ref?: string; _id?: string; url?: string };
  alt?: string;
}

export interface Cta {
  label: string;
  href: string;
}

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

export interface Numbered {
  number: string;
  title: string;
  body: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

export interface Faq {
  question: string;
  answer: string;
}

/** Visual tone key for stack/showcase cards (see .tone-* in global.css). */
export type Tone = 'indigo' | 'terracotta' | 'amber' | 'sage' | 'ink' | 'ai';

export interface ShopifyService {
  number: string;
  title: string;
  /** Short punchy line used for the home stack glimpse. */
  tagline: string;
  /** Fuller description used on the Shopify services page. */
  description: string;
  features: string[];
  tone: Tone;
}

/**
 * A top-level offering (AI web development, MVP engineering, commerce, APIs).
 * Rendered by the home ServiceStack and the /services showcase.
 */
export interface Service {
  number: string;
  /** Anchor id on /services. */
  slug: string;
  title: string;
  /** Short punchy line used for the home stack glimpse. */
  tagline: string;
  /** Fuller description used on the services page. */
  description: string;
  features: string[];
  /** Font Awesome class for the kicker icon. */
  icon: string;
  /** Kicker label above the title. */
  kicker: string;
  /** Typical turnaround, shown as a chip on the services page. */
  timeline: string;
  /** Which mockup OfferVisual renders. */
  visual: 'ai' | 'mvp' | 'commerce' | 'api';
  /** Optional deep-link to a dedicated landing page. */
  href?: string;
  tone: Tone;
}

export interface SiteSettings {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  timeZone: string;
  gmtLabel: string;
  openToWork: boolean;
  footerWordmark: string;
  whatsappPhone: string;
  whatsappMessage: string;
  website: string;
  socials: {
    github: string;
    githubHandle: string;
    linkedin: string;
    linkedinHandle: string;
    x: string;
  };
  techStack: string[];
}

export interface HomeContent {
  badge: string;
  headlineLines: string[];
  accentWord: string;
  lede: string;
  primaryCta: string;
  secondaryCta: string;
  availabilityNote: string;
  rotatingWords: string[];
  stats: Stat[];
  approachEyebrow: string;
  approachTitle: string;
  approachLede: string;
  principles: Numbered[];
  services: Numbered[];
  /** "How the AI-accelerated workflow runs" cards on the home page. */
  aiWorkflow: Numbered[];
  /** Honest counterweight to the AI copy — what the workflow does *not* change. */
  aiCaveat: string;
  process: Numbered[];
  testimonials: Testimonial[];
  faqs: Faq[];
  closingTitle: string;
}

export interface Outcome {
  stat: string;
  label: string;
}
export interface MetaItem {
  label: string;
  value: string;
}
export interface Insight {
  number: string;
  finding: string;
  did: string;
}
export interface ProcessPhase {
  number: string;
  title: string;
  body: string;
  label: string;
}

export interface Project {
  title: string;
  slug: string;
  order: number;
  tags: string[];
  stack: string;
  type: string;
  blurb: string;
  image?: SanityImage | null;
  hasCaseStudy: boolean;
  modalSummary: string;
  modalOutcomes: Outcome[];
  year: string;
  pills: string[];
  summary: string;
  meta: MetaItem[];
  challenge: string[];
  approach: string[];
  insights: Insight[];
  processSteps: ProcessPhase[];
  screens: string[];
  mobileScreens: string[];
  outcomes: Outcome[];
  outcomesNote: string;
}

export interface Post {
  title: string;
  slug: string;
  order: number;
  category: string;
  categoryLabel: string;
  readTime: string;
  date: string;
  excerpt: string;
  coverLabel: string;
  featured: boolean;
  image?: SanityImage | null;
}

export interface AboutContent {
  heading: string;
  leadParagraph: string;
  secondParagraph: string;
  tags: string[];
  gallery: string[];
  outsideTitle: string;
  outsideBody: string;
  traits: { title: string; body: string }[];
  closingTitle: string;
}

export interface ResumeContent {
  highlights: { value: string; label: string }[];
  summary: string;
  skills: { label: string; values: string }[];
  experience: { title: string; period: string; bullets: string[] }[];
  projects: { name: string; description: string }[];
  education: { title: string; year: string }[];
  languages: string;
}
