// Shared content shapes used by both the Sanity layer and the offline fallback.

export interface SanityImage {
  asset?: { _ref?: string; _id?: string; url?: string };
  alt?: string;
}

export interface Cta {
  label: string;
  href: string;
}

/** Eyebrow + title (+ optional lede) for a section. `\n` in a title breaks the line. */
export interface Heading {
  eyebrow: string;
  title: string;
  lede?: string;
}

/** A pre-formatted stat — the value is a string, so "−58%" and "3 wk" both work. */
export interface TextStat {
  value: string;
  label: string;
}

/** A stat that counts up on scroll (see initCountUp). */
export interface CountStat {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  /** Width of the accompanying bar, e.g. "84%". Only used where a bar is drawn. */
  barWidth?: string;
}

export interface SeoMeta {
  title: string;
  description: string;
}

export interface NavItem {
  label: string;
  href: string;
  /** Full Font Awesome class, e.g. "fa-solid fa-house". */
  icon: string;
  /** Path prefix that marks this tab active (defaults to href). */
  match?: string;
}

/** The closing call-to-action band that ends most pages. */
export interface ClosingCtaContent {
  title: string;
  primary: Cta;
  secondary: Cta;
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
  visual: 'ai' | 'mvp' | 'commerce' | 'api' | 'booking';
  /** Optional deep-link to a dedicated landing page. */
  href?: string;
  tone: Tone;
}

