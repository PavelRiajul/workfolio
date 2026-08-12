// ---------------------------------------------------------------------------
// Seeded fallback content — mirrors the Claude Design handoff exactly.
// Used whenever Sanity isn't configured (PUBLIC_SANITY_PROJECT_ID=placeholder)
// or a query fails, so the whole site renders offline with zero credentials.
// Once you connect Sanity + seed it, live data takes over automatically.
// ---------------------------------------------------------------------------
import type {
  Faq,
  SiteSettings,
  HomeContent,
  Project,
  Post,
  PortableBlock,
  AboutContent,
  ResumeContent,
  Service,
  ShopifyService,
  ServicesPageContent,
  StackPageContent,
  ShopifyPageContent,
  WorkPageContent,
  BlogPageContent,
  StartPageContent,
  CaseStudyContent,
} from '../lib/types';

export const site: SiteSettings = {
  name: 'Riajul Islam',
  role: 'AI-Powered Full-Stack Developer',
  seo: {
    title: 'Riajul Islam — AI-Powered Full-Stack Developer',
    description:
      'AI-powered full-stack developer building fast, accessible web and mobile products with Next.js, the MERN stack, React Native and Shopify.',
  },
  nav: [
    { label: 'Home', href: '/', icon: 'fa-solid fa-house' },
    { label: 'Work', href: '/work', icon: 'fa-solid fa-folder-open' },
    { label: 'Services', href: '/services', icon: 'fa-solid fa-wand-magic-sparkles' },
    { label: 'Shopify', href: '/shopify', icon: 'fa-solid fa-store' },
    { label: 'Blog', href: '/blog', icon: 'fa-solid fa-feather' },
    { label: 'About', href: '/about', icon: 'fa-solid fa-user' },
    { label: 'Talk', href: '/start?tab=form', icon: 'fa-solid fa-paper-plane', match: '/start' },
  ],
  footerLinks: [
    { label: 'Home', href: '/' },
    { label: 'Work', href: '/work' },
    { label: 'Services', href: '/services' },
    { label: 'Shopify', href: '/shopify' },
    { label: 'Stack', href: '/stack' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Résumé', href: '/resume' },
  ],
  copyrightYear: '2026',
  openToWorkLabel: 'Open to work',
  skipLinkLabel: 'Skip to content',
  backHomeLabel: 'Home',
  closingCta: {
    primary: { label: 'Get in touch', href: '/start?tab=form' },
    secondary: { label: 'View résumé', href: '/resume' },
  },
  email: 'hello@riajulislam.dev',
  phone: '+880 1XXX-XXXXXX',
  location: 'Dhaka, Bangladesh',
  timeZone: 'Asia/Dhaka',
  gmtLabel: 'GMT+6',
  openToWork: true,
  footerWordmark: 'Riajul',
  whatsappPhone: '8801XXXXXXXXX',
  whatsappMessage: 'Hi Riajul — I found you through your portfolio.',
  website: 'pavelriajul.com',
  // Add a platform here (or in the Studio) and it appears in the footer, the
  // résumé contact line and the Person schema's sameAs — no code change.
  socialLinks: [
    { label: 'GitHub', url: 'github.com/riajulislam', icon: 'fa-brands fa-github' },
    { label: 'LinkedIn', url: 'linkedin.com/in/riajulislam', icon: 'fa-brands fa-linkedin-in' },
  ],
  socials: {
    github: 'https://github.com',
    githubHandle: 'github.com/riajulislam',
    linkedin: 'https://linkedin.com',
    linkedinHandle: 'linkedin.com/in/riajulislam',
    x: 'https://x.com',
  },
  techStack: [
    'Next.js', 'React', 'TypeScript', 'Node.js', 'MongoDB',
    'Claude Code', 'Cursor', 'OpenAI API', 'Shopify', 'React Native', 'Tailwind CSS',
  ],
};

export const home: HomeContent = {
  seo: {
    title: 'Riajul Islam — AI-Powered Full-Stack Developer',
    description:
      "I'm a full-stack developer with an AI-accelerated workflow — production web apps and MVPs shipped in weeks, not quarters.",
  },
  badge: 'AI-powered full-stack developer',
  availabilityChip: 'Available for projects',
  headlineLines: ['Production software,', 'shipped at'],
  accentWord: 'AI speed.',
  lede:
    "I'm a full-stack developer with an AI-accelerated workflow: AI writes the boilerplate, I own the architecture, the review and the quality bar. The result is MVPs in weeks instead of quarters — Next.js, Node and Shopify, built properly and shipped fast.",
  ledeShort:
    'AI writes the boilerplate. I own the architecture — so your MVP ships in weeks, not quarters.',
  primaryCta: { label: 'Start a project', href: '/start?tab=form' },
  secondaryCta: { label: 'See what I build', href: '/services' },
  availabilityNote: 'Available for new projects · working remotely, worldwide',
  buildingWithLabel: 'Currently building with',
  rotatingWords: ['Next.js', 'Claude Code', 'TypeScript', 'Shopify', 'Node.js', 'Cursor'],
  stats: [
    { value: 3, suffix: ' wk', label: 'Typical MVP build' },
    { value: 15, suffix: '+', label: 'Products shipped' },
    { value: 24, suffix: 'h', label: 'Avg. response time' },
  ],
  stackCta: { label: 'What I build with', href: '/stack' },
  servicesStackHeading: { eyebrow: '— What I do', title: 'Five ways I ship.' },
  servicesStackCta: { label: 'All services ↗', href: '/services' },
  aiBand: {
    eyebrow: '— The method',
    title: 'AI writes the boilerplate.\nI own the',
    accentWord: 'engineering.',
    body: 'The mechanical 60% of a build — scaffolding, CRUD, types, test fixtures — gets generated in minutes. The saved weeks go into architecture, performance and the details that decide whether people actually use the thing.',
    link: { label: 'How the workflow runs', href: '/services' },
    stats: [
      { value: 3, suffix: ' wk', label: 'typical MVP, start to live', barWidth: '38%' },
      { value: 60, prefix: '−', suffix: '%', label: 'time on mechanical work', barWidth: '72%' },
      { value: 100, suffix: '%', label: 'of it reviewed by a human', barWidth: '100%' },
    ],
  },
  testimonialsHeading: { eyebrow: '— What clients say', title: "Don't take my word for it." },
  workHeading: { eyebrow: '— Selected work', title: 'Proof it ships.' },
  workCta: { label: 'All projects ↗', href: '/work' },
  workNote:
    'AI products and MVPs lately — plus Shopify commerce, Next.js web apps and React Native mobile.',
  workNoteLink: { label: 'See the full range →', href: '/work' },
  processHeading: {
    eyebrow: '— Process',
    title: 'Built\nfor speed.',
    lede: 'Six steps from first message to production. No bloat, no ceremony — just momentum and clean commits.',
  },
  faqHeading: { eyebrow: '— FAQ', title: 'Questions,\nanswered.' },
  approachEyebrow: '— How I Work',
  approachTitle: "Fast, but not careless.",
  approachLede:
    'Five principles that decide what makes it into the codebase — and what gets refactored out.',
  principles: [
    { number: '01/5', title: 'AI-Accelerated, Human-Owned', body: 'AI drafts; I decide. Every generated line gets read, tested and refactored before it reaches main — speed never buys itself with debt.' },
    { number: '02/5', title: 'Ships Relentlessly', body: 'Working software beats perfect plans. I deliver in small, reviewable increments and keep main always deployable.' },
    { number: '03/5', title: 'Performance First', body: "Green Core Web Vitals aren't optional. I budget for speed from the first commit, not as a cleanup task." },
    { number: '04/5', title: 'Full-Stack Fluent', body: 'Comfortable from a MongoDB schema to a CSS transition. I can own a feature end to end without handoffs.' },
    { number: '05/5', title: 'Quietly Obsessed', body: 'The empty state, the loading skeleton, the keyboard shortcut nobody asked for — the small things are usually what make a product feel finished. I sweat them.' },
  ],
  services: [
    { number: '01', title: 'AI Web Development', body: 'Production web apps built with an AI-assisted workflow — and AI features (chat, search, automation) built into the product itself.' },
    { number: '02', title: 'MVP Engineering', body: 'Idea to a live, real-user MVP in weeks. Scoped hard, built lean, instrumented so the next decision comes from data.' },
    { number: '03', title: 'Shopify & CRO', body: 'Custom themes and headless Hydrogen storefronts, plus the conversion work that turns existing traffic into orders.' },
    { number: '04', title: 'Full-Stack & APIs', body: 'Node/Express APIs, MongoDB data modelling, auth and third-party integrations — the engine behind the UI.' },
  ],
  aiWorkflow: [
    { number: '01', title: 'Scope with AI, decide with judgment', body: 'I pressure-test the spec against edge cases before a line is written, so week one builds the right thing instead of discovering it in week three.' },
    { number: '02', title: 'Generate the boring 60%', body: 'Scaffolding, CRUD, types, test fixtures, migrations — the parts that are mechanical get generated in minutes, not days.' },
    { number: '03', title: 'Spend the saved time on the hard 40%', body: 'Architecture, data modelling, performance and the interaction details are where I actually spend the budget you saved.' },
    { number: '04', title: 'Review everything, ship small', body: 'AI-assisted review plus my own read on every PR, with tests and a preview deploy on each push. Nothing lands unread.' },
  ],
  aiCaveat:
    "What AI doesn't change: someone still has to own the architecture, catch the subtle bug, and say no to the feature that will sink the timeline. That part is still me — the tooling just means you pay for judgment instead of typing.",
  process: [
    { number: '01', title: 'You reach out', body: "A role spec or a few lines about your project. No long brief required — I'll ask the right questions." },
    { number: '02', title: 'We get on a call', body: 'A quick call to align on scope, stack and timeline — or to talk through the role and team.' },
    { number: '03', title: 'I scope the work', body: 'Clear deliverables, a realistic timeline and a tech plan you can reason about. No surprises later.' },
    { number: '04', title: 'I build & commit', body: 'Small PRs, clear commit messages and a preview deploy on every push, so you always see progress.' },
    { number: '05', title: 'We review together', body: "Real feedback on a real deploy. We refine, test and tighten until it's right, not just done." },
    { number: '06', title: 'We ship it', body: 'Production deploy, docs and a clean handoff — with the support to keep moving after launch.' },
  ],
  testimonials: [
    { quote: 'We had a working MVP in front of real users in under a month. Riajul moves fast without the code turning into a mess we had to pay for later.', name: 'Sarah Whitfield', role: 'Founder, Vellum', initials: 'SW', color: '#0F766E' },
    { quote: 'He picked up our Next.js codebase fast and was opening solid PRs within days. Reliable, communicative, and genuinely good at the craft.', name: 'Daniel Mensah', role: 'Eng. Manager, Northwind', initials: 'DM', color: '#7C3AED' },
    { quote: 'One developer delivered our web app, the AI search feature and the mobile app — and they actually feel like one product. Rare to find.', name: 'Aisha Karim', role: 'CTO, Anchor', initials: 'AK', color: '#2563EB' },
  ],
  faqs: [
    { question: 'Does "AI-powered" mean AI writes my app?', answer: "No — AI writes drafts, I write the software. It handles scaffolding, boilerplate and test fixtures; I own the architecture, review every line, and stand behind what ships. You get a codebase a human can maintain, just sooner." },
    { question: 'How is this faster than a normal build?', answer: 'The mechanical 60% of a build — CRUD, types, forms, migrations, tests — collapses from days to hours. That typically turns a 10–12 week first version into 3–5 weeks, and it means more of your budget goes into the parts only judgment can solve.' },
    { question: 'Is the code quality the same?', answer: "It has to be, or the speed is fake. Everything is typed, tested, reviewed and small-PR'd, with preview deploys on every push. If generated code doesn't meet the bar, it gets rewritten — that's the job." },
    { question: "What's your tech stack?", answer: 'Next.js, React, TypeScript and Tailwind on the front end; Node, Express and MongoDB on the back end; React Native for mobile; Shopify (Liquid + Hydrogen) for commerce; OpenAI and Claude APIs when a product needs AI features of its own.' },
    { question: 'Can you build AI features into my product?', answer: 'Yes — chat and assistants, semantic search and RAG over your own content, document extraction and workflow automation, wired into your existing app with sensible cost and latency budgets.' },
    { question: 'Are you open to full-time roles?', answer: "Yes — I'm actively open to full-time and contract roles, remote or hybrid, alongside select freelance projects." },
    { question: 'How do we get started?', answer: 'Send a few lines through the contact form or grab my résumé. I reply within 24 hours, either way.' },
  ],
  closingTitle: 'Got something to build —\nand a deadline that already passed?',
};

export const services: Service[] = [
  {
    number: '01',
    slug: 'ai-web-development',
    title: 'AI Web Development',
    kicker: 'AI-accelerated',
    tagline: 'Production web apps, built at a pace that used to be impossible.',
    description:
      'Full web applications built with an AI-accelerated workflow — and, when the product calls for it, AI features built into the app itself: chat, semantic search, extraction and automation. Same engineering standards, a fraction of the calendar time.',
    features: [
      'Next.js & React application builds',
      'AI chat, assistants & agents',
      'Semantic search / RAG over your content',
      'Document & data extraction pipelines',
      'OpenAI & Claude API integration',
      'AI-assisted code review and testing',
      'Streaming UIs and token-cost budgeting',
      'Typed, tested, human-reviewed code',
    ],
    icon: 'fa-solid fa-wand-magic-sparkles',
    timeline: '2–8 weeks',
    visual: 'ai',
    tone: 'ai',
  },
  {
    number: '02',
    slug: 'mvp-engineering',
    title: 'MVP Engineering',
    kicker: 'Zero to launched',
    tagline: 'Idea to a live product real users can touch — in weeks.',
    description:
      'For founders who need something real in front of users before the next raise, the next board meeting, or the end of the runway. I scope hard, build only what proves the thesis, and ship it instrumented so the next decision comes from data instead of opinions.',
    features: [
      'Scoping and ruthless feature triage',
      'Auth, billing and onboarding out of the box',
      'Database design that survives v2',
      'Admin dashboard and internal tooling',
      'Analytics & event instrumentation',
      'Deploy, domains and monitoring',
      'Weekly demo builds you can click',
      'Clean handoff — or I keep building',
    ],
    icon: 'fa-solid fa-rocket',
    timeline: '3–6 weeks',
    visual: 'mvp',
    tone: 'indigo',
  },
  {
    number: '03',
    slug: 'shopify-cro',
    title: 'Shopify & CRO',
    kicker: 'Commerce',
    tagline: 'Stores that load fast — and then actually convert.',
    description:
      'Custom Shopify themes and headless Hydrogen storefronts, plus the conversion rate optimization that turns the traffic you already have into orders. Build and optimize are one service here, because shipping a fast store that nobody buys from is only half a job.',
    features: [
      'Custom theme & Hydrogen storefronts',
      'Figma-to-Shopify development',
      'Speed & Core Web Vitals work',
      'Conversion audits & funnel analysis',
      'A/B testing to significance',
      'Cart & checkout optimization',
      'Custom sections and app integrations',
      'Ongoing support and iteration',
    ],
    icon: 'fa-brands fa-shopify',
    timeline: '3–10 weeks',
    visual: 'commerce',
    href: '/shopify',
    tone: 'sage',
  },
  {
    number: '04',
    slug: 'ai-booking-systems',
    title: 'AI Booking Systems',
    kicker: 'Flagship build',
    tagline: 'A chat that books the appointment — and never guesses.',
    description:
      'A conversational booking system for clinics, salons and trades: customers chat on WhatsApp or your site, the assistant checks real availability and books the slot. The scheduler owns scheduling correctness; the model only handles the conversation, and it never writes to your database directly.',
    features: [
      'WhatsApp & on-site chat booking',
      'Real availability via Cal.com',
      'Confirmations and reminders',
      'Owner alerts on every booking',
      'Admin view to edit or cancel',
      'Guardrails and a human fallback',
      'Multi-language (English & Bangla)',
      'Live in about 3 weeks',
    ],
    icon: 'fa-solid fa-calendar-check',
    timeline: '3–5 weeks',
    visual: 'booking',
    tone: 'terracotta',
  },
  {
    number: '05',
    slug: 'full-stack-apis',
    title: 'Full-Stack & APIs',
    kicker: 'The engine room',
    tagline: 'The backend the interface is standing on.',
    description:
      'Node and Express APIs, MongoDB data modelling, authentication, background jobs and third-party integrations — built typed end to end so the front end and the back end never disagree about what a user is.',
    features: [
      'REST & typed API design',
      'MongoDB schema and index design',
      'Auth, roles and permissions',
      'Payments & third-party integrations',
      'Background jobs and queues',
      'React Native mobile clients',
      'Test coverage on the critical paths',
      'Docs a new dev can actually follow',
    ],
    icon: 'fa-solid fa-server',
    timeline: '2–8 weeks',
    visual: 'api',
    tone: 'amber',
  },
];

export const shopifyServices: ShopifyService[] = [
  {
    number: '01',
    title: 'Shopify Store Development',
    tagline: 'From Figma to a live, conversion-ready storefront.',
    description:
      'I build high-performing Shopify stores from Figma, custom design or brand requirements — with clean structure, responsive layout and a conversion-focused user experience.',
    features: [
      'Figma to Shopify development',
      'Custom Shopify theme development',
      'Responsive storefront design',
      'Product and collection setup',
      'Payment gateway setup',
      'Shipping and tax configuration',
      'Shopify app integration',
      'Store launch support',
    ],
    tone: 'indigo',
  },
  {
    number: '02',
    title: 'Shopify Custom Features',
    tagline: "The sections and logic off-the-shelf apps can't handle.",
    description:
      'I develop custom Shopify features, sections and storefront functionality that make stores more flexible, interactive and business-ready.',
    features: [
      'Custom Shopify sections',
      'Advanced storefront interactions',
      'Custom cart features',
      'Product filter setup',
      'Bundle and offer features',
      'Third-party integration',
      'Custom Shopify functionality',
    ],
    tone: 'terracotta',
  },
  {
    number: '03',
    title: 'Shopify Performance Optimization',
    tagline: 'Faster loads, greener Core Web Vitals, more conversions.',
    description:
      'I improve Shopify store speed, Core Web Vitals and overall performance to create a faster shopping experience for your customers.',
    features: [
      'Shopify speed optimization',
      'Core Web Vitals improvement',
      'Image and media optimization',
      'Script and app cleanup',
      'Theme code optimization',
      'Performance audit and fixes',
    ],
    tone: 'amber',
  },
  {
    number: '04',
    title: 'Shopify Store Customization',
    tagline: 'Reshape an existing store to actually fit your brand.',
    description:
      'I customize existing Shopify stores with better design, improved sections, smoother layouts and storefront features that match the brand properly.',
    features: [
      'Shopify theme customization',
      'UI / UX improvements',
      'Custom section development',
      'Homepage and product page updates',
      'Store layout modifications',
      'App-based feature setup',
      'Theme update support',
    ],
    tone: 'sage',
  },
  {
    number: '05',
    title: 'Shopify Development Support',
    tagline: 'Ongoing, reliable help long after launch.',
    description:
      'I provide ongoing Shopify development support for store owners, designers, agencies and ecommerce teams who need reliable technical help.',
    features: [
      'Ongoing Shopify support',
      'Bug fixing and maintenance',
      'Store updates and improvements',
      'UI and storefront adjustments',
      'New feature development',
      'Long-term technical support',
    ],
    tone: 'ink',
  },
];

export const projects: Project[] = [
  {
    title: 'Halo', slug: 'halo', order: 1,
    tags: ['ai', 'nextjs'], stack: 'Next.js · Claude API', type: 'AI MVP',
    blurb: 'An AI research assistant that answers from a team\'s own documents — scoped, built and launched in 19 days.',
    image: null, hasCaseStudy: true,
    modalSummary: 'An AI research assistant over a team\'s private documents — RAG, streaming answers with citations, live in 19 days.',
    modalOutcomes: [
      { stat: '19', label: 'days to launch' },
      { stat: '1.4s', label: 'first token' },
      { stat: '92%', label: 'answers cited' },
      { stat: '$0.02', label: 'cost per answer' },
    ],
    year: '2026', pills: ['AI', 'Next.js', 'MVP'],
    summary:
      "An AI research assistant that answers questions from a team's own documents, with citations. Scoped, built and launched in 19 days on Next.js and the Claude API — an MVP real users could judge before the next funding conversation.",
    meta: [
      { label: 'Role', value: 'Full-Stack Developer' },
      { label: 'Stack', value: 'Next.js · Claude API · pgvector' },
      { label: 'Timeline', value: '19 days' },
      { label: 'Type', value: 'AI MVP' },
    ],
    challenge: [
      'The team had six months of runway and a thesis: their customers would pay for answers pulled straight from their own internal documents instead of a search box that returns twenty PDFs.',
      'They needed something real enough to put in front of paying users — not a prototype, not a demo video — and they needed it before the quarter closed.',
    ],
    approach: [
      'I cut the scope to the one loop that proves the thesis: upload documents, ask a question, get a cited answer. Everything else — teams, billing tiers, integrations — went on a list for after the evidence came in.',
      'The build itself ran on an AI-accelerated workflow: generated scaffolding, auth, upload handling and test fixtures in the first days, which left the calendar free for the parts that actually decide whether a RAG product feels good — chunking strategy, retrieval quality, streaming and citation UX.',
    ],
    insights: [
      { number: '01', finding: 'Retrieval quality beats model choice', did: 'Most bad answers were bad retrieval, not bad generation. Tuning chunking and adding a rerank step moved accuracy far more than swapping models did.' },
      { number: '02', finding: 'Citations are the trust feature', did: 'Every claim links back to the source passage. It turned "interesting demo" into something the team was willing to let customers rely on.' },
      { number: '03', finding: 'Streaming makes latency survivable', did: 'Answers stream from the first token at ~1.4s, so a five-second answer feels immediate instead of broken.' },
    ],
    processSteps: [
      { number: '01', title: 'Scope to one loop', body: 'Cutting the roadmap down to upload → ask → cited answer, and writing down what we were deliberately not building.', label: 'Scope doc' },
      { number: '02', title: 'Scaffold in days, not weeks', body: 'Auth, uploads, database and the app shell generated and reviewed inside the first sprint.', label: 'App scaffold' },
      { number: '03', title: 'Retrieval & answer quality', body: 'Chunking, embeddings, reranking and an eval set to stop quality regressing silently.', label: 'RAG pipeline' },
      { number: '04', title: 'Launch & instrument', body: 'Production deploy, cost and latency budgets, and event tracking on every question asked.', label: 'Launch metrics' },
    ],
    screens: ['Ask', 'Answer with citations', 'Document library', 'Upload', 'History', 'Usage & cost'],
    mobileScreens: [],
    outcomes: [
      { stat: '19', label: 'days from kickoff to live' },
      { stat: '1.4s', label: 'to first streamed token' },
      { stat: '92%', label: 'of answers carried citations' },
      { stat: '$0.02', label: 'average cost per answer' },
    ],
    outcomesNote: 'Measured across the first month of real usage with early customers.',
  },
  {
    title: 'Vellum', slug: 'vellum', order: 2,
    tags: ['shopify', 'nextjs'], stack: 'Shopify · Next.js', type: 'E-commerce',
    blurb: 'A headless Shopify storefront with a custom checkout, sub-second loads and a CMS the team actually enjoys.',
    image: null, hasCaseStudy: true,
    modalSummary: 'A headless Shopify storefront on Hydrogen and Next.js — sub-second loads and a higher-converting mobile experience.',
    modalOutcomes: [
      { stat: '−58%', label: 'page load time' },
      { stat: '+24%', label: 'mobile conversion' },
      { stat: '98', label: 'Lighthouse score' },
      { stat: '0', label: 'downtime at launch' },
    ],
    year: '2026', pills: ['Shopify', 'Headless', 'Next.js'],
    summary: "A headless Shopify storefront rebuilt on Hydrogen and Next.js — keeping Shopify's admin while delivering sub-second loads and a higher-converting mobile experience.",
    meta: [
      { label: 'Role', value: 'Full-Stack Developer' },
      { label: 'Stack', value: 'Shopify Hydrogen · Next.js' },
      { label: 'Timeline', value: '6 weeks' },
      { label: 'Type', value: 'E-commerce' },
    ],
    challenge: [
      "Vellum's Liquid theme had grown into a tangle of apps, and the storefront was slow — especially on mobile, where most of their sales happened.",
      'They wanted the speed and flexibility of a headless build without losing the parts of Shopify their team relied on every day.',
    ],
    approach: [
      "I rebuilt the storefront headless on Shopify's Hydrogen and Next.js, keeping Shopify as the commerce backend and admin while moving the front end to a fast, cached, edge-rendered layer.",
      'A custom cart and checkout, aggressive image optimisation and a lean component library brought mobile load times under a second.',
    ],
    insights: [],
    processSteps: [
      { number: '01', title: 'Audit & performance budget', body: 'Profiling the existing theme to find exactly what was dragging load times down.', label: 'Lighthouse audit' },
      { number: '02', title: 'Headless architecture', body: "Wiring Shopify's Storefront API to a Next.js front end running on the edge.", label: 'Architecture diagram' },
      { number: '03', title: 'Storefront & cart build', body: 'Building product, collection and a custom cart and checkout flow.', label: 'Storefront UI' },
      { number: '04', title: 'Migration & launch', body: 'Content migration, redirects, QA and a zero-downtime cutover.', label: 'Launch checklist' },
    ],
    screens: ['Home', 'Collection', 'Product detail', 'Cart drawer', 'Checkout', 'Search'],
    mobileScreens: [],
    outcomes: [
      { stat: '−58%', label: 'page load time' },
      { stat: '+24%', label: 'mobile conversion' },
      { stat: '98', label: 'Lighthouse performance' },
      { stat: '0', label: 'downtime at launch' },
    ],
    outcomesNote: 'Measured against the previous Liquid theme over the first month post-launch.',
  },
  {
    title: 'Northwind', slug: 'northwind', order: 3,
    tags: ['nextjs', 'mern'], stack: 'Next.js · MERN', type: 'Web App',
    blurb: 'A full-stack analytics dashboard on Next.js and the MERN stack — real-time data, auth and role-based access.',
    image: null, hasCaseStudy: true,
    modalSummary: 'A full-stack analytics dashboard with real-time data, role-based access and server-rendered speed.',
    modalOutcomes: [
      { stat: '0.4s', label: 'data refresh' },
      { stat: '5', label: 'user roles' },
      { stat: '60+', label: 'live metrics' },
      { stat: '100%', label: 'TypeScript' },
    ],
    year: '2026', pills: ['Next.js', 'MERN', 'SaaS'],
    summary: 'A full-stack analytics dashboard on Next.js and the MERN stack — real-time numbers, role-based access and server-rendered speed.',
    meta: [
      { label: 'Role', value: 'Full-Stack Developer' },
      { label: 'Stack', value: 'Next.js · Node · MongoDB' },
      { label: 'Timeline', value: '8 weeks' },
      { label: 'Type', value: 'Web App' },
    ],
    challenge: [
      "Northwind's team was running the business on spreadsheets and a patchwork of tools, with no single, trustworthy view of their numbers.",
      'They needed a real-time dashboard with proper auth and roles — fast enough to check on a phone between meetings.',
    ],
    approach: [
      'I built a full-stack app on Next.js with a Node/Express API and MongoDB: role-based access, server-rendered pages for speed, and live-updating charts.',
      'Everything was typed end to end with TypeScript so the in-house team could extend it safely after handoff.',
    ],
    insights: [],
    processSteps: [
      { number: '01', title: 'Data modelling', body: 'Designing MongoDB schemas around the questions the team actually asks.', label: 'Schema design' },
      { number: '02', title: 'API & auth', body: 'A typed Express API with role-based access and session handling.', label: 'API routes' },
      { number: '03', title: 'Dashboard UI', body: 'Server-rendered pages and live charts that stay fast under load.', label: 'Dashboard UI' },
      { number: '04', title: 'Testing & handoff', body: 'End-to-end tests, docs and a clean repo for the in-house team.', label: 'Tests & docs' },
    ],
    screens: ['Overview', 'Reports', 'Team & roles', 'Settings', 'Detail view', 'Mobile view'],
    mobileScreens: [],
    outcomes: [
      { stat: '0.4s', label: 'data refresh (from 2.1s)' },
      { stat: '5', label: 'user roles supported' },
      { stat: '60+', label: 'live metrics tracked' },
      { stat: '100%', label: 'TypeScript coverage' },
    ],
    outcomesNote: 'Figures from the first production quarter with the in-house team.',
  },
  {
    title: 'Pulse', slug: 'pulse', order: 4,
    tags: ['reactnative'], stack: 'React Native', type: 'Mobile App',
    blurb: 'A cross-platform habit and fitness tracker built in React Native — offline-first, with buttery-smooth motion.',
    image: null, hasCaseStudy: true,
    modalSummary: 'An offline-first habit & fitness tracker in React Native — gesture-driven and fast on any connection.',
    modalOutcomes: [
      { stat: '60fps', label: 'across the app' },
      { stat: '<0.5s', label: 'cold start' },
      { stat: '0', label: 'network needed' },
      { stat: '4.8★', label: 'early rating' },
    ],
    year: '2026', pills: ['React Native', 'Expo', 'Mobile'],
    summary: 'A cross-platform habit and fitness tracker built in React Native — offline-first, gesture-driven, and fast enough to use on the train.',
    meta: [
      { label: 'Role', value: 'Mobile Developer' },
      { label: 'Stack', value: 'React Native · Expo' },
      { label: 'Timeline', value: '7 weeks' },
      { label: 'Type', value: 'Mobile App · iOS & Android' },
    ],
    challenge: [
      'Pulse wanted one app for habits and workouts that felt instant and worked on the train with no signal — without building twice for iOS and Android.',
      'Existing trackers felt heavy and online-only, breaking the moment connectivity dropped.',
    ],
    approach: [
      'I built Pulse in React Native with an offline-first local store that syncs when a connection returns, so logging never blocks on the network.',
      'Gesture-driven interactions and 60fps animations make daily logging feel quick and genuinely satisfying.',
    ],
    insights: [],
    processSteps: [
      { number: '01', title: 'Offline-first architecture', body: 'A local store and sync layer so the app works with zero signal.', label: 'Sync architecture' },
      { number: '02', title: 'Core tracking flows', body: 'Fast habit and workout logging in as few taps as possible.', label: 'Tracking flow' },
      { number: '03', title: 'Motion & polish', body: 'Gesture-driven UI and 60fps animations throughout.', label: 'Motion design' },
      { number: '04', title: 'Store release', body: 'Builds, store assets and submission for iOS and Android.', label: 'App store release' },
    ],
    screens: ['Today', 'Log a habit', 'Workout timer', 'Streaks', 'Stats', 'Profile'],
    mobileScreens: [],
    outcomes: [
      { stat: '60fps', label: 'across the app' },
      { stat: '<0.5s', label: 'cold start' },
      { stat: '0', label: 'network for core flows' },
      { stat: '4.8★', label: 'early-tester rating' },
    ],
    outcomesNote: 'From a closed beta with early testers across iOS and Android.',
  },
  {
    title: 'Anchor', slug: 'anchor', order: 5,
    tags: ['mern', 'reactnative'], stack: 'MERN · React Native', type: 'Web + Mobile',
    blurb: 'A B2B marketplace on the MERN stack with a React Native companion app — dashboards, messaging and payments.',
    image: null, hasCaseStudy: true,
    modalSummary: 'A B2B marketplace on the MERN stack with a React Native companion — one backend, two clients.',
    modalOutcomes: [
      { stat: '1→2', label: 'clients on 1 API' },
      { stat: '<100ms', label: 'message latency' },
      { stat: '99.9%', label: 'API uptime' },
      { stat: '100%', label: 'shared types' },
    ],
    year: '2026', pills: ['MERN', 'React Native', 'B2B'],
    summary: 'A B2B marketplace built on the MERN stack with a React Native companion app — recruiter-grade web dashboards plus messaging and payments on mobile.',
    meta: [
      { label: 'Role', value: 'Lead Developer' },
      { label: 'Stack', value: 'MERN · React Native' },
      { label: 'Timeline', value: '12 weeks' },
      { label: 'Type', value: 'Web + Mobile' },
    ],
    challenge: [
      'Anchor needed a marketplace connecting companies with vetted talent: a data-heavy web dashboard for clients and a lightweight mobile app for candidates — sharing one backend and one source of truth.',
      'The hard part was keeping a complex, multi-role product fast and consistent across web and mobile.',
    ],
    approach: [
      'I built a single MERN backend serving both a Next.js web dashboard and a React Native app, with shared types, role-based auth and real-time messaging over websockets.',
      'Payments, notifications and search were designed to behave identically on both platforms, so the product feels like one thing.',
    ],
    insights: [
      { number: '01', finding: 'A shared backend beats two codebases', did: 'One Node/Express + MongoDB API serves both web and mobile, so business logic lives in exactly one place.' },
      { number: '02', finding: 'Real-time has to feel instant', did: 'Websocket messaging and optimistic UI make chat and status updates feel immediate, even on a weak connection.' },
      { number: '03', finding: 'Types are the contract between web and mobile', did: 'Shared TypeScript types across the stack caught mismatches at compile time, not in production.' },
    ],
    processSteps: [
      { number: '01', title: 'System & API design', body: 'Designing one MERN backend to serve web and mobile cleanly.', label: 'System design' },
      { number: '02', title: 'Web dashboard', body: 'A recruiter-grade Next.js dashboard for client teams.', label: 'Dashboard build' },
      { number: '03', title: 'Real-time & payments', body: 'Websocket messaging, notifications and payment flows.', label: 'Realtime & payments' },
      { number: '04', title: 'Mobile companion', body: 'A focused React Native app sharing the same backend.', label: 'Mobile build' },
    ],
    screens: ['Client dashboard', 'Candidate list', 'Candidate detail', 'Messaging', 'Payments', 'Admin'],
    mobileScreens: ['App — feed', 'App — chat', 'App — profile'],
    outcomes: [
      { stat: '1 → 2', label: 'backend serving web + mobile' },
      { stat: '<100ms', label: 'message latency' },
      { stat: '99.9%', label: 'API uptime' },
      { stat: '100%', label: 'shared types across stack' },
    ],
    outcomesNote: 'Figures from launch and the first quarter of operation.',
  },
  {
    title: 'Atlas', slug: 'atlas', order: 6,
    tags: ['react', 'nextjs'], stack: 'React · Tailwind', type: 'Open Source',
    blurb: 'An open-source React + Tailwind component kit. A side project — no case study, but the code is on GitHub.',
    image: null, hasCaseStudy: false,
    modalSummary: '', modalOutcomes: [],
    year: '2026', pills: [], summary: '', meta: [],
    challenge: [], approach: [], insights: [], processSteps: [],
    screens: [], mobileScreens: [], outcomes: [], outcomesNote: '',
  },
];

/**
 * A worked example of the post body format, and the only post that currently
 * has a public page — a post without a `body` gets no route, no sitemap entry
 * and no card link (see src/pages/blog/[slug].astro).
 *
 * The prose below is assembled from copy already published elsewhere on this
 * site (the AI-method band, the four workflow steps and the caveat), so it
 * states nothing new. Treat it as a starting draft to expand, and copy the
 * block shape for the other nine posts.
 */
const aiWorkflowPostBody: PortableBlock[] = [
  {
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'The mechanical 60% of a build — scaffolding, CRUD, types, test fixtures — gets generated in minutes. The saved weeks go into architecture, performance and the details that decide whether people actually use the thing.',
      },
    ],
  },
  { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'How the workflow actually runs' }] },
  {
    _type: 'block',
    style: 'h3',
    children: [{ _type: 'span', text: 'Scope with AI, decide with judgment' }],
  },
  {
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'I pressure-test the spec against edge cases before a line is written, so week one builds the right thing instead of discovering it in week three.',
      },
    ],
  },
  { _type: 'block', style: 'h3', children: [{ _type: 'span', text: 'Generate the boring 60%' }] },
  {
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'Scaffolding, CRUD, types, test fixtures, migrations — the parts that are mechanical get generated in minutes, not days.',
      },
    ],
  },
  {
    _type: 'block',
    style: 'h3',
    children: [{ _type: 'span', text: 'Spend the saved time on the hard 40%' }],
  },
  {
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'Architecture, data modelling, performance and the interaction details are where I actually spend the budget you saved.',
      },
    ],
  },
  { _type: 'block', style: 'h3', children: [{ _type: 'span', text: 'Review everything, ship small' }] },
  {
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'AI-assisted review plus my own read on every PR, with tests and a preview deploy on each push. Nothing lands unread.',
      },
    ],
  },
  // A code block and an image, so the renderer's non-text paths are exercised
  // by the seed rather than only in production. Replace with real ones.
  {
    _type: 'code',
    language: 'ts',
    code: "// The model proposes; your code decides.\nconst booking = BookingSchema.parse(toolCall.args);\nawait db.booking.create({ data: booking });",
  },
  {
    _type: 'image',
    src: '/blog/building-with-ai-workflow-diagram.png',
    alt: 'Prompt to generated code to human review to merge',
    caption: 'Generation is one step in the loop, not the loop.',
  },
  { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'What AI does not change' }] },
  {
    _type: 'block',
    style: 'blockquote',
    children: [
      {
        _type: 'span',
        text: "Someone still has to own the architecture, catch the subtle bug, and say no to the feature that will sink the timeline. That part is still me — the tooling just means you pay for judgment instead of typing.",
      },
    ],
  },
  {
    _type: 'table',
    headerRow: true,
    caption: 'Where the time actually goes on a two-week feature.',
    rows: [
      { cells: ['Task', 'Written by AI', 'Owned by me'] },
      { cells: ['Scaffolding & boilerplate', 'Almost all of it', 'Naming and file layout'] },
      { cells: ['Data model', 'A first draft', 'Every decision that survives v2'] },
      { cells: ['Business logic', 'Roughly half', 'Correctness and edge cases'] },
      { cells: ['Tests', 'The obvious paths', 'The paths that actually break'] },
      { cells: ['Security & auth', 'Nothing I keep', 'All of it'] },
    ],
  },
];

