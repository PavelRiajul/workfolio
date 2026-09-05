import { sharedObjects } from './objects';
import siteSettings from './siteSettings';
import homePage from './homePage';
import aboutPage from './aboutPage';
import resume from './resume';
import servicesPage from './servicesPage';
import stackPage from './stackPage';
import shopifyPage from './shopifyPage';
import { workPage, blogPage, startPage, caseStudyPage } from './simplePages';
import service from './service';
import shopifyService from './shopifyService';
import shopifyCategory from './shopifyCategory';
import shopifyProject from './shopifyProject';
import project from './project';
import post from './post';

export const schemaTypes = [
  // reusable objects (headings, links, stats…)
  ...sharedObjects,
  // singletons
  siteSettings,
  homePage,
  servicesPage,
  stackPage,
  shopifyPage,
  workPage,
  blogPage,
  aboutPage,
  startPage,
  resume,
  caseStudyPage,
  // collections
  service,
  shopifyService,
  shopifyCategory,
  shopifyProject,
  project,
  post,
];
