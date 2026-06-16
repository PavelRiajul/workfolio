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

/* ---- CRO revenue calculator ------------------------------------------- */
function initCroCalc() {
  const root = document.getElementById('calc');
  if (!root) return;
  const ids = ['ci-vis', 'ci-aov', 'ci-cur', 'ci-tgt'] as const;
  const [vis, aov, cur, tgt] = ids.map((id) => document.getElementById(id) as HTMLInputElement | null);
  if (!vis || !aov || !cur || !tgt) return;

  const set = (id: string, txt: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };
  const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
  const paint = (el: HTMLInputElement) => {
    const min = +el.min;
    const max = +el.max;
    const p = ((+el.value - min) / (max - min)) * 100;
    el.style.background = `linear-gradient(to right, #5e8e3e ${p}%, rgba(10,10,10,0.1) ${p}%)`;
  };

  const update = () => {
    const v = +vis.value;
    const a = +aov.value;
    const c = +cur.value;
    const t = +tgt.value;
    const now = v * (c / 100) * a;
    const after = v * (t / 100) * a;
    const extraMo = after - now;
    const extraOrdersYr = v * ((t - c) / 100) * 12;

    set('cv-vis', v.toLocaleString('en-US'));
    set('cv-aov', '$' + a.toLocaleString('en-US'));
    set('cv-cur', c.toFixed(1) + '%');
    set('cv-tgt', t.toFixed(1) + '%');

    set('co-year', money(Math.max(extraMo * 12, 0)));
    const delta = (t - c).toFixed(1);
    set('co-sub', `from a ${t >= c ? '+' : ''}${delta} pt conversion change`);
    set('co-now', money(now) + '/mo');
    set('co-after', money(after) + '/mo');
    set('co-mo', (extraMo >= 0 ? '+' : '−') + money(Math.abs(extraMo)) + '/mo');
    set('co-orders', (extraOrdersYr >= 0 ? '+' : '−') + Math.round(Math.abs(extraOrdersYr)).toLocaleString('en-US'));

    [vis, aov, cur, tgt].forEach(paint);
  };

  [vis, aov, cur, tgt].forEach((el) => el.addEventListener('input', update));
  update();
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

/* ---- Project filter (Home + Work) ------------------------------------- */
function initProjectFilter() {
  const chips = document.querySelectorAll<HTMLElement>('[data-filter]');
  const cards = document.querySelectorAll<HTMLElement>('.work-grid [data-tags]');
  if (!chips.length || !cards.length) return;
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => c.classList.toggle('active', c === chip));
      cards.forEach((card) => {
        const tags = (card.dataset.tags || '').split(',');
        const show = f === 'all' || (f && tags.includes(f));
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

/* ---- Project modal (Home + Work) -------------------------------------- */
interface ModalProject {
  name: string;
  stack: string;
  type: string;
  summary: string;
  outcomes: [string, string][];
  href: string;
}
function initModal() {
  const overlay = document.getElementById('pm-overlay');
  const dataEl = document.getElementById('pm-data');
  if (!overlay || !dataEl) return;
  let data: Record<string, ModalProject> = {};
  try {
    data = JSON.parse(dataEl.textContent || '{}');
  } catch {
    data = {};
  }
  const dialog = document.getElementById('pm-dialog');
  const closeBtn = document.getElementById('pm-close');

  const open = (p: ModalProject) => {
    (document.getElementById('pm-title') as HTMLElement).textContent = p.name;
    (document.getElementById('pm-meta') as HTMLElement).textContent = `${p.stack}  ·  ${p.type}`;
    (document.getElementById('pm-summary') as HTMLElement).textContent = p.summary;
    (document.getElementById('pm-outcomes') as HTMLElement).innerHTML = p.outcomes
      .map((o) => `<div><div class="out-num">${o[0]}</div><div class="out-lbl">${o[1]}</div></div>`)
      .join('');
    if (p.href) document.getElementById('pm-link')?.setAttribute('href', p.href);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll<HTMLElement>('.work-card[data-project]').forEach((card) => {
    card.addEventListener('click', (e) => {
      const id = card.dataset.project || '';
      const p = data[id];
      if (!p) return; // no modal data → follow the link
      e.preventDefault();
      open(p);
    });
  });

  overlay.addEventListener('click', close);
  dialog?.addEventListener('click', (e) => e.stopPropagation());
  closeBtn?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
}

/* ---- Blog category filter --------------------------------------------- */
function initBlogFilter() {
  const chips = document.querySelectorAll<HTMLElement>('[data-blog-filter]');
  const cards = document.querySelectorAll<HTMLElement>('[data-category]');
  const empty = document.getElementById('blog-empty');
  if (!chips.length) return;
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const f = chip.dataset.blogFilter;
      chips.forEach((c) => c.classList.toggle('active', c === chip));
      let shown = 0;
      cards.forEach((card) => {
        const show = f === 'all' || card.dataset.category === f;
        card.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      if (empty) empty.style.display = shown === 0 ? 'block' : 'none';
    });
  });
}

/* ---- Start: tabs + form success --------------------------------------- */
function initStart() {
  const tabs = document.querySelectorAll<HTMLElement>('[data-tab]');
  const panels = document.querySelectorAll<HTMLElement>('[data-panel]');
  if (tabs.length) {
    const setTab = (name: string) => {
      tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
      panels.forEach((p) => p.classList.toggle('active', p.dataset.panel === name));
      try {
        const u = new URL(location.href);
        u.searchParams.set('tab', name);
        history.replaceState(null, '', u);
      } catch {
        /* noop */
      }
    };
    tabs.forEach((t) => t.addEventListener('click', () => setTab(t.dataset.tab || 'form')));
    const initial = new URLSearchParams(location.search).get('tab');
    if (initial === 'call' || initial === 'form') setTab(initial);
  }

  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const success = document.getElementById('form-success');
  if (form && success) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.style.display = 'none';
      success.style.display = 'block';
      scrollToTop();
    });
  }
}