/** FAQ for the AI-workflow post. Answers stay at 40–60 words: a longer answer
 *  is not what gets lifted into a People Also Ask result. */
const aiWorkflowFaqs: Faq[] = [
  {
    question: 'Does AI-generated code mean lower quality?',
    answer:
      'Not on its own. Generated code is a first draft, and the quality comes from what happens next — review, tests on the paths that matter, and a person who owns the architecture. Skip that step and it does get worse, faster than hand-written code would.',
  },
  {
    question: 'How much faster is an AI-accelerated workflow, honestly?',
    answer:
      'Roughly two to three times on the typing-heavy parts: scaffolding, CRUD, boilerplate, first-pass tests. Close to zero on the parts that decide whether a project succeeds — scoping, data modelling, security and knowing which feature to cut.',
  },
  {
    question: 'What do you refuse to let AI write?',
    answer:
      'Authentication, permissions, payment handling and anything touching migrations. These fail quietly and expensively, and reviewing generated code in those areas takes longer than writing it myself.',
  },
  {
    question: 'Will I be able to maintain the codebase afterwards?',
    answer:
      'Yes — that is the whole point of owning the architecture rather than the typing. You get conventional patterns, typed end to end, with a staging environment, CI and error tracking already wired up. No generated code ships that I could not have written.',
  },
];

