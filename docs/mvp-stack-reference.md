# MVP Stack Reference

**Ebrahim Khan — Studio Tech Stack & Delivery Playbook**
Version 1.0

> **Internal document — not published.** `docs/` is not a route; nothing here is
> built into the site. Sections 6 (pricing, payment terms, scope boundaries),
> 7 (market strategy) and 3.2/3.3 (business gaps) are commercially sensitive and
> should stay that way. See the note at the bottom before publishing any of it.

---

## 1. Complete Tool Inventory

Everything currently in the stack, grouped by function.

### Frontend / UI
| Tool | Role |
|---|---|
| Astro | Static / content sites |
| Next.js | Apps with auth, state, server logic |
| Tailwind CSS | Styling (standardize on v4) |
| GSAP | Animation |
| 21st.dev | Component snippets |
| ReactBits | Component snippets |

### Mobile
| Tool | Role |
|---|---|
| React Native (Expo) | Cross-platform mobile |

### Hosting
| Tool | Role |
|---|---|
| Cloudflare Pages / Workers | Static Astro sites |
| Vercel | Next.js apps |
| Render | Long-running services, workers, cron, self-hosted tools |

### Database / ORM
| Tool | Role |
|---|---|
| Supabase | Postgres + Auth + Storage + Realtime (default) |
| Neon DB | Postgres with branching (B2B lane) |
| Prisma | ORM |

### Auth
| Tool | Role |
|---|---|
| Clerk | Orgs, teams, roles, SSO |
| Supabase Auth | Simple auth (default) |

### Storage / Media
| Tool | Role |
|---|---|
| Cloudflare R2 | Object storage, zero egress |
| UploadThing | Upload DX wrapper |

### CMS
| Tool | Role |
|---|---|
| Sanity | Structured content |

### Payments
| Tool | Role |
|---|---|
| Stripe | Primary (where available) |

### Email
| Tool | Role |
|---|---|
| Resend | Transactional email |

### AI
| Tool | Role |
|---|---|
| Groq | Fast inference for open models |

### Booking
| Tool | Role |
|---|---|
| Cal.com | Scheduling engine |

### Automation
| Tool | Role |
|---|---|
| n8n | Client-facing workflow automation |
| Telegram Bot | Alerts and notifications |
| OpenClaw | Personal assistant (internal only, never client infra) |

### Monitoring
| Tool | Role |
|---|---|
| Sentry | Error tracking |

### Analytics
| Tool | Role |
|---|---|
| PostHog | Product analytics, replay, funnels (primary) |
| Microsoft Clarity | Heatmaps (redundant with PostHog) |
| Google Analytics 4 | Client-requested reporting |
| Meta Analytics | Only when running Meta ads |

**Total: 26 tools.**

---

## 2. Overlaps to Resolve

Three places where you own multiple tools doing the same job. Decide once, apply to every project.

### 2.1 Astro vs Next.js
Keep both, but with a written rule:
- **Astro** — no auth, no user state, content-driven. Marketing sites, landing pages, blogs, portfolios.
- **Next.js** — anything with login, dashboards, payments, or real-time data.

If a project is ambiguous, use Next. Migrating Astro → Next mid-project is expensive.

### 2.2 Supabase vs Neon + Clerk + R2
Two lanes. Never mix them within one project.

| | Supabase lane | Best-of-breed lane |
|---|---|---|
| Database | Supabase Postgres | Neon |
| Auth | Supabase Auth | Clerk |
| Storage | Supabase Storage | Cloudflare R2 |
| Vendors | 1 | 3 |
| Best for | 80% of projects | B2B multi-tenant, orgs/teams/SSO |

**Default to Supabase.** Break out only when the project genuinely needs organizations, role hierarchies, team invites, or SSO — that's what Clerk buys you and it's painful to build otherwise.

### 2.3 Analytics — four tools, one job
- **PostHog** — the real tool. Analytics, session replay, heatmaps, funnels, feature flags.
- **GA4** — install only because clients ask for it.
- **Meta** — only when the client actively runs Meta ads. Prefer Conversions API over pixel alone.
- **Clarity** — drop. PostHog covers it.

Every extra tag is more JS, another consent entry, and another privacy liability. **Never load GA4/Meta/Clarity on authenticated routes handling health or financial data.**

### 2.4 Minor overlaps
- **UploadThing vs R2** — UploadThing is a middleman. Fine for speed; go direct to R2 with presigned URLs once volume grows.
- **Sentry vs PostHog error tracking** — PostHog has it now, Sentry is better at it. Pick one per project.

---

## 3. Missing Pieces