export interface SiteSettings {
  name: string;
  role: string;
  /** Fallback <title>/<meta description> for pages that don't set their own. */
  seo: SeoMeta;
  /** Bottom tab bar. */
  nav: NavItem[];
  footerLinks: Cta[];
  /** Copyright year shown in the footer. */
  copyrightYear: string;
  openToWorkLabel: string;
  skipLinkLabel: string;
  backHomeLabel: string;
  /** Defaults for the closing CTA band; pages may override the title. */
  closingCta: { primary: Cta; secondary: Cta };
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

/** The dark band on the home page that explains the AI-accelerated method. */
export interface AiBand {
  eyebrow: string;
  title: string;
  accentWord: string;
  body: string;
  link: Cta;
  stats: CountStat[];
}

export interface HomeContent {
  seo: SeoMeta;
  badge: string;
  availabilityChip: string;
  headlineLines: string[];
  accentWord: string;
  lede: string;
  /** Punchier lede for phones. Cold visitors give you seconds — the full
   *  paragraph pushes the CTA below the fold. Falls back to `lede`. */
  ledeShort?: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  availabilityNote: string;
  buildingWithLabel: string;
  rotatingWords: string[];
  stats: Stat[];
  /** Section headings, in page order. */
  /** Turns the tech marquee into the entry point for /stack. */
  stackCta: Cta;
  servicesStackHeading: Heading;
  servicesStackCta: Cta;
  aiBand: AiBand;
  testimonialsHeading: Heading;
  workHeading: Heading;
  workCta: Cta;
  workNote: string;
  workNoteLink: Cta;
  processHeading: Heading;
  faqHeading: Heading;
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

/** Hero shared by the Services and Shopify landing pages. */
export interface PageHero {
  eyebrow: string;
  chip: string;
  headlineLines: string[];
  accentWord: string;
  lede: string;
  /** Punchier lede for phones; falls back to `lede`. */
  ledeShort?: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  stats: TextStat[];
}

export interface ServicesPageContent {
  seo: SeoMeta;
  hero: PageHero;
  /** The "same scope, two timelines" card in the hero. */
  velocity: {
    kicker: string;
    rows: { label: string; value: string; barWidth: string; muted: boolean }[];
    foot: string;
  };
  methodHeading: Heading;
  listHeading: Heading;
  listCta: Cta;
  serviceCta: Cta;
  serviceDeepLinkCta: Cta;
  /** Pointer to the /stack detail page. */
  stackLink: Cta;
  engagementsHeading: Heading;
  engagements: { number: string; title: string; body: string; meta: string }[];
  processHeading: Heading;
  faqHeading: Heading;
  faqs: Faq[];
  closing: ClosingCtaContent;
}

export interface ShopifyPageContent {
  seo: SeoMeta;
  hero: PageHero;
  brandsHeading: Heading;
  brands: string[];
  servicesHeading: Heading;
  servicesCta: Cta;
  serviceTagLabel: string;
  serviceCta: Cta;
  approachHeading: Heading;
  approach: { number: string; title: string; body: string }[];
  numbersHeading: Heading;
  numbers: CountStat[];
  numbersNote: string;
  /** The CRO half of the page. */
  cro: {
    heading: Heading;
    lede: string;
    features: string[];
    primaryCta: Cta;
    secondaryCta: Cta;
  };
  /** Values rendered inside the CroDashboard visual. */
  croDashboard: {
    rateLabel: string;
    rateBefore: string;
    rateAfter: string;
    rateBadge: string;
    abTitle: string;
    abStatus: string;
    abVariants: { name: string; value: string; barWidth: string; winner: boolean; winnerLabel?: string }[];
    abFoot: string;
    funnelLabel: string;
    funnel: { step: string; value: string; barWidth: string }[];
  };
  leakHeading: Heading;
  funnel: { name: string; count: number; width: string; drop?: string; why?: string }[];
  fixes: { icon: string; title: string; body: string; barWidth: string }[];
  croProcessHeading: Heading;
  croProcess: { number: string; title: string; body: string }[];
  croProcessLoopNote: string;
  calcHeading: Heading;
  calcCta: Cta;
  calcLabels: {
    visitors: string;
    aov: string;
    current: string;
    target: string;
    outKicker: string;
    revenueNow: string;
    revenueAfter: string;
    monthlyUplift: string;
    extraOrders: string;
  };
  calcNote: string;
  experimentsHeading: Heading;
  experimentsColumns: { test: string; metric: string; lift: string };
  experiments: { title: string; area: string; metric: string; lift: number }[];
  featuredHeading: Heading;
  featuredCta: Cta;
  testimonialsHeading: Heading;
  testimonials: Testimonial[];
  faqHeading: Heading;
  faqs: Faq[];
  closing: ClosingCtaContent;
}

/** The /stack page — what gets built, and with what. */
export interface StackPageContent {
  seo: SeoMeta;
  hero: {
    eyebrow: string;
    headlineLines: string[];
    accentWord: string;
    lede: string;
    /** Punchier lede for phones; falls back to `lede`. */
    ledeShort?: string;
    primaryCta: Cta;
    secondaryCta: Cta;
    stats: TextStat[];
  };
  templatesHeading: Heading;
  templates: {
    number: string;
    title: string;
    tagline: string;
    bestFor: string;
    stack: string[];
    note: string;
    tone: Tone;
  }[];
  toolsHeading: Heading;
  toolGroups: { title: string; tools: { name: string; role: string }[] }[];
  everyBuildHeading: Heading;
  everyBuild: string[];
  everyBuildNote: string;
  closing: ClosingCtaContent;
}

export interface WorkPageContent {
  seo: SeoMeta;
  hero: { eyebrow: string; headlineLines: string[]; lede: string; ledeShort?: string };
  filters: Cta[];
  /** Label on the "view full case study" link inside the project modal. */
  modalCtaLabel: string;
  closing: ClosingCtaContent;
}

export interface BlogPageContent {
  seo: SeoMeta;
  hero: { eyebrow: string; headlineLines: string[]; lede: string; ledeShort?: string };
  categories: Cta[];
  featuredBadge: string;
  emptyMessage: string;
  closing: ClosingCtaContent;
}

export interface StartPageContent {
  seo: SeoMeta;
  eyebrow: string;
  headlineLines: string[];
  lede: string;
  /** Punchier lede for phones; falls back to `lede`. */
  ledeShort?: string;
  callTabLabel: string;
  formTabLabel: string;
  call: {
    title: string;
    body: string;
    points: string[];
    embedLabel: string;
    /** Calendly / Cal.com booking URL. Empty falls back to a placeholder. */
    schedulerUrl: string;
    schedulerFallbackLabel: string;
  };
  form: {
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    needsLabel: string;
    needs: string[];
    budgetLabel: string;
    budgetPlaceholder: string;
    budgets: string[];
    timelineLabel: string;
    timelinePlaceholder: string;
    timelines: string[];
    messageLabel: string;
    messagePlaceholder: string;
    submitLabel: string;
    note: string;
  };
  success: { title: string; body: string; backLabel: string };
}

/** Section labels for the case-study template (/work/[slug]). */
export interface CaseStudyContent {
  challengeHeading: Heading;
  approachHeading: Heading;
  insightsHeading: Heading;
  processHeading: Heading;
  screensHeading: Heading;
  mobileHeading: Heading;
  outcomesHeading: Heading;
  nextHeading: Heading;
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

/** A span of text inside a Portable Text block. */
export interface PortableSpan {
  _type?: 'span';
  _key?: string;
  text: string;
  /** Mark names — "strong", "em", "code", or a key into the block's markDefs. */
  marks?: string[];
}

/** A link annotation referenced by a span's `marks`. */
export interface PortableMarkDef {
  _key: string;
  _type: 'link';
  href: string;
}

/**
 * One block of post body. Portable Text, the shape Sanity's block editor
 * emits — so the Studio gets a proper writing experience and the offline seed
 * uses the exact same structure. Rendered by components/PortableText.astro.
 */
export interface PortableBlock {
  _type: 'block' | 'code';
  _key?: string;
  /** block: paragraph or heading level. */
  style?: 'normal' | 'h2' | 'h3' | 'h4' | 'blockquote';
  listItem?: 'bullet' | 'number';
  level?: number;
  children?: PortableSpan[];
  markDefs?: PortableMarkDef[];
  /** code blocks only. */
  code?: string;
  language?: string;
}

export interface Post {
  title: string;
  slug: string;
  order: number;
  category: string;
  categoryLabel: string;
  readTime: string;
  /** Human-readable date shown on the card, e.g. "July 2026". */
  date: string;
  /** ISO-8601 publish date. Drives `datePublished` in the Article JSON-LD and
   *  the sort order — the display `date` has no day and can't be parsed. */
  publishedAt: string;
  excerpt: string;
  coverLabel: string;
  featured: boolean;
  image?: SanityImage | null;
  /**
   * The article itself. A post only gets a `/blog/<slug>` page, a sitemap
   * entry and a card link once this has content — an indexable page with
   * nothing but an excerpt on it is a thin-content liability, not an asset.
   */
  body?: PortableBlock[];
  /** Optional per-post SEO override; falls back to title + excerpt. */
  seo?: SeoMeta;
}

/** One photo in the About strip. Falls back to a hatched placeholder until
 *  either `src` (a file in /public) or `image` (a Sanity upload) is set. */
export interface GalleryPhoto {
  /** Caption under the photo — also the placeholder label. */
  caption: string;
  /** Alt text. Defaults to the caption; set "" for purely decorative shots. */
  alt?: string;
  /** Path to a file in /public, e.g. "/about/desk.jpg". */
  src?: string;
  /** Uploaded in the Studio — wins over `src` when present. */
  image?: SanityImage | null;
}

export interface AboutContent {
  seo: SeoMeta;
  eyebrow: string;
  heading: string;
  leadParagraph: string;
  secondParagraph: string;
  tags: string[];
  gallery: GalleryPhoto[];
  outsideEyebrow: string;
  outsideTitle: string;
  outsideBody: string;
  traitsHeading: Heading;
  traits: { title: string; body: string }[];
  buildHeading: Heading;
  buildLink: Cta;
  stackLink: Cta;
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