export const posts: Post[] = [
  { title: 'How I actually build with AI — and where I still do the work', slug: 'building-with-ai-workflow', order: 1, category: 'ai', categoryLabel: 'AI', readTime: '8 min read', date: 'July 2026', publishedAt: '2026-07-01', excerpt: "The honest version of an AI-accelerated workflow: what gets generated, what gets thrown away, and the review discipline that keeps 'fast' from meaning 'fragile'.", coverLabel: 'AI workflow — cover', featured: true, image: null, body: aiWorkflowPostBody, faqs: aiWorkflowFaqs },
  { title: 'Shipping an MVP in 19 days without shipping garbage', slug: 'mvp-in-19-days', order: 2, category: 'ai', categoryLabel: 'AI', readTime: '6 min', date: 'July 2026', publishedAt: '2026-07-01', excerpt: 'Scope triage, generated scaffolding, and the four things I refuse to cut no matter how tight the deadline gets.', coverLabel: 'MVP in 19 days — cover', featured: false, image: null },
  { title: 'RAG that actually answers: chunking, reranking and citations', slug: 'rag-that-answers', order: 3, category: 'ai', categoryLabel: 'AI', readTime: '9 min', date: 'June 2026', publishedAt: '2026-06-01', excerpt: 'Most bad AI answers are bad retrieval, not bad models. The pipeline changes that moved accuracy the most.', coverLabel: 'RAG pipeline — cover', featured: false, image: null },
  { title: 'Going headless: when Shopify Hydrogen is actually worth it', slug: 'shopify-hydrogen-worth-it', order: 4, category: 'ecommerce', categoryLabel: 'E-commerce', readTime: '7 min read', date: 'June 2026', publishedAt: '2026-06-01', excerpt: "Headless is powerful, but it isn't free. Here's the honest decision framework I use to tell clients when to leave Liquid behind — and when to stay put.", coverLabel: 'Hydrogen vs Liquid — cover', featured: false, image: null },
  { title: 'Shipping a React Native app that works offline-first', slug: 'react-native-offline-first', order: 5, category: 'mobile', categoryLabel: 'Mobile', readTime: '6 min', date: 'May 2026', publishedAt: '2026-05-01', excerpt: 'A local store, a sync queue, and the patterns that keep logging instant when the signal drops.', coverLabel: 'Offline-first RN — cover', featured: false, image: null },
  { title: 'Type-safe from MongoDB to the UI in a MERN app', slug: 'type-safe-mern', order: 6, category: 'fullstack', categoryLabel: 'Full-Stack', readTime: '8 min', date: 'April 2026', publishedAt: '2026-04-01', excerpt: 'Sharing TypeScript types across the stack so the compiler catches mismatches before users do.', coverLabel: 'Type-safe MERN — cover', featured: false, image: null },
  { title: 'Core Web Vitals: a practical checklist for Next.js', slug: 'core-web-vitals-nextjs', order: 7, category: 'performance', categoryLabel: 'Performance', readTime: '5 min', date: 'March 2026', publishedAt: '2026-03-01', excerpt: 'The handful of changes that move LCP, CLS and INP the most — without a full rewrite.', coverLabel: 'Core Web Vitals — cover', featured: false, image: null },
  { title: 'What two years of freelancing taught me about scoping', slug: 'freelance-scoping', order: 8, category: 'career', categoryLabel: 'Career', readTime: '4 min', date: 'February 2026', publishedAt: '2026-02-01', excerpt: "Most project pain starts at the proposal. Here's how I scope to avoid it.", coverLabel: 'Freelance scoping — cover', featured: false, image: null },
  { title: "Building a design system you'll actually reuse", slug: 'reusable-design-system', order: 9, category: 'frontend', categoryLabel: 'Frontend', readTime: '6 min', date: 'January 2026', publishedAt: '2026-01-01', excerpt: 'Tokens, components and docs that survive past the first sprint and three engineers.', coverLabel: 'Design system — cover', featured: false, image: null },
  { title: 'Role-based auth in a Next.js + Express app, end to end', slug: 'role-based-auth-nextjs-express', order: 10, category: 'backend', categoryLabel: 'Backend', readTime: '7 min', date: 'December 2025', publishedAt: '2025-12-01', excerpt: 'Sessions, middleware and protecting routes on both the server and the client.', coverLabel: 'Auth in Next.js — cover', featured: false, image: null },
];

