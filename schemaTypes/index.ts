import siteSettings from './siteSettings';
import homePage from './homePage';
import aboutPage from './aboutPage';
import resume from './resume';
import service from './service';
import shopifyService from './shopifyService';
import project from './project';
import post from './post';

export const schemaTypes = [
  // singletons
  siteSettings,
  homePage,
  aboutPage,
  resume,
  // collections
  service,
  shopifyService,
  project,
  post,
];
