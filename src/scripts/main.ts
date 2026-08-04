// Global client interactions, GSAP-driven. Imported once from the base layout.
// Each feature is guarded by element presence, so it's safe on every route.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;

function ready(fn: () => void) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

/* ---- Smooth scroll (Lenis ⇄ ScrollTrigger) ----------------------------- */
function initSmoothScroll() {
  if (prefersReduced) return;
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expoOut
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  });

  // Drive Lenis off GSAP's ticker so scroll + animations share one clock.
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // In-page anchors glide instead of jumping.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute('href') || '';
    if (id.length < 2) return;
    a.addEventListener('click', (e) => {
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis?.scrollTo(target as HTMLElement, { offset: -24 });
    });
  });
}

function scrollToTop() {
  if (lenis) lenis.scrollTo(0);
  else
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
}

/* ---- Scroll reveal ----------------------------------------------------- */
function initReveal() {
  const els = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  if (!els.length) return;
  if (prefersReduced) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  // Consistent start state (independent of CSS timing) → no flash.
  gsap.set(els, { opacity: 0, y: 26 });

  // Batch so items entering together animate as one staggered group.
  ScrollTrigger.batch(els, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.08,
        overwrite: true,
        onComplete: () => batch.forEach((el) => (el as HTMLElement).classList.add('in')),
      }),
  });

  // Failsafe: never leave content hidden if a trigger misfires.
  window.setTimeout(() => {
    els.forEach((el) => {
      if (!el.classList.contains('in')) {
        gsap.set(el, { opacity: 1, y: 0 });
        el.classList.add('in');
      }
    });
  }, 2600);

  ScrollTrigger.refresh();
}

/* ---- Count-up stats ----------------------------------------------------
   Supports data-suffix, data-prefix (+ / − / $), data-decimals, and
   data-sep="true" for thousands separators. */
function initCountUp() {
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  els.forEach((el) => {
    const target = parseFloat(el.dataset.count || '0') || 0;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10) || 0;
    const sep = el.dataset.sep === 'true';
    const fmt = (v: number) => {
      const s = sep
        ? v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : v.toFixed(decimals);
      return prefix + s + suffix;
    };
    if (prefersReduced) {
      el.textContent = fmt(target);
      return;
    }
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: target,
          duration: 1.2,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = fmt(obj.v);
          },
          onComplete: () => {
            el.textContent = fmt(target);
          },
        }),
    });
  });
}

/* ---- Hero entrance ----------------------------------------------------- */
function initHeroIntro() {
  const hero = document.querySelector('[data-hero-intro]');
  if (!hero) return;
  const targets = hero.querySelectorAll<HTMLElement>('[data-hero-item]');
  if (prefersReduced) {
    gsap.set(targets, { opacity: 1, y: 0 });
    return;
  }
  gsap.fromTo(
    targets,
    { y: 24, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.09, delay: 0.08 }
  );
}

/* ---- Rotating hero word ------------------------------------------------ */
function initRotatingWord() {
  const rot = document.getElementById('hero-rot');
  if (!rot) return;
  let words: string[] = [];
  try {
    words = JSON.parse(rot.dataset.words || '[]');
  } catch {
    words = [];
  }
  if (words.length < 2) return;
  let i = 0;
  window.setInterval(() => {
    i = (i + 1) % words.length;
    if (prefersReduced) {
      rot.textContent = words[i];
      return;
    }
    gsap.to(rot, {
      duration: 0.18,
      y: -6,
      opacity: 0,
      ease: 'power1.in',
      onComplete: () => {
        rot.textContent = words[i];
        gsap.fromTo(rot, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18 });
      },
    });
  }, 1700);
}

/* ---- Mobile nav -------------------------------------------------------- */
/* ---- Tab bar: tuck away while reading, come back on the way up --------
   The bar is fixed, so without this it sits on top of body copy for the
   whole page. Hides on scroll-down, returns on scroll-up, and is always
   present near the top and at the very bottom. */
function initTabBar() {
  const bar = document.getElementById('nav');
  if (!bar) return;
  // The wordmark and back-link are fixed to the top corners, so they collide
  // with headings exactly like the bar collides with body copy. Same rule.
  const chrome = [bar, ...document.querySelectorAll<HTMLElement>('.brand-sig, .back-home')];
  // The floating WhatsApp button covers the bottom-right corner. On a phone
  // that lands on real content (it was sitting on a hero stat), and at the
  // top of the page it's redundant anyway — the hero's own CTA is right
  // there. So it waits until the reader is past the hero.
  const fab = document.querySelector<HTMLElement>('.wa-fab');
  const HERO_ZONE = 560;
  const tuck = (on: boolean, y = 0) => {
    chrome.forEach((el) => el.classList.toggle('tucked', on));
    fab?.classList.toggle('tucked', on || y < HERO_ZONE);
  };

  const JITTER = 6;    // ignore sub-pixel wobble and momentum noise
  const TOP_ZONE = 140; // always visible near the top of the page
  const END_ZONE = 260; // ...and once the footer comes into view
  let last = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = Math.max(0, window.scrollY);
    const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - END_ZONE;
    // Zone checks come first: near the ends the deltas go sub-jitter as the
    // scroll settles, and bailing early there would strand the bar hidden.
    if (y < TOP_ZONE || atEnd) {
      tuck(false, y);
      last = y;
      return;
    }
    const dy = y - last;
    if (Math.abs(dy) < JITTER) return;
    tuck(dy > 0, y);
    last = y;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update(); // set the initial state (FAB hidden while the hero is on screen)
}