export const about: AboutContent = {
  seo: {
    title: 'About — Riajul Islam',
    description:
      "I'm an AI-powered full-stack developer based in Dhaka, building web and mobile products for founders and teams worldwide.",
  },
  eyebrow: '— About Me',
  heading: "Hey, I'm\nRiajul.",
  leadParagraph:
    "I'm an AI-powered full-stack developer based in Dhaka, building web and mobile products for founders and teams worldwide. AI does the typing; I do the thinking — which means clients get production software in weeks without giving up the parts that make it maintainable.",
  secondParagraph:
    "With 1–2 years building production apps on Next.js, the MERN stack, React Native and Shopify — and an AI-accelerated workflow layered on top — I'm now open to a full-time role and a few freelance projects. I like owning features end to end and shipping things that actually go live.",
  tags: ['Clean, typed code', 'AI-assisted, human-reviewed', 'Lo-fi while coding', 'Open source', 'Reading'],
  // Drop matching files into public/about/ (or upload in the Studio) and the
  // placeholders become real photos — no code change needed.
  gallery: [
    { caption: 'Me', alt: 'Riajul Islam', src: '/about/me.jpg' },
    { caption: 'My setup', alt: 'My desk and monitor setup', src: '/about/setup.jpg' },
    { caption: 'On a project', alt: 'Working on a client project', src: '/about/project.jpg' },
    { caption: 'Coffee & code', alt: 'Coffee beside a laptop', src: '/about/coffee.jpg' },
    { caption: 'Gaming', alt: 'Gaming setup', src: '/about/gaming.jpg' },
    { caption: 'Books I read', alt: 'A shelf of books', src: '/about/books.jpg' },
    { caption: 'Outdoors', alt: 'Outdoors', src: '/about/outdoors.jpg' },
  ],
  outsideEyebrow: '— Outside the code',
  outsideTitle: 'The stuff that makes the work better.',
  outsideBody:
    "Long reading sessions, football, gaming with friends, and tinkering with side projects nobody asked for. They're not breaks from building — they're where the curiosity comes from. Most of what I bring to a codebase is just being interested in how things work and refusing to leave them half-done.",
  traitsHeading: { eyebrow: '— Me as a developer', title: '4 things that make me me.' },
  buildHeading: {
    eyebrow: '— What I build',
    title: 'The full range.',
    lede: 'AI products and fast MVPs are where most of my work lands lately, but I build across the stack. Most projects blend two or three.',
  },
  buildLink: { label: 'See the services →', href: '/services' },
  stackLink: { label: 'What I build with →', href: '/stack' },
  traits: [
    { title: 'I read the docs, then the source', body: "When something breaks, I'd rather understand why than paste a fix — and that goes double for code an AI wrote. Understanding it is the job." },
    { title: 'My best work happens late', body: 'The world goes quiet, notifications stop, and the hard problems finally hold still long enough to solve.' },
    { title: 'I ship, then refine', body: 'Perfect-but-unshipped helps nobody. I get a working version out, then make it better with real feedback.' },
    { title: 'My GitHub is a graveyard of ideas', body: 'Dozens of half-built repos and experiments. Every so often two of them collide and become something real.' },
  ],
  closingTitle: "Think I'd be a\ngood fit?",
};

