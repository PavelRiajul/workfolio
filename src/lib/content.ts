// Content access layer. Each loader queries Sanity (when configured) and
// falls back to the seeded design content otherwise. Pages import only from here.
import { safeFetch } from './sanity';
import * as fallback from '../data/content';
import type {
  SiteSettings, HomeContent, Project, Post, AboutContent, ResumeContent, Service, ShopifyService,
  ServicesPageContent, StackPageContent, ShopifyPageContent, WorkPageContent, BlogPageContent, StartPageContent,
  CaseStudyContent,
} from './types';

const imageProjection = `image{ alt, asset->{ _id, url } }`;

export function getSite(): Promise<SiteSettings> {
  return safeFetch<SiteSettings>(
    `*[_type == "siteSettings"][0]{
      name, role, seo, nav, footerLinks, copyrightYear, openToWorkLabel,
      skipLinkLabel, backHomeLabel, closingCta,
      email, phone, location, timeZone, gmtLabel, openToWork,
      footerWordmark, whatsappPhone, whatsappMessage, website, socials, techStack
    }`,
    {},
    fallback.site
  );
}

export function getHome(): Promise<HomeContent> {
  return safeFetch<HomeContent>(
    `*[_type == "homePage"][0]{
      seo, badge, availabilityChip, headlineLines, accentWord, lede, ledeShort,
      primaryCta, secondaryCta, availabilityNote, buildingWithLabel, rotatingWords, stats,
      stackCta, servicesStackHeading, servicesStackCta, aiBand,
      testimonialsHeading, workHeading, workCta, workNote, workNoteLink,
      processHeading, faqHeading,
      approachEyebrow, approachTitle, approachLede, principles,
      services, aiWorkflow, aiCaveat, process, testimonials, faqs, closingTitle
    }`,
    {},
    fallback.home
  );
}

export function getServices(): Promise<Service[]> {
  return safeFetch<Service[]>(
    `*[_type == "service"] | order(number asc){
      number, "slug": slug.current, title, kicker, tagline, description,
      features, icon, timeline, visual, href, tone
    }`,
    {},
    fallback.services
  );
}

export function getShopifyServices(): Promise<ShopifyService[]> {
  return safeFetch<ShopifyService[]>(
    `*[_type == "shopifyService"] | order(number asc){
      number, title, tagline, description, features, tone
    }`,
    {},
    fallback.shopifyServices
  );
}

export function getProjects(): Promise<Project[]> {
  return safeFetch<Project[]>(
    `*[_type == "project"] | order(order asc){
      title, "slug": slug.current, order, tags, stack, type, blurb, ${imageProjection},
      hasCaseStudy, modalSummary, modalOutcomes,
      // The Shopify page renders a featured card from this list, so it needs
      // the summary/pills/outcomes too — not just the grid-card fields.
      pills, summary, outcomes
    }`,
    {},
    fallback.projects
  );
}

export function getProject(slug: string): Promise<Project | undefined> {
  return safeFetch<Project | undefined>(
    `*[_type == "project" && slug.current == $slug][0]{
      title, "slug": slug.current, order, tags, stack, type, blurb, ${imageProjection},
      hasCaseStudy, modalSummary, modalOutcomes,
      year, pills, summary, meta, challenge, approach, insights,
      processSteps, screens, mobileScreens, outcomes, outcomesNote
    }`,
    { slug },
    fallback.projects.find((p) => p.slug === slug)
  );
}

export function getPosts(): Promise<Post[]> {
  return safeFetch<Post[]>(
    `*[_type == "post"] | order(order asc){
      title, "slug": slug.current, order, category, categoryLabel,
      readTime, date, publishedAt, excerpt, coverLabel, featured, body, seo, ${imageProjection}
    }`,
    {},
    fallback.posts
  );
}

export function getAbout(): Promise<AboutContent> {
  return safeFetch<AboutContent>(
    `*[_type == "aboutPage"][0]{
      seo, eyebrow, heading, leadParagraph, secondParagraph, tags, gallery,
      outsideEyebrow, outsideTitle, outsideBody, traitsHeading, traits,
      buildHeading, buildLink, stackLink, closingTitle
    }`,
    {},
    fallback.about
  );
}

export function getResume(): Promise<ResumeContent> {
  return safeFetch<ResumeContent>(
    `*[_type == "resume"][0]{
      highlights, summary, skills, experience, projects, education, languages
    }`,
    {},
    fallback.resume
  );
}

/* ---- Page singletons -----------------------------------------------------
   One document per landing page, so every heading, list and label on the
   site is editable. Each falls back to the seeded copy in src/data. */

export function getServicesPage(): Promise<ServicesPageContent> {
  return safeFetch<ServicesPageContent>(
    `*[_type == "servicesPage"][0]{
      seo, hero, velocity, methodHeading, listHeading, listCta,
      serviceCta, serviceDeepLinkCta, stackLink, engagementsHeading, engagements,
      processHeading, faqHeading, faqs, closing
    }`,
    {},
    fallback.servicesPage
  );
}

export function getShopifyPage(): Promise<ShopifyPageContent> {
  return safeFetch<ShopifyPageContent>(
    `*[_type == "shopifyPage"][0]{
      seo, hero, brandsHeading, brands, servicesHeading, servicesCta,
      serviceTagLabel, serviceCta, approachHeading, approach,
      numbersHeading, numbers, numbersNote, cro, croDashboard,
      leakHeading, funnel, fixes, croProcessHeading, croProcess, croProcessLoopNote,
      calcHeading, calcCta, calcLabels, calcNote,
      experimentsHeading, experimentsColumns, experiments,
      featuredHeading, featuredCta, testimonialsHeading, testimonials,
      faqHeading, faqs, closing
    }`,
    {},
    fallback.shopifyPage
  );
}

export function getWorkPage(): Promise<WorkPageContent> {
  return safeFetch<WorkPageContent>(
    `*[_type == "workPage"][0]{ seo, hero, filters, modalCtaLabel, closing }`,
    {},
    fallback.workPage
  );
}

export function getBlogPage(): Promise<BlogPageContent> {
  return safeFetch<BlogPageContent>(
    `*[_type == "blogPage"][0]{ seo, hero, categories, featuredBadge, emptyMessage, closing }`,
    {},
    fallback.blogPage
  );
}

export function getStartPage(): Promise<StartPageContent> {
  return safeFetch<StartPageContent>(
    `*[_type == "startPage"][0]{
      seo, eyebrow, headlineLines, lede, ledeShort, callTabLabel, formTabLabel, call, form, success
    }`,
    {},
    fallback.startPage
  );
}

export function getCaseStudy(): Promise<CaseStudyContent> {
  return safeFetch<CaseStudyContent>(
    `*[_type == "caseStudyPage"][0]{
      challengeHeading, approachHeading, insightsHeading, processHeading,
      screensHeading, mobileHeading, outcomesHeading, nextHeading
    }`,
    {},
    fallback.caseStudy
  );
}

export function getStackPage(): Promise<StackPageContent> {
  return safeFetch<StackPageContent>(
    `*[_type == "stackPage"][0]{
      seo, hero, templatesHeading, templates, toolsHeading, toolGroups,
      everyBuildHeading, everyBuild, everyBuildNote, closing
    }`,
    {},
    fallback.stackPage
  );
}