/* ---- Résumé: copy email + print --------------------------------------- */
function initResume() {
  const copyBtn = document.getElementById('copy-email-btn');
  if (copyBtn) {
    const email = copyBtn.dataset.email || '';
    copyBtn.addEventListener('click', () => {
      const done = () => {
        copyBtn.textContent = 'Copied ✓';
        window.setTimeout(() => {
          copyBtn.textContent = 'Copy email';
        }, 1600);
      };
      try {
        navigator.clipboard.writeText(email).then(done, done);
      } catch {
        done();
      }
    });
  }
  const dlBtn = document.getElementById('download-pdf-btn');
  const dataEl = document.getElementById('resume-data');
  if (dlBtn && dataEl) {
    dlBtn.addEventListener('click', async () => {
      const label = dlBtn.textContent;
      dlBtn.setAttribute('disabled', 'true');
      dlBtn.textContent = 'Preparing…';
      try {
        const data = JSON.parse(dataEl.textContent || '{}');
        const { generateResumePdf } = await import('./resume-pdf');
        generateResumePdf(data);
      } catch (err) {
        console.error('PDF generation failed:', err);
        // Fall back to the print dialog so the user still gets a PDF.
        try {
          window.print();
        } catch {
          /* noop */
        }
      } finally {
        dlBtn.removeAttribute('disabled');
        dlBtn.textContent = label;
      }
    });
  }
}

/* ---- Mobile nav -------------------------------------------------------- */
function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('nav-burger');
  if (!nav || !burger) return;
  const setOpen = (open: boolean) => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    // Lock background scroll while the dropdown is open so the page can't
    // drift behind the menu.
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) lenis?.stop();
    else lenis?.start();
  };
  burger.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.querySelectorAll('.nav-mobile a').forEach((a) =>
    a.addEventListener('click', () => setOpen(false))
  );
  // Esc closes the menu.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) setOpen(false);
  });
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
  initNav();
  initWhatsAppFab();
  initHeroTilt();
  initShopifyStack();
  initBarGrow();
  initCroCalc();
  initTabSpy();
  initReveal();
  initHeroIntro();
  initCountUp();
  initRotatingWord();
  initProjectFilter();
  initModal();
  initBlogFilter();
  initStart();
  initResume();
  initClock();
  initBackToTop();
});