export const resume: ResumeContent = {
  highlights: [
    { value: '15+', label: 'Projects shipped' },
    { value: '3wk', label: 'Typical MVP build' },
    { value: '2yr', label: 'Building production apps' },
  ],
  summary:
    'AI-powered full-stack developer with 1–2 years building production web and mobile applications. Comfortable across the stack — Next.js, React, Node.js, Express and MongoDB — with hands-on Shopify (Liquid & Hydrogen), React Native and LLM API experience. I run an AI-accelerated workflow that cuts delivery time substantially while keeping code typed, tested and reviewed. Open to full-time roles and select freelance work.',
  skills: [
    { label: 'Frontend', values: 'React, Next.js, TypeScript, JavaScript (ES6+), Tailwind CSS, HTML5, CSS3, Redux' },
    { label: 'Backend', values: 'Node.js, Express, REST APIs, MongoDB, Mongoose, JWT Auth' },
    { label: 'AI', values: 'OpenAI & Claude APIs, RAG / vector search, streaming UIs, prompt design, Claude Code, Cursor' },
    { label: 'Mobile', values: 'React Native, Expo' },
    { label: 'E-commerce', values: 'Shopify, Liquid, Hydrogen, Storefront API, CRO & A/B testing' },
    { label: 'Tools & DevOps', values: 'Git, GitHub, Vercel, Netlify, Postman, Figma, Jest' },
  ],
  experience: [
    {
      title: 'Frontend Developer — Brightlane Studio',
      period: '2024 – Present · Remote',
      bullets: [
        'Built and maintained client web apps in Next.js and React, lifting Lighthouse performance scores to 95+.',
        'Introduced an AI-assisted development workflow across the team, cutting typical feature delivery time by roughly half without loosening review standards.',
        'Shipped AI product features — assistant chat and semantic search over client content — on the OpenAI and Claude APIs.',
        'Developed headless Shopify storefronts with Hydrogen, cutting page-load times by roughly half.',
      ],
    },
    {
      title: 'Junior Web Developer — Kettle & Co.',
      period: '2023 – 2024',
      bullets: [
        'Shipped features across a MERN-stack web app serving 5,000+ monthly users.',
        'Built REST APIs with Node/Express and MongoDB, plus a React Native companion app MVP.',
        'Added unit and integration tests with Jest, reducing regression bugs across releases.',
      ],
    },
  ],
  projects: [
    { name: 'Halo', description: 'AI research assistant MVP (Next.js, Claude API, pgvector). Zero to live in 19 days.' },
    { name: 'Vellum', description: 'Headless Shopify storefront (Hydrogen, Next.js). Sub-second mobile loads and +24% conversion.' },
    { name: 'Northwind', description: 'Full-stack analytics dashboard (Next.js, Node, MongoDB). Real-time data with role-based access.' },
  ],
  education: [
    { title: 'B.Sc. in Computer Science & Engineering — [University Name]', year: '2023' },
    { title: 'Meta Front-End Developer Certificate — Coursera', year: '2023' },
  ],
  languages: 'English (professional) · Bangla (native)',
};

