// Content access layer. Each loader queries Sanity (when configured) and
// falls back to the seeded design content otherwise. Pages import only from here.
import { safeFetch } from './sanity';
import * as fallback from '../data/content';
import type {
  SiteSettings, HomeContent, Project, Post, AboutContent, ResumeContent,
} from './types';

const imageProjection = `image{ alt, asset->{ _id, url } }`;

export function getSite(): Promise<SiteSettings> {
  return safeFetch<SiteSettings>(
    `*[_type == "siteSettings"][0]{
      name, role, email, phone, location, timeZone, gmtLabel, openToWork,
      footerWordmark, whatsappPhone, whatsappMessage, website, socials, techStack
    }`,
    {},
    fallback.site
  );
}

export function getHome(): Promise<HomeContent> {
  return safeFetch<HomeContent>(
    `*[_type == "homePage"][0]{
      badge, headlineLines, accentWord, lede, primaryCta, secondaryCta,
      availabilityNote, rotatingWords, stats,
      approachEyebrow, approachTitle, approachLede, principles,
      services, process, testimonials, faqs, closingTitle
    }`,
    {},
    fallback.home
  );
}

export function getProjects(): Promise<Project[]> {
  return safeFetch<Project[]>(
    `*[_type == "project"] | order(order asc){
      title, "slug": slug.current, order, tags, stack, type, blurb, ${imageProjection},
      hasCaseStudy, modalSummary, modalOutcomes
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
      readTime, date, excerpt, coverLabel, featured, ${imageProjection}
    }`,
    {},
    fallback.posts
  );
}

export function getAbout(): Promise<AboutContent> {
  return safeFetch<AboutContent>(
    `*[_type == "aboutPage"][0]{
      heading, leadParagraph, secondParagraph, tags, gallery,
      outsideTitle, outsideBody, traits, closingTitle
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