/* ---- Footer clock ------------------------------------------------------ */
function initClock() {
  const el = document.getElementById('ft-clock');
  if (!el) return;
  const tz = el.dataset.tz || 'Asia/Dhaka';
  const fmt = () => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date());
    } catch {
      return '';
    }
  };
  el.textContent = fmt();
  window.setInterval(() => {
    el.textContent = fmt();
  }, 1000);
}

/* ---- Back to top ------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('b2t');
  if (!btn) return;
  const onScroll = () => {
    const y = window.pageYOffset || document.documentElement.scrollTop || 0;
    btn.classList.toggle('show', y > 420);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  if (lenis) lenis.on('scroll', onScroll);
  btn.addEventListener('click', scrollToTop);
  onScroll();
}

/* ---- Hero 3D cards: tilt toward the pointer ---------------------------- */
function initHeroTilt() {
  if (prefersReduced) return;
  const stage = document.getElementById('hv-stage');
  const scope = document.querySelector<HTMLElement>('.hero');
  if (!stage || !scope) return;
  const baseRx = 13;
  const baseRy = -23;
  let raf = 0;
  let nextRx = baseRx;
  let nextRy = baseRy;
  const apply = () => {
    raf = 0;
    stage.style.setProperty('--rx', nextRx.toFixed(2) + 'deg');
    stage.style.setProperty('--ry', nextRy.toFixed(2) + 'deg');
  };
  scope.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    if (stage.dataset.locked === '1') return; // the mascot is tilting the stack

    const r = scope.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
    const y = (e.clientY - r.top) / r.height - 0.5;
    nextRx = baseRx - y * 10;
    nextRy = baseRy + x * 16;
    if (!raf) raf = requestAnimationFrame(apply);
  });
  scope.addEventListener('pointerleave', () => {
    nextRx = baseRx;
    nextRy = baseRy;
    if (!raf) raf = requestAnimationFrame(apply);
  });
}

/* ---- Shopify service stack: settle cards back as the next pins --------- */
function initShopifyStack() {
  if (prefersReduced) return;
  const cards = gsap.utils.toArray<HTMLElement>('.sstack-card');
  if (cards.length < 2) return;
  cards.forEach((card, i) => {
    if (i === cards.length - 1) return; // top-most card never gets covered
    gsap.fromTo(
      card,
      { scale: 1, filter: 'brightness(1)' },
      {
        scale: 0.93,
        filter: 'brightness(0.84)',
        ease: 'none',
        scrollTrigger: {
          trigger: cards[i + 1],
          start: 'top 78%',
          end: 'top 14%',
          scrub: true,
        },
      }
    );
  });
}

/* ---- Long feature lists: collapsed on phones --------------------------
   Five consecutive eight-item lists is a wall on a 375px screen. They ship
   open so the content is there without JS (and on desktop, where the summary
   is hidden); this closes them only where the space is tight. */
function initFeatureLists() {
  const lists = document.querySelectorAll<HTMLDetailsElement>('details.feats');
  if (!lists.length) return;
  const narrow = window.matchMedia('(max-width: 640px)');
  const apply = () => lists.forEach((d) => { d.open = !narrow.matches; });
  apply();
  narrow.addEventListener('change', apply);
}

/* ---- Contents list: collapsed on phones -------------------------------- */
/* Same reasoning as the feature lists, and the same no-JS behaviour: the
   markup ships `open` so every entry is in the DOM for a crawler and for
   anyone without JS. A post with 14 headings and 15 sub-headings makes for a
   list well over a screen tall, and a reader on a phone should reach the first
   paragraph without scrolling past all of it. */
function initToc() {
  const toc = document.querySelector<HTMLDetailsElement>('details.toc-shell');
  if (!toc) return;
  const narrow = window.matchMedia('(max-width: 640px)');
  const apply = () => { toc.open = !narrow.matches; };
  apply();
  narrow.addEventListener('change', apply);
}

/* ---- Metric bars: grow from zero when their group scrolls in ----------- */
function initBarGrow() {
  if (prefersReduced) return;
  const groups = gsap.utils.toArray<HTMLElement>('[data-bars]');
  if (!groups.length) return;
  groups.forEach((group) => {
    const bars = gsap.utils.toArray<HTMLElement>('.bargrow', group);
    if (!bars.length) return;
    gsap.set(bars, { scaleX: 0 });
    ScrollTrigger.create({
      trigger: group,
      start: 'top 82%',
      once: true,
      onEnter: () =>
        gsap.to(bars, { scaleX: 1, duration: 0.95, ease: 'power3.out', stagger: 0.07 }),
    });
  });
}