export const servicesPage: ServicesPageContent = {
  seo: {
    title: 'Services — AI, MVP & Shopify Development — Riajul Islam',
    description:
      'AI web development, MVP engineering, Shopify & CRO, and full-stack APIs — production software built with an AI-accelerated workflow and shipped in weeks.',
  },
  hero: {
    eyebrow: 'Services',
    chip: 'Taking projects',
    headlineLines: ['What I build,', 'and how'],
    accentWord: 'fast.',
    lede:
      "Five services, one method: AI does the mechanical work, I do the engineering. You get production software on a timeline that used to require a team — without the codebase you'd have to apologise for later.",
    ledeShort: 'Five services, one method: AI does the mechanical work, I do the engineering.',
    primaryCta: { label: 'Start a project', href: '/start?tab=form' },
    secondaryCta: { label: 'See the services', href: '#svc-list' },
    stats: [
      { value: '3 wk', label: 'Typical MVP build' },
      { value: '~2×', label: 'Faster than a hand-typed build' },
      { value: '100%', label: 'Code reviewed by a human' },
    ],
  },
  velocity: {
    kicker: 'Same scope, two timelines',
    rows: [
      { label: 'Traditional build', value: '10–12 weeks', barWidth: '100%', muted: true },
      { label: 'AI-accelerated', value: '3–5 weeks', barWidth: '38%', muted: false },
    ],
    foot: 'The difference is generated boilerplate, not skipped steps.',
  },
  methodHeading: { eyebrow: '— The method', title: 'Where the weeks actually go.' },
  listHeading: { eyebrow: '— Services', title: 'Five ways I can help.' },
  listCta: { label: 'Start a project ↗', href: '/start?tab=form' },
  serviceCta: { label: 'Start a project', href: '/start?tab=form' },
  serviceDeepLinkCta: { label: 'See the detail', href: '' },
  stackLink: { label: 'See what I build with →', href: '/stack' },
  engagementsHeading: { eyebrow: '— How we work together', title: 'Three ways to start.' },
  engagements: [
    {
      number: '01',
      title: 'Fixed-scope sprint',
      body: 'One clear outcome — a feature, an integration, an audit — scoped, quoted and delivered in one to two weeks.',
      meta: '1–2 weeks · fixed price',
    },
    {
      number: '02',
      title: 'Product build',
      body: 'An MVP or a full application, from schema to launch. Weekly demo builds, a fixed scope and a real launch date.',
      meta: '3–8 weeks · fixed scope',
    },
    {
      number: '03',
      title: 'Ongoing partner',
      body: 'A reserved slice of my week for teams that keep shipping — features, fixes, experiments and the odd fire.',
      meta: 'Monthly · rolling',
    },
  ],
  processHeading: {
    eyebrow: '— Process',
    title: 'Built\nfor speed.',
    lede: 'Six steps from first message to production. No bloat, no ceremony — just momentum and clean commits.',
  },
  faqHeading: { eyebrow: '— Services FAQ', title: 'The questions\nI usually get.' },
  faqs: [
    { question: 'Which service do I actually need?', answer: "If you have an idea and no product, that's MVP Engineering. If you have a product and a backlog, that's AI Web Development. If you have a store and traffic that isn't converting, that's Shopify & CRO. Tell me the situation and I'll say which one — including if the answer is none of them." },
    { question: 'How do you price this?', answer: 'Fixed price against a fixed scope for sprints and product builds, and a monthly rate for ongoing work. You get the number before anything starts, and it does not move unless the scope does.' },
    { question: 'Can you add AI features to an existing app?', answer: 'Yes — assistants, semantic search over your own content, extraction and workflow automation, wired into what you already have with cost and latency budgets agreed up front.' },
    { question: 'What if the AI-generated code is wrong?', answer: "Then it gets rewritten before you ever see it. Generated code is a first draft, not a deliverable — everything goes through tests, review and my own read before it reaches your repo." },
    { question: 'Do I own the code?', answer: 'Entirely. Your repo, your accounts, your infrastructure from day one — plus docs and a handoff walkthrough at the end.' },
    { question: 'How fast can you start?', answer: 'Usually within a week or two, sometimes sooner for small sprints. Send the details and I will tell you the honest next opening.' },
  ],
  closing: {
    title: 'Know what you need —\nor need help deciding?',
    primary: { label: 'Get in touch', href: '/start?tab=form' },
    secondary: { label: 'See the work', href: '/work' },
  },
};