Not optional for client work. Add these before the next project.

### 3.1 Technical gaps
| Need | Tool | Why |
|---|---|---|
| Form spam protection | Cloudflare Turnstile | Every contact form gets hit |
| Consent banner | Cookiebot / Usercentrics | Legally required in EU/UK with your analytics load |
| Uptime monitoring | Better Stack / UptimeRobot | Sentry catches app errors, not downtime |
| Rate limiting | Upstash Redis / Cloudflare | Critical on any AI endpoint |
| Secrets management | Doppler / Infisical | `.env` sprawl fails across many clients |
| CI/CD | GitHub Actions | Type-check, lint, test on push |
| Backups | Automated dumps to R2 | Test restores, don't assume |
| i18n | next-intl / Paraglide | Required for Arabic and Bangla work |
| Validation | Zod | Especially for LLM tool-call arguments |
| Testing | Vitest + Playwright | At minimum: booking flow and payment flow |
| AI cost logging | Helicone / LangSmith / Postgres | Can't price AI features without per-user token data |

### 3.2 Business gaps
| Need | Tool |
|---|---|
| Contracts + e-sign | Documenso / Dropbox Sign |
| Invoicing | Wave / Zoho / Stripe Invoicing |
| Receiving payment (BD) | Wise / Payoneer business |
| Project management | Linear / Notion |
| Time tracking | Toggl (even on fixed-price, to learn real cost) |

### 3.3 Structural investments
- **Own component library** — extract 21st.dev / ReactBits snippets into your own package. Stop re-copying per project.
- **CLI starter** — `create-studio-app` scaffolding each template fully wired.
- **Staging convention** — every client gets staging + prod, always.

---

## 4. Project Templates

Locked stacks. Pick a template, not individual tools.

### Template 1 — Landing / Marketing
> Astro · Tailwind · GSAP · Sanity · Resend · Cloudflare Pages · Turnstile · PostHog (+GA4 on request)

No database, no auth. Ships in days. Near-zero hosting cost. **Should be the majority of your volume.**

### Template 2 — Standard Web App
> Next.js · Tailwind · Supabase (DB/Auth/Storage) · Prisma · Stripe · Resend · Vercel · Sentry · PostHog · Turnstile

Default when a client says "portal," "dashboard," or "booking system."

### Template 3 — B2B / Multi-Tenant
> Next.js · Tailwind · Neon · Prisma · Clerk · R2 · Stripe · Resend · Vercel · Sentry · PostHog

Only when orgs, roles, team invites, or SSO are genuinely required. Neon's PR branching is the bonus.

### Template 4 — AI Feature App
> Template 2 or 3, plus:
> - LLM behind an SDK abstraction (never call one provider directly)
> - Tool/function calling with server-side validation
> - Job queue for slow operations
> - Streaming UI
> - Per-user token/cost logging
> - Rate limiting

Treat AI as a module bolted onto Template 2/3, not a separate stack.

### Mobile Extension
> Expo · NativeWind · same backend · separate UI

Priced separately. **Never promise "one codebase, web and mobile"** — you share types, API layer, and business logic, not UI.

### Cross-cutting — in every template
GitHub Actions · staging + prod · Sentry · PostHog · Turnstile · uptime monitor · Telegram alerts · DNS/SPF/DKIM/DMARC in onboarding · automated backups

---

## 5. Reference Build — AI Chat Booking (Clinic)

The flagship offer. Works in Bangladesh, the Gulf, and Australia with minor swaps.

### Architecture
```
Patient (WhatsApp / Web)
        │
        ▼
  Next.js app  ──►  LLM (tool calling)
        │              │
        │              ├─ check_availability ──┐
        │              ├─ create_booking ──────┤──► Cal.com API
        │              └─ cancel_booking ──────┘
        │
        ├─► Supabase (patients, transcripts, RLS)
        ├─► Resend (email confirmation)
        ├─► WhatsApp API (reminders)
        ├─► n8n (post-booking workflows)
        └─► Telegram (alert the doctor)
```

### Non-negotiable rules
1. **The model never writes to the database.** It calls your functions; your functions validate and write.
2. **Cal.com owns scheduling correctness.** Availability, buffers, timezones, no-double-booking. You own the conversation only.
3. **Safety rail** — hard system-prompt boundary: no diagnosis, no symptom interpretation, no medication advice. Plus a keyword/classifier tripwire for emergency language that immediately surfaces local emergency numbers and halts the booking flow. **Get the doctor to sign off on that copy in writing.**
4. **Human fallback** — a visible "talk to the clinic" path at all times.
5. **No health data to GA4/Meta/Clarity.** Ever.
6. **Encrypted transcripts, defined retention period, admin view** for the doctor to review/edit/cancel.

