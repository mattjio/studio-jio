// Motion layer. Everything here is progressive enhancement: without JS, or with
// prefers-reduced-motion, the page renders complete and static.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const ready = () => root.classList.add('motion-ready');

if (reduce) {
  root.classList.remove('motion');
  ready();
} else {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  document.fonts.ready.then(init);
}

function init() {
  const lenis = smoothScroll();
  intro();
  reveals();
  rules();
  shots();
  process();
  marquee(lenis);
  header(lenis);
  if (finePointer) {
    cursor();
    magnetic();
  }
  ScrollTrigger.refresh();
}

/* Smooth scrolling, tied into GSAP's ticker so ScrollTrigger stays in sync */
function smoothScroll() {
  const lenis = new Lenis({ lerp: 0.1, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      const target = id === '#' ? 0 : document.querySelector<HTMLElement>(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.4 });
      history.replaceState(null, '', id);
    });
  });
  return lenis;
}

/* Page-load sequence: header drops in, headline rises line by line, then the rest */
function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 });
  const title = document.querySelector<HTMLElement>('[data-hero-title]');

  tl.from('[data-header]', { yPercent: -100, duration: 1.1 }, 0);
  if (title) {
    SplitText.create(title, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) => tl.from(self.lines, { yPercent: 115, duration: 1.4, stagger: 0.09 }, 0.15),
    });
  }
  tl.from('[data-intro]', { y: 28, autoAlpha: 0, duration: 1.2, stagger: 0.08 }, 0.6);
  tl.from('[data-intro-rule]', { scaleX: 0, transformOrigin: 'left center', duration: 1.6 }, 0.7);
  ready();
}

/* Scroll reveals: masked lines for headings, a soft rise for everything else */
function reveals() {
  gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 115,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal="up"]').forEach((el) => {
    gsap.from(el, {
      y: 40,
      autoAlpha: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal="stagger"]').forEach((el) => {
    gsap.from(el.children, {
      y: 24,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.07,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

/* Section rules draw from left to right like a drafting line */
function rules() {
  gsap.utils.toArray<HTMLElement>('[data-rule]').forEach((el) => {
    gsap.from(el, {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 1.6,
      ease: 'expo.inOut',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });
}

/* Project screenshots: wipe in, then the full page scrolls inside the frame on hover
   (or drifts with page scroll on touch screens) */
function shots() {
  gsap.utils.toArray<HTMLElement>('[data-shot]').forEach((frame) => {
    const img = frame.querySelector<HTMLElement>('[data-shot-img]');
    if (!img) return;

    gsap.fromTo(
      frame,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.5,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: frame, start: 'top 85%', once: true },
      },
    );
    gsap.from(img, {
      scale: 1.2,
      duration: 1.8,
      ease: 'expo.out',
      scrollTrigger: { trigger: frame, start: 'top 85%', once: true },
    });

    const travel = () => Math.max(0, img.offsetHeight - frame.offsetHeight);

    if (finePointer) {
      let tween: gsap.core.Tween | undefined;
      frame.addEventListener('mouseenter', () => {
        tween?.kill();
        const d = travel();
        tween = gsap.to(img, { y: -d, duration: Math.max(2, d / 700), ease: 'power1.inOut' });
      });
      frame.addEventListener('mouseleave', () => {
        tween?.kill();
        tween = gsap.to(img, { y: 0, duration: 1.1, ease: 'expo.out' });
      });
    } else {
      gsap.to(img, {
        y: () => -travel() * 0.35,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      });
    }
  });

  // Cards drift at slightly different speeds to exaggerate the staggered grid
  ScrollTrigger.matchMedia({
    '(min-width: 64rem)': () => {
      gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
        const speed = parseFloat(el.dataset.speed || '0');
        gsap.to(el, {
          y: () => -speed * window.innerHeight,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
        });
      });
    },
  });
}

/* Process numerals roll up digit by digit */
function process() {
  gsap.utils.toArray<HTMLElement>('[data-num]').forEach((el) => {
    const split = SplitText.create(el, { type: 'chars', mask: 'chars' });
    gsap.from(split.chars, {
      yPercent: 110,
      duration: 1.3,
      ease: 'expo.out',
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

/* Ticker band: loops forever, speeds up and reverses with scroll velocity */
function marquee(lenis: Lenis) {
  const track = document.querySelector<HTMLElement>('[data-marquee]');
  if (!track) return;
  const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  let dir = 1;
  lenis.on('scroll', ({ velocity, direction }: { velocity: number; direction: number }) => {
    if (direction) dir = direction;
    gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(velocity) / 3, 6)), duration: 0.3, overwrite: true });
  });
}

/* Header tucks away on the way down and returns on the way up */
function header(lenis: Lenis) {
  const el = document.querySelector<HTMLElement>('[data-header]');
  if (!el) return;
  let hidden = false;
  lenis.on('scroll', ({ scroll, direction }: { scroll: number; direction: number }) => {
    const hide = scroll > 160 && direction === 1;
    if (hide === hidden) return;
    hidden = hide;
    gsap.to(el, { yPercent: hide ? -100 : 0, duration: 0.6, ease: 'expo.out' });
  });
}

/* A small navy cursor that grows into a labelled disc over projects */
function cursor() {
  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const label = dot?.querySelector<HTMLElement>('[data-cursor-label]');
  if (!dot || !label) return;
  root.classList.add('has-cursor');
  const x = gsap.quickTo(dot, 'x', { duration: 0.35, ease: 'power3' });
  const y = gsap.quickTo(dot, 'y', { duration: 0.35, ease: 'power3' });
  gsap.set(dot, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
  let shown = false;
  window.addEventListener('pointermove', (e) => {
    if (!shown) {
      shown = true;
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      gsap.to(dot, { autoAlpha: 1, duration: 0.3 });
    }
    x(e.clientX);
    y(e.clientY);
  });
  document.documentElement.addEventListener('pointerleave', () => {
    shown = false;
    gsap.to(dot, { autoAlpha: 0, duration: 0.2 });
  });

  document.querySelectorAll<HTMLElement>('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      label.textContent = el.dataset.cursor || '';
      dot.classList.toggle('is-light', el.dataset.cursorTheme === 'light');
      gsap.to(dot, { width: 104, height: 104, duration: 0.5, ease: 'expo.out' });
      gsap.to(label, { autoAlpha: 1, duration: 0.3, delay: 0.1 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(dot, { width: 10, height: 10, duration: 0.5, ease: 'expo.out', onComplete: () => dot.classList.remove('is-light') });
      gsap.to(label, { autoAlpha: 0, duration: 0.15 });
    });
  });
  document.querySelectorAll<HTMLElement>('a:not([data-cursor]), button').forEach((el) => {
    el.addEventListener('mouseenter', () => gsap.to(dot, { scale: 2.4, duration: 0.4, ease: 'expo.out' }));
    el.addEventListener('mouseleave', () => gsap.to(dot, { scale: 1, duration: 0.4, ease: 'expo.out' }));
  });
}

/* Primary buttons lean toward the pointer */
function magnetic() {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.3);
      y((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });
}