export const shopifyPage: ShopifyPageContent = {
  seo: {
    title: 'Shopify & CRO — Fast Stores That Convert — Riajul Islam',
    description:
      'Headless Hydrogen builds, custom Liquid themes, speed work and conversion rate optimization — Shopify stores that load fast and actually sell.',
  },
  hero: {
    eyebrow: 'Shopify & CRO',
    chip: 'Open for builds',
    headlineLines: ['Shopify stores,', 'built to'],
    accentWord: 'convert.',
    lede:
      'Two halves of one job: build a store that loads in under a second, then test it into converting. Headless Hydrogen, custom Liquid themes, speed work and the CRO program that turns your existing traffic into orders. No bloated apps, no theme spaghetti.',
    ledeShort: 'Build a store that loads in under a second — then test it into converting.',
    primaryCta: { label: 'Start a Shopify project', href: '/start?tab=form' },
    secondaryCta: { label: 'Jump to CRO', href: '#cro' },
    stats: [
      { value: '−58%', label: 'Faster load times' },
      { value: '+24%', label: 'Mobile conversion' },
      { value: '12', label: 'Shopify builds shipped' },
    ],
  },
  brandsHeading: {
    eyebrow: "— Brands I've worked with",
    title: 'Stores that needed to be fast — and stay that way.',
  },
  brands: ['Vellum', 'Harborline', 'Northwind', 'Brightlane', 'Kettle & Co.', 'Field Notes', 'Lumen', 'Atlas Supply'],
  servicesHeading: { eyebrow: '— What I do on Shopify', title: 'Five ways I help your store.' },
  servicesCta: { label: 'Start a project ↗', href: '/start?tab=form' },
  serviceTagLabel: 'Shopify service',
  serviceCta: { label: 'Start a project', href: '/start?tab=form' },
  approachHeading: { eyebrow: '— My approach', title: 'How a build actually goes.' },
  approach: [
    { number: '01', title: 'Audit & strategy', body: 'A Lighthouse audit and a funnel review, then a plan tied to revenue — not vanity metrics.' },
    { number: '02', title: 'Design & build', body: 'Theme or headless, built mobile-first with clean, documented, reviewable code.' },
    { number: '03', title: 'Speed & QA', body: 'Real-device testing, a performance budget, and a checkout that survives the edge cases.' },
    { number: '04', title: 'Launch & optimize', body: 'A zero-downtime cutover with analytics in place — then we test our way to a better conversion rate.' },
  ],
  numbersHeading: { eyebrow: '— By the numbers', title: 'Built, then measured.' },
  // Ordered so the headline money stat lands last — it becomes the big,
  // full-width "hero" cell when the grid collapses to 2×2 + 1 on mobile.
  numbers: [
    { value: 12, label: 'Shopify stores built & optimized' },
    { value: 47, label: 'A/B tests shipped' },
    { value: 58, prefix: '−', suffix: '%', label: 'Page load time' },
    { value: 138, prefix: '+', suffix: '%', label: 'Best single-test lift' },
    { value: 1.2, prefix: '$', decimals: 1, suffix: 'M+', label: 'Extra revenue generated' },
  ],
  numbersNote:
    'Figures across recent Shopify engagements. Your numbers depend on your starting point — the audit tells us where the headroom is.',
  cro: {
    heading: {
      eyebrow: '— Conversion rate optimization',
      title: 'More revenue from the\ntraffic you already have.',
    },
    lede:
      'A fast store is step one — CRO is how it actually sells. I run data-driven tests on your product pages, cart and checkout to turn more of your existing visitors into buyers. Same traffic, more orders, no extra ad spend.',
    features: [
      'Conversion audit & funnel analysis',
      'A/B & multivariate testing',
      'Product page (PDP) optimization',
      'Cart & checkout optimization',
      'Mobile conversion optimization',
      'Trust, urgency & social proof',
      'Heatmaps & session recordings',
      'Landing page optimization',
    ],
    primaryCta: { label: 'Get a CRO audit', href: '/start?tab=form' },
    secondaryCta: { label: 'Do the math', href: '#cro-calc' },
  },
  croDashboard: {
    rateLabel: 'Conversion rate',
    rateBefore: '2.1%',
    rateAfter: '3.4%',
    rateBadge: '+62%',
    abTitle: 'A/B Test · Product page',
    abStatus: 'Running',
    abVariants: [
      { name: 'A · Control', value: '2.4%', barWidth: '60%', winner: false },
      { name: 'B · Sticky add-to-cart', value: '3.2%', barWidth: '80%', winner: true, winnerLabel: 'Winner' },
    ],
    abFoot: '+34% uplift · 98% confidence · 14-day test',
    funnelLabel: 'Checkout funnel',
    funnel: [
      { step: 'Sessions', value: '12,480', barWidth: '100%' },
      { step: 'Product views', value: '7,140', barWidth: '74%' },
      { step: 'Add to cart', value: '3,120', barWidth: '48%' },
      { step: 'Checkout', value: '1,560', barWidth: '32%' },
      { step: 'Purchase', value: '998', barWidth: '22%' },
    ],
  },
  leakHeading: {
    eyebrow: '— Where the money leaks',
    title: 'For every 100 visitors,\n92 leave without buying.',
  },
  funnel: [
    { name: 'Sessions', count: 12480, width: '100%' },
    { name: 'Product views', count: 7140, width: '72%', drop: '−43%', why: 'slow load · weak hero' },
    { name: 'Add to cart', count: 3120, width: '48%', drop: '−56%', why: 'unclear PDP · no urgency' },
    { name: 'Checkout', count: 1560, width: '33%', drop: '−50%', why: 'forced account · surprise fees' },
    { name: 'Purchase', count: 998, width: '22%', drop: '−36%', why: 'long form · few pay options' },
  ],
  fixes: [
    { icon: 'fa-box-open', title: 'Product pages', body: 'Imagery, copy, reviews and a sticky add-to-cart.', barWidth: '92%' },
    { icon: 'fa-cart-shopping', title: 'Cart & checkout', body: 'Fewer steps, express pay, recovered carts.', barWidth: '88%' },
    { icon: 'fa-mobile-screen-button', title: 'Mobile UX', body: 'Speed and tap-friendly flows where most traffic is.', barWidth: '80%' },
    { icon: 'fa-gauge-high', title: 'Store speed', body: 'Core Web Vitals that pay back in orders.', barWidth: '71%' },
    { icon: 'fa-shield-halved', title: 'Trust & proof', body: 'Reviews, badges and guarantees at the point of doubt.', barWidth: '64%' },
  ],
  croProcessHeading: { eyebrow: '— The CRO process', title: 'A loop, not a one-off.' },
  croProcess: [
    { number: '01', title: 'Audit & data review', body: 'GA4, Shopify analytics, heatmaps and session recordings pinpoint exactly where visitors hesitate and drop.' },
    { number: '02', title: 'Hypotheses & prioritisation', body: 'Findings become testable hypotheses, ranked by impact, confidence and effort (ICE) — highest leverage first.' },
    { number: '03', title: 'Design & build the variant', body: 'Built directly in your theme — pixel-clean, fast, and flicker-free.' },
    { number: '04', title: 'A/B test to significance', body: 'Traffic is split and the test runs to 95%+ confidence. No guessing, no peeking.' },
    { number: '05', title: 'Ship the winner', body: 'Winners roll out, the learning is documented, and the lift is banked.' },
  ],
  croProcessLoopNote: 'Then back to 01 — at a higher baseline',
  calcHeading: { eyebrow: '— Do the math', title: 'What a better rate is worth.' },
  calcCta: { label: 'Get your number ↗', href: '/start?tab=form' },
  calcLabels: {
    visitors: 'Monthly visitors',
    aov: 'Average order value',
    current: 'Current conversion rate',
    target: 'Target conversion rate',
    outKicker: 'Extra revenue / year',
    revenueNow: 'Revenue now',
    revenueAfter: 'After',
    monthlyUplift: 'Monthly uplift',
    extraOrders: 'Extra orders / yr',
  },
  calcNote:
    'Illustrative — drag the sliders to model your own store. Real projections come from your analytics.',
  experimentsHeading: { eyebrow: '— Tests that moved the needle', title: 'Real experiments, ranked by lift.' },
  experimentsColumns: { test: 'Test', metric: 'Metric', lift: 'Lift' },
  experiments: [
    { title: 'Sticky add-to-cart', area: 'PDP · mobile', metric: 'Add-to-cart rate', lift: 34 },
    { title: 'One-page checkout', area: 'Checkout', metric: 'Checkout completion', lift: 19 },
    { title: 'Trust badges at checkout', area: 'Checkout', metric: 'Completion rate', lift: 12 },
    { title: 'Free-shipping threshold bar', area: 'Cart', metric: 'Average order value', lift: 9 },
  ],
  featuredHeading: { eyebrow: '— Featured Shopify work', title: 'A headless rebuild, in detail.' },
  featuredCta: { label: 'All projects ↗', href: '/work' },
  testimonialsHeading: { eyebrow: '— What clients say', title: 'Shipped, fast, and still standing.' },
  testimonials: [
    { quote: 'Riajul shipped our Shopify rebuild ahead of schedule and our store has never been faster. Clean code, clear updates, zero drama.', name: 'Sarah Whitfield', role: 'Founder, Vellum', initials: 'SW', color: '#0F766E' },
    { quote: 'He took our slow, app-stuffed theme and got it under a second on mobile. Conversion went up the first week.', name: 'Marcus Lee', role: 'Founder, Harborline', initials: 'ML', color: '#5e8e3e' },
  ],
  faqHeading: { eyebrow: '— Shopify & CRO FAQ', title: 'The questions\nI usually get.' },
  faqs: [
    { question: 'Headless or a regular theme — which do I need?', answer: "Most stores don't need headless. If a fast, well-built theme gets you there, I'll say so. Headless earns its keep once you've outgrown Liquid or want a fully custom front end — I'll be honest about which side you're on." },
    { question: 'Can you work with my existing theme?', answer: "Yes. A lot of the work is improving what's already there — speed, bug fixes, new sections, conversion tests — without a full rebuild." },
    { question: 'How long does a Shopify build take?', answer: "A focused theme build is usually 3–6 weeks; a headless storefront, 6–10. An AI-accelerated workflow does a lot of the theme scaffolding, so more of that time goes into the conversion details. You get a real timeline after a short scoping call, not a guess." },
    { question: 'Do you handle migrations?', answer: "WooCommerce, Magento, BigCommerce or a legacy Shopify theme — I migrate products, content and URLs with redirects so you don't lose rankings." },
    { question: 'How much can CRO realistically gain me?', answer: "It depends on your starting point — a rough, app-heavy store has more headroom than a polished one. Single tests often land 5–30% on the metric they target, and because CRO compounds, those wins stack. I'll give you an honest read after the audit, not a fantasy number." },
    { question: 'Do I need a lot of traffic for A/B testing?', answer: "Some, yes — statistical significance needs volume. Under ~10k monthly visitors we lean on best-practice fixes, heatmaps and session recordings first, and save formal A/B tests for the pages that get enough traffic." },
    { question: 'How long does a CRO test take?', answer: 'Usually 2–4 weeks per test to reach 95%+ confidence, depending on traffic and effect size. Rushing it is how you ship false winners — so I let tests run their course.' },
    { question: 'Will testing slow my store down?', answer: "No. Variants are built into the theme and performance-budgeted — no third-party flicker, no layout shift. Speed and conversion pull the same direction here." },
    { question: 'What happens after launch?', answer: "I don't vanish at handoff. You get docs, a clean repo, and support options — including a steady cadence of conversion tests if you want to keep compounding the gains." },
  ],
  closing: {
    title: 'Ready to make Shopify\nactually sell?',
    primary: { label: 'Get in touch', href: '/start?tab=form' },
    secondary: { label: 'See all services', href: '/services' },
  },
};

export const workPage: WorkPageContent = {
  seo: {
    title: 'Work — Riajul Islam',
    description:
      "Selected products I've shipped — AI products and MVPs, headless Shopify, full-stack web apps and cross-platform mobile.",
  },
  hero: {
    eyebrow: 'Selected Work',
    headlineLines: ["Everything I've", 'built, in one place.'],
    lede:
      "A selection of products I've shipped — from AI MVPs and headless Shopify storefronts to full-stack web apps and cross-platform mobile. Each one built to make it ship.",
    ledeShort: "AI MVPs, Shopify storefronts, web apps and mobile — each one shipped.",
  },
  filters: [
    { label: 'All', href: 'all' },
    { label: 'AI', href: 'ai' },
    { label: 'Shopify', href: 'shopify' },
    { label: 'Next.js', href: 'nextjs' },
    { label: 'React Native', href: 'reactnative' },
    { label: 'MERN', href: 'mern' },
  ],
  modalCtaLabel: 'View full case study →',
  closing: {
    title: "Like what you see?\nLet's build the next one.",
    primary: { label: 'Get in touch', href: '/start?tab=form' },
    secondary: { label: 'View résumé', href: '/resume' },
  },
};

export const blogPage: BlogPageContent = {
  seo: {
    title: 'Blog — Riajul Islam',
    description:
      'Notes on building things — AI-accelerated development, Next.js, Shopify, the MERN stack and React Native.',
  },
  hero: {
    eyebrow: 'Writing',
    headlineLines: ['Notes on', 'building things.'],
    lede:
      'Short, practical write-ups on building with AI, Next.js, Shopify, the MERN stack and React Native — plus the occasional lesson from shipping on a deadline.',
    ledeShort: 'Short, practical write-ups on building with AI — and shipping on a deadline.',
  },
  categories: [
    { label: 'All', href: 'all' },
    { label: 'AI', href: 'ai' },
    { label: 'E-commerce', href: 'ecommerce' },
    { label: 'Mobile', href: 'mobile' },
    { label: 'Full-Stack', href: 'fullstack' },
    { label: 'Frontend', href: 'frontend' },
    { label: 'Backend', href: 'backend' },
    { label: 'Performance', href: 'performance' },
    { label: 'Career', href: 'career' },
  ],
  featuredBadge: 'Featured',
  emptyMessage: 'No posts in this category yet — check back soon.',
  browseLabel: 'Browse by topic',
  // Hub copy for /blog/category/<slug>. Deliberately plain and factual — these
  // are placeholders to rewrite in your own voice as each topic fills out. A
  // category with no entry here still gets a hub, titled from its chip label.
  categoryIntros: [
    { category: 'ai', title: 'AI-accelerated development', lede: 'How I actually build with AI — what gets generated, what gets thrown away, and the review discipline in between.' },
    { category: 'ecommerce', title: 'E-commerce & Shopify', lede: 'Headless builds, Liquid themes, storefront performance and the decisions behind going headless at all.' },
    { category: 'mobile', title: 'Mobile', lede: 'Cross-platform apps with React Native — offline-first patterns, sync and shipping to both stores.' },
    { category: 'fullstack', title: 'Full-stack', lede: 'End-to-end builds: data modelling, APIs and keeping types honest from the database to the UI.' },
    { category: 'frontend', title: 'Frontend', lede: 'Interfaces, design systems and the front-end craft that survives past the first sprint.' },
    { category: 'backend', title: 'Backend', lede: 'APIs, auth, jobs and the server-side decisions that are expensive to reverse.' },
    { category: 'performance', title: 'Performance', lede: 'Core Web Vitals, load time and the handful of changes that move them most.' },
    { category: 'career', title: 'Career & freelancing', lede: 'Scoping, pricing conversations and lessons from shipping client work on a deadline.' },
  ],
  closing: {
    title: 'Got a project worth\nwriting about?',
    primary: { label: 'Get in touch', href: '/start?tab=form' },
    secondary: { label: 'See my work', href: '/work' },
  },
};