### Model choice
Groq is the wrong pick for health-adjacent conversation — use a provider with strong refusal behavior and a clear data-processing agreement (Claude, GPT). Keep Groq for non-sensitive, latency-critical workloads.

### Per-market swaps
| | Bangladesh | Gulf | Australia |
|---|---|---|---|
| Language | Bangla + English + Banglish | Arabic (RTL) + English | English |
| Channel | WhatsApp | WhatsApp | SMS + email |
| Payment | bKash / SSLCommerz | Tap / Moyasar / HyperPay + Mada | Stripe |
| Region | Singapore | Gulf / nearest | ap-southeast-2 |
| Compliance | Own policy + contract clause | PDPL, ZATCA if invoicing | Privacy Act, Spam Act |
| Emergency | 999 / 16263 (verify) | Local equivalent | 000 |

---

## 6. Delivery & Commercial Rules

### Pricing
- Quote the **outcome**, not hours. "Booking system that fills your chamber," not "40 hours of Next.js."
- **50% upfront. Always. Non-negotiable.**
- Recurring costs (Supabase, model API, WhatsApp, domain, Vercel) billed separately or as a monthly plan. **Never absorb AI token costs into a fixed fee** — that's how you go broke on a successful project.
- Cap revisions at **two rounds**, in writing.
- Milestone-bill the balance. Keep deploy access until final payment.

### Scope boundaries — what you don't do
Write these down and say them early:
- No native-only mobile features
- No marketplaces
- No HIPAA/SOC 2 enterprise work (until you have the infrastructure)
- No public-sector tenders
- No on-site presence

Scope boundaries protect you more than any tool choice.

### Client-facing hygiene
- Vercel spend limits on every project
- Client owns their own vendor accounts where possible
- IP assignment terms ready for North American clients
- DPA template ready for European clients
- Written data-handling policy for markets with no data protection law

---

## 7. Market Priority

**Pursue first: Middle East (UAE) and Oceania (Australia).**

Both have workable timezone overlap from Dhaka — you can hold live calls, which is what makes *retainers* possible rather than one-off builds. Both are English-accessible at entry. Both have dense clusters of exactly the businesses Templates 1–4 serve: clinics, salons, trades, real estate. Rates run 8–15× local Bangladesh pricing.

**Sequence**
1. Build 2–3 real case studies locally in Bangladesh at low prices — clinic booking, restaurant ordering, one AI chat build.
2. Productize: *"AI booking system for clinics — live in 3 weeks, fixed price."*
3. UAE via subcontracting + diaspora referrals. Australia via direct outbound to trades and allied health.
4. Add Europe once GDPR-compliant infrastructure exists (EU-region Supabase/PostHog/Sentry) and a DPA template is ready.
5. North America: opportunistic inbound only, until you can staff a US-overlap shift.
6. East Asia: Singapore only, and only after the above are stable.

**Highest-leverage single investment:** a foreign entity (UAE freezone or UK Ltd) for invoicing and trust. It changes what you can charge more than any technical decision in this document.

---

## 8. Immediate Next Actions

1. Write the Astro-vs-Next routing rule down. One paragraph.
2. Choose Supabase lane as default; document when Template 3 is allowed.
3. Drop Clarity. Make PostHog primary.
4. Add the seven technical gaps from §3.1 to your default project checklist.
5. Build the `create-studio-app` CLI with Templates 1 and 2 wired.
6. Extract your component library from the snippet sources.
7. Get contracts, invoicing, and a payment-receiving account set up before the first foreign client.
8. Ship the clinic build locally. That's the case study everything else sells from.

---

*Rates, regulations, and vendor terms change. Re-verify anything legal or commercial before signing. Treat this as a working document, not a fixed spec.*

---

## Publishing notes (added when this was filed)

**Safe to surface publicly, if attribution is settled:**
- §1 tool inventory → a "Stack" section (credibility, SEO for tool names)
- §4 project templates → packages on `/services` (Landing / Web App / B2B / AI)
- §5 reference build → an AI-booking service page or case study, minus the internal rules

**Keep private:** §2 (which tools are redundant), §3 (what the studio is missing),
§6 (pricing, deposit terms, revision caps, what you refuse), §7 (market strategy
and rate multiples). Clients reading §6 learn your floor; competitors reading §7
learn your plan.

**Unresolved:** this playbook is bylined *Ebrahim Khan — Studio*, but the site is
Riajul Islam's. Nothing from it should be published as Riajul's own offering
until that's cleared up.