/* ---- Tab bar scroll-spy (in-page anchors like #services) --------------- */
function initTabSpy() {
  const bar = document.getElementById('nav');
  if (!bar) return;
  const tabs = Array.from(bar.querySelectorAll<HTMLElement>('.tab'));
  if (!tabs.length) return;

  // Pair each tab whose href targets a section on THIS page with that section.
  const spies: { tab: HTMLElement; section: HTMLElement }[] = [];
  tabs.forEach((tab) => {
    const href = tab.getAttribute('href') || '';
    if (!href.includes('#')) return;
    const section = document.querySelector<HTMLElement>('#' + href.split('#')[1]);
    if (section) spies.push({ tab, section });
  });
  if (!spies.length) return; // e.g. sub-pages keep their server-set active tab

  // Fallback tab when no spied section is centred (the home/top tab).
  const homeTab = tabs.find((t) => (t.getAttribute('href') || '') === '/') || tabs[0];

  const onScroll = () => {
    const mid = window.innerHeight * 0.45;
    let current: HTMLElement | null = null;
    for (const { tab, section } of spies) {
      const r = section.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        current = tab;
        break;
      }
    }
    const target = current || homeTab;
    tabs.forEach((t) => {
      const on = t === target;
      t.classList.toggle('active', on);
      if (on) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  if (lenis) lenis.on('scroll', onScroll);
  onScroll();
}

/* ---- Article contents: mark the section you're reading ----------------- */
// The contents list is sticky beside the article for the whole read, so without
// this it shows where you could go and never where you are. On a post with 26
// entries that is most of its value missing.
//
// Deliberately not IntersectionObserver: headings fire on entry and exit, and
// with several visible at once "which one am I reading" is a question about the
// scroll position rather than about visibility. Reading positions off a rect on
// scroll answers it directly, and the loop is a handful of reads.
function initTocSpy() {
  const toc = document.querySelector<HTMLElement>('.toc');
  if (!toc) return;

  const links = Array.from(toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  const pairs = links
    .map((link) => ({ link, heading: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
    .filter((p): p is { link: HTMLAnchorElement; heading: HTMLElement } => Boolean(p.heading));
  if (!pairs.length) return;

  const list = toc.querySelector<HTMLElement>('ol');
  let active: HTMLAnchorElement | null = null;

  const onScroll = () => {
    // The last heading that has passed the reading line is the one you are in.
    const line = window.innerHeight * 0.25;
    let current = pairs[0];
    for (const p of pairs) {
      if (p.heading.getBoundingClientRect().top <= line) current = p;
      else break;
    }
    // Above the first heading nothing is active — the intro is not a section.
    const atTop = pairs[0].heading.getBoundingClientRect().top > line;
    const target = atTop ? null : current.link;
    if (target === active) return;

    active = target;
    pairs.forEach(({ link }) => {
      const on = link === target;
      link.classList.toggle('is-current', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });

    // Sub-sections are collapsed by default, so open the group the reader is
    // in — whether the active entry is the section itself or one of its
    // sub-sections. Without this the h3s would never be reachable by pointer.
    const openGroup = target?.closest('.toc-group') ?? null;
    toc.querySelectorAll('.toc-group').forEach((g) => {
      g.classList.toggle('is-open', g === openGroup);
    });

    // The rail's list scrolls internally, so the active entry can sit outside
    // it. Scroll the list, never the page — scrollIntoView would drag the
    // document along with it and fight the reader.
    if (target && list && list.scrollHeight > list.clientHeight) {
      const l = list.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      if (t.top < l.top || t.bottom > l.bottom) {
        list.scrollTo({
          top: list.scrollTop + (t.top - l.top) - list.clientHeight / 2 + t.height / 2,
          behavior: prefersReduced ? 'auto' : 'smooth',
        });
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  if (lenis) lenis.on('scroll', onScroll);
  onScroll();
}

/* ---- WhatsApp FAB: hide when footer is in view ------------------------- */
function initWhatsAppFab() {
  const fab = document.querySelector<HTMLElement>('.wa-fab');
  const footer = document.querySelector<HTMLElement>('.footer');
  if (!fab || !footer || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => fab.classList.toggle('wa-tuck', entry.isIntersecting));
    },
    { rootMargin: '0px 0px -40px 0px' }
  );
  io.observe(footer);
}

ready(() => {
  document.documentElement.classList.remove('no-js');
  initSmoothScroll();
  initTabBar();
  initWhatsAppFab();
  initHeroTilt();
  initShopifyStack();
  initFeatureLists();
  initToc();
  initBarGrow();
  initTabSpy();
  initTocSpy();
  initReveal();
  initHeroIntro();
  initCountUp();
  initRotatingWord();
  initClock();
  initBackToTop();
});