export const startPage: StartPageContent = {
  seo: {
    title: "Let's work together — Riajul Islam",
    description: 'Hiring for a role or have a project in mind? Book a call or send the details.',
  },
  eyebrow: "— Hiring or building? Let's talk",
  headlineLines: ["Let's work", 'together.'],
  lede:
    "Hiring for a role or have a project in mind? Book a quick call, or send the details and I'll come back to you with next steps. Either way, you'll hear from me within 24 hours.",
  ledeShort: "Book a call or send the details — you'll hear from me within 24 hours.",
  callTabLabel: 'Book a call',
  formTabLabel: 'Send a message',
  call: {
    title: '30-minute intro call',
    body: "No pitch, no pressure. We'll talk through the role or project, the stack and timeline, and whether we're a good match.",
    points: [
      '30 minutes · video call',
      'Dhaka time (GMT+6), flexible across zones',
      'Reply within 24 hours',
    ],
    embedLabel: 'Scheduler embed — Cal.com / Calendly',
    schedulerUrl: 'https://calendly.com/riajulpislam/30min',
    schedulerFallbackLabel: 'Open the booking page ↗',
  },
  form: {
    nameLabel: 'Your name *',
    namePlaceholder: 'Jane Doe',
    emailLabel: 'Work email *',
    emailPlaceholder: 'jane@company.com',
    needsLabel: "What's this about? *",
    needs: [
      'AI web development',
      'MVP engineering (0 → 1)',
      'Shopify & CRO',
      'Web app (Next.js / React)',
      'Full-stack / API work (MERN)',
      'Mobile app (React Native)',
      'A full-time / contract role',
    ],
    budgetLabel: 'Budget',
    budgetPlaceholder: 'Select a range',
    budgets: ['Under $2k', '$2k–5k', '$5k–10k', '$10k–25k', '$25k+', 'Not sure yet'],
    timelineLabel: 'Timeline',
    timelinePlaceholder: 'Select a timeline',
    timelines: ['ASAP', 'Within 1 month', '1–3 months', '3+ months / flexible'],
    messageLabel: 'Anything else? (optional)',
    messagePlaceholder:
      "A few lines about the product, the team, or what's keeping you up at night.",
    submitLabel: 'Send message',
    note: "I'll get back to you within 24 hours.",
  },
  success: {
    title: 'Got it — thank you.',
    body: "Your details are in. I'll review and reply within 24 hours with next steps. Talk soon.",
    backLabel: 'Back to home',
  },
};

export const caseStudy: CaseStudyContent = {
  challengeHeading: { eyebrow: '— The Challenge', title: 'What needed\nsolving.' },
  approachHeading: { eyebrow: '— The Approach', title: 'How I\nbuilt it.' },
  insightsHeading: { eyebrow: '— Key Decisions', title: 'The calls that shaped it.' },
  processHeading: { eyebrow: '— Process', title: 'How the work got done.' },
  screensHeading: { eyebrow: '— Selected Screens', title: 'A closer look.' },
  mobileHeading: { eyebrow: '— Mobile Companion', title: 'The app, up close.' },
  outcomesHeading: { eyebrow: '— Outcomes', title: 'The work moved the numbers.' },
  nextHeading: { eyebrow: '— Next Project', title: '' },
};

export const stackPage: StackPageContent = {
  seo: {
    title: 'What I Build With — Stack & Setup — Riajul Islam',
    description:
      'The tools I actually use — Astro, Next.js, Supabase, Prisma, Stripe, Sanity, Cloudflare — and the four setups I start projects from.',
  },
  hero: {
    eyebrow: 'What I build with',
    headlineLines: ['The tools, and', 'why I picked'],
    accentWord: 'them.',
    lede:
      "I start from a setup I already trust rather than re-litigating the stack every project. Here's what I reach for, what each piece is actually doing, and what goes into a build whether or not anyone asks for it.",
    ledeShort: 'I start from a setup I already trust, not a fresh argument about tools.',
    primaryCta: { label: 'Start a project', href: '/start?tab=form' },
    secondaryCta: { label: 'See the services', href: '/services' },
    stats: [
      { value: '4', label: 'Setups I build from' },
      { value: '27', label: 'Tools in rotation' },
      { value: '8', label: 'Things set up every time' },
    ],
  },
  templatesHeading: {
    eyebrow: '— How I start',
    title: 'Four setups I\nbuild from.',
    lede: 'Which one a project gets depends on whether it needs a login, a database and money changing hands. When it is borderline I take the heavier one — switching mid-build is the expensive mistake.',
  },
  templates: [
    {
      number: '01',
      title: 'Landing / Marketing',
      tagline: 'Content-driven sites with no login and no database.',
      bestFor: 'Marketing sites, landing pages, portfolios, blogs',
      stack: ['Astro', 'Tailwind', 'GSAP', 'Sanity', 'Resend', 'Cloudflare Pages', 'Turnstile', 'PostHog'],
      note: 'Ships in days and costs almost nothing to run.',
      tone: 'sage',
    },
    {
      number: '02',
      title: 'Standard Web App',
      tagline: 'The default the moment someone says portal, dashboard or booking.',
      bestFor: 'Customer portals, dashboards, booking systems, SaaS v1',
      stack: ['Next.js', 'Tailwind', 'Supabase', 'Prisma', 'Stripe', 'Resend', 'Vercel', 'Sentry', 'PostHog'],
      note: 'One vendor for database, auth and storage keeps the moving parts low.',
      tone: 'indigo',
    },
    {
      number: '03',
      title: 'B2B / Multi-Tenant',
      tagline: 'When organizations, roles and SSO are real requirements.',
      bestFor: 'Team accounts, role hierarchies, invites, single sign-on',
      stack: ['Next.js', 'Tailwind', 'Neon', 'Prisma', 'Clerk', 'Cloudflare R2', 'Stripe', 'Sentry', 'PostHog'],
      note: 'Only when the org model genuinely needs it — it costs more to run.',
      tone: 'ink',
    },
    {
      number: '04',
      title: 'AI Feature App',
      tagline: 'Template 02 or 03 with an AI module bolted on properly.',
      bestFor: 'Assistants, semantic search, extraction, chat booking',
      stack: ['Provider-agnostic SDK', 'Validated tool calls', 'Job queue', 'Streaming UI', 'Per-user cost logging', 'Rate limiting'],
      note: 'AI is a module on a real app, never a stack of its own.',
      tone: 'amber',
    },
  ],
  toolsHeading: {
    eyebrow: '— The toolbox',
    title: 'The toolbox.',
    lede: 'Chosen once and used consistently, so I get faster with them rather than starting over each time. The boring, proven option wins unless there is a specific reason it cannot.',
  },
  toolGroups: [
    {
      title: 'Frontend',
      tools: [
        { name: 'Astro', role: 'Static & content sites' },
        { name: 'Next.js', role: 'Apps with auth and server logic' },
        { name: 'Tailwind CSS', role: 'Styling' },
        { name: 'GSAP', role: 'Animation' },
      ],
    },
    {
      title: 'Mobile',
      tools: [{ name: 'React Native (Expo)', role: 'Cross-platform apps' }],
    },
    {
      title: 'Backend & data',
      tools: [
        { name: 'Supabase', role: 'Postgres, auth, storage, realtime' },
        { name: 'Neon', role: 'Postgres with branching' },
        { name: 'Prisma', role: 'ORM' },
        { name: 'Clerk', role: 'Orgs, roles and SSO' },
      ],
    },
    {
      title: 'Hosting & storage',
      tools: [
        { name: 'Cloudflare Pages', role: 'Static sites and workers' },
        { name: 'Vercel', role: 'Next.js apps' },
        { name: 'Render', role: 'Long-running services and cron' },
        { name: 'Cloudflare R2', role: 'Object storage' },
      ],
    },
    {
      title: 'Content & commerce',
      tools: [
        { name: 'Sanity', role: 'Structured content' },
        { name: 'Shopify', role: 'Commerce (Liquid & Hydrogen)' },
        { name: 'Stripe', role: 'Payments' },
        { name: 'Resend', role: 'Transactional email' },
      ],
    },
    {
      title: 'AI',
      tools: [
        { name: 'Claude & GPT', role: 'Assistants and reasoning' },
        { name: 'Groq', role: 'Latency-critical inference' },
        { name: 'Zod', role: 'Validating every tool call' },
      ],
    },
    {
      title: 'Booking & automation',
      tools: [
        { name: 'Cal.com', role: 'Scheduling engine' },
        { name: 'n8n', role: 'Workflow automation' },
        { name: 'WhatsApp API', role: 'Conversations and reminders' },
      ],
    },
    {
      title: 'Quality & insight',
      tools: [
        { name: 'Sentry', role: 'Error tracking' },
        { name: 'PostHog', role: 'Analytics, replay, funnels' },
        { name: 'Turnstile', role: 'Form spam protection' },
        { name: 'Vitest & Playwright', role: 'Tests on the paths that matter' },
      ],
    },
  ],
  everyBuildHeading: {
    eyebrow: '— In every build',
    title: 'What I set up\nwithout being asked.',
  },
  everyBuild: [
    'A staging environment as well as production',
    'CI that type-checks and tests on every push',
    'Error tracking wired up before launch',
    'Uptime monitoring, not just app errors',
    'Automated backups with a tested restore',
    'Spam protection on every public form',
    'Email domain records (SPF, DKIM, DMARC) set up',
    'Your own accounts — you own the infrastructure',
  ],
  everyBuildNote:
    'None of this is an upsell. It is the difference between a site that launches and a site that keeps running after I hand it over.',
  closing: {
    title: 'Want to talk\nthrough a build?',
    primary: { label: 'Get in touch', href: '/start?tab=form' },
    secondary: { label: 'See the services', href: '/services' },
  },
};
