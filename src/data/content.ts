// ---------------------------------------------------------------------------
// Seeded fallback content — mirrors the Claude Design handoff exactly.
// Used whenever Sanity isn't configured (PUBLIC_SANITY_PROJECT_ID=placeholder)
// or a query fails, so the whole site renders offline with zero credentials.
// Once you connect Sanity + seed it, live data takes over automatically.
// ---------------------------------------------------------------------------
import type {
  SiteSettings,
  HomeContent,
  Project,
  Post,
  AboutContent,
  ResumeContent,
  Service,
  ShopifyService,
} from '../lib/types';

export const site: SiteSettings = {
  name: 'Riajul Islam',
  role: 'AI-Powered Full-Stack Developer',
  email: 'hello@riajulislam.dev',
  phone: '+880 1XXX-XXXXXX',
  location: 'Dhaka, Bangladesh',
  timeZone: 'Asia/Dhaka',
  gmtLabel: 'GMT+6',
  openToWork: true,
  footerWordmark: 'Riajul',
  whatsappPhone: '8801XXXXXXXXX',
  whatsappMessage: 'Hi Riajul — I found you through your portfolio.',
  website: 'riajulislam.dev',
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
  badge: 'AI-powered full-stack developer',
  headlineLines: ['Production software,', 'shipped at'],
  accentWord: 'AI speed.',
  lede:
    "I'm a full-stack developer with an AI-accelerated workflow: AI writes the boilerplate, I own the architecture, the review and the quality bar. The result is MVPs in weeks instead of quarters — Next.js, Node and Shopify, built properly and shipped fast.",
  primaryCta: 'Start a project',
  secondaryCta: 'See what I build',
  availabilityNote: 'Available for new projects · working remotely, worldwide',
  rotatingWords: ['Next.js', 'Claude Code', 'TypeScript', 'Shopify', 'Node.js', 'Cursor'],
  stats: [
    { value: 3, suffix: ' wk', label: 'Typical MVP build' },
    { value: 15, suffix: '+', label: 'Products shipped' },
    { value: 24, suffix: 'h', label: 'Avg. response time' },
  ],
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

export const posts: Post[] = [
  { title: 'How I actually build with AI — and where I still do the work', slug: 'building-with-ai-workflow', order: 1, category: 'ai', categoryLabel: 'AI', readTime: '8 min read', date: 'July 2026', excerpt: "The honest version of an AI-accelerated workflow: what gets generated, what gets thrown away, and the review discipline that keeps 'fast' from meaning 'fragile'.", coverLabel: 'AI workflow — cover', featured: true, image: null },
  { title: 'Shipping an MVP in 19 days without shipping garbage', slug: 'mvp-in-19-days', order: 2, category: 'ai', categoryLabel: 'AI', readTime: '6 min', date: 'July 2026', excerpt: 'Scope triage, generated scaffolding, and the four things I refuse to cut no matter how tight the deadline gets.', coverLabel: 'MVP in 19 days — cover', featured: false, image: null },
  { title: 'RAG that actually answers: chunking, reranking and citations', slug: 'rag-that-answers', order: 3, category: 'ai', categoryLabel: 'AI', readTime: '9 min', date: 'June 2026', excerpt: 'Most bad AI answers are bad retrieval, not bad models. The pipeline changes that moved accuracy the most.', coverLabel: 'RAG pipeline — cover', featured: false, image: null },
  { title: 'Going headless: when Shopify Hydrogen is actually worth it', slug: 'shopify-hydrogen-worth-it', order: 4, category: 'ecommerce', categoryLabel: 'E-commerce', readTime: '7 min read', date: 'June 2026', excerpt: "Headless is powerful, but it isn't free. Here's the honest decision framework I use to tell clients when to leave Liquid behind — and when to stay put.", coverLabel: 'Hydrogen vs Liquid — cover', featured: false, image: null },
  { title: 'Shipping a React Native app that works offline-first', slug: 'react-native-offline-first', order: 5, category: 'mobile', categoryLabel: 'Mobile', readTime: '6 min', date: 'May 2026', excerpt: 'A local store, a sync queue, and the patterns that keep logging instant when the signal drops.', coverLabel: 'Offline-first RN — cover', featured: false, image: null },
  { title: 'Type-safe from MongoDB to the UI in a MERN app', slug: 'type-safe-mern', order: 6, category: 'fullstack', categoryLabel: 'Full-Stack', readTime: '8 min', date: 'April 2026', excerpt: 'Sharing TypeScript types across the stack so the compiler catches mismatches before users do.', coverLabel: 'Type-safe MERN — cover', featured: false, image: null },
  { title: 'Core Web Vitals: a practical checklist for Next.js', slug: 'core-web-vitals-nextjs', order: 7, category: 'performance', categoryLabel: 'Performance', readTime: '5 min', date: 'March 2026', excerpt: 'The handful of changes that move LCP, CLS and INP the most — without a full rewrite.', coverLabel: 'Core Web Vitals — cover', featured: false, image: null },
  { title: 'What two years of freelancing taught me about scoping', slug: 'freelance-scoping', order: 8, category: 'career', categoryLabel: 'Career', readTime: '4 min', date: 'February 2026', excerpt: "Most project pain starts at the proposal. Here's how I scope to avoid it.", coverLabel: 'Freelance scoping — cover', featured: false, image: null },
  { title: "Building a design system you'll actually reuse", slug: 'reusable-design-system', order: 9, category: 'frontend', categoryLabel: 'Frontend', readTime: '6 min', date: 'January 2026', excerpt: 'Tokens, components and docs that survive past the first sprint and three engineers.', coverLabel: 'Design system — cover', featured: false, image: null },
  { title: 'Role-based auth in a Next.js + Express app, end to end', slug: 'role-based-auth-nextjs-express', order: 10, category: 'backend', categoryLabel: 'Backend', readTime: '7 min', date: 'December 2025', excerpt: 'Sessions, middleware and protecting routes on both the server and the client.', coverLabel: 'Auth in Next.js — cover', featured: false, image: null },
];

export const about: AboutContent = {
  heading: "Hey, I'm\nRiajul.",
  leadParagraph:
    "I'm an AI-powered full-stack developer based in Dhaka, building web and mobile products for founders and teams worldwide. AI does the typing; I do the thinking — which means clients get production software in weeks without giving up the parts that make it maintainable.",
  secondParagraph:
    "With 1–2 years building production apps on Next.js, the MERN stack, React Native and Shopify — and an AI-accelerated workflow layered on top — I'm now open to a full-time role and a few freelance projects. I like owning features end to end and shipping things that actually go live.",
  tags: ['Clean, typed code', 'AI-assisted, human-reviewed', 'Lo-fi while coding', 'Open source', 'Reading'],
  gallery: ['Me', 'My setup', 'On a project', 'Coffee & code', 'Gaming', 'Books I read', 'Outdoors'],
  outsideTitle: 'The stuff that makes the work better.',
  outsideBody:
    "Long reading sessions, football, gaming with friends, and tinkering with side projects nobody asked for. They're not breaks from building — they're where the curiosity comes from. Most of what I bring to a codebase is just being interested in how things work and refusing to leave them half-done.",
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
