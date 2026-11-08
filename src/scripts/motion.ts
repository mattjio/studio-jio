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
// Scroll reveals play on the way down and rewind when you scroll back above them
const REVERSE = 'play none none reverse';

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
    cursor(lenis);
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

/* Page-load sequence: header drops in, headline rises character by character,
   then the lines slide apart as the hero scrolls away */
function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 });
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const title = document.querySelector<HTMLElement>('[data-hero-title]');

  tl.from('[data-header]', { yPercent: -100, duration: 1.1 }, 0);
  if (title && hero) {
    let introDone = false;
    let drift: gsap.core.Tween[] = [];
    SplitText.create(title, {
      type: 'lines,chars',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) => {
        drift.forEach((t) => t.revert());
        const rows = self.masks.length ? self.masks : self.lines;
        drift = rows.map((row, i) =>
          gsap.to(row, {
            xPercent: i % 2 ? 7 : -7,
            ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 },
          }),
        );
        if (introDone) return;
        introDone = true;
        return tl.from(
          self.chars,
          { yPercent: 120, rotate: 7, transformOrigin: '0% 100%', duration: 1.3, stagger: 0.022 },
          0.15,
        );
      },
    });
  }
  tl.from('[data-intro]', { y: 28, autoAlpha: 0, duration: 1.2, stagger: 0.08 }, 0.7);
  tl.from('[data-intro-rule]', { scaleX: 0, transformOrigin: 'left center', duration: 1.6 }, 0.8);
  tl.add(reel, 1.4);
  ready();
}

/* Hero reel: wipe from one project to the next, with a progress bar per slide */
function reel() {
  const el = document.querySelector<HTMLElement>('[data-reel]');
  if (!el) return;
  const slides = gsap.utils.toArray<HTMLElement>('[data-reel-slide]', el);
  const bars = gsap.utils.toArray<HTMLElement>('[data-reel-bar]', el);
  if (slides.length < 2) return;
  const HOLD = 3.6;
  let i = 0;
  let paused = false;
  let pending: gsap.core.Tween | undefined;

  gsap.set(slides, { clipPath: 'inset(0% 0% 0% 100%)', zIndex: 0 });
  gsap.set(slides[0], { clipPath: 'inset(0% 0% 0% 0%)', zIndex: 1 });
  gsap.set(bars, { scaleX: 0 });

  const play = (idx: number) => {
    const img = slides[idx].querySelector('[data-reel-img]');
    if (img) gsap.fromTo(img, { y: 0 }, { y: () => -Math.min(240, (img as HTMLElement).offsetHeight * 0.06), duration: HOLD + 1.2, ease: 'none' });
    gsap.fromTo(bars[idx], { scaleX: 0 }, { scaleX: 1, duration: HOLD, ease: 'none' });
    pending = gsap.delayedCall(HOLD, advance);
  };

  const advance = () => {
    if (paused) {
      pending = gsap.delayedCall(0.4, advance);
      return;
    }
    const cur = slides[i];
    i = (i + 1) % slides.length;
    const next = slides[i];
    if (i === 0) gsap.set(bars, { scaleX: 0 });
    gsap.set(cur, { zIndex: 1 });
    gsap.set(next, { zIndex: 2 });
    const tl = gsap.timeline({ onComplete: () => gsap.set(cur, { clipPath: 'inset(0% 0% 0% 100%)', zIndex: 0 }) });
    tl.fromTo(next, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' });
    const img = next.querySelector('[data-reel-img]');
    if (img) tl.from(img, { scale: 1.18, duration: 1.6, ease: 'expo.out' }, 0);
    tl.to(cur, { xPercent: -12, duration: 1.1, ease: 'expo.inOut', clearProps: 'transform' }, 0);
    play(i);
  };

  // Hold still while the reel is off screen
  ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (st) => (paused = !st.isActive) });
  play(0);
  void pending;
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
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: REVERSE },
        }),
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal="up"]').forEach((el) => {
    gsap.from(el, {
      y: 40,
      autoAlpha: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: REVERSE },
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-reveal="stagger"]').forEach((el) => {
    gsap.from(el.children, {
      y: 24,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.07,
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: REVERSE },
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
      scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: REVERSE },
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
        scrollTrigger: { trigger: frame, start: 'top 85%', toggleActions: REVERSE },
      },
    );
    gsap.from(img, {
      scale: 1.2,
      duration: 1.8,
      ease: 'expo.out',
      scrollTrigger: { trigger: frame, start: 'top 85%', toggleActions: REVERSE },
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

/* Process: on desktop the navy band pins and the steps travel sideways;
   numerals roll up digit by digit as each step arrives */
function process() {
  const section = document.querySelector<HTMLElement>('[data-process]');
  const track = section?.querySelector<HTMLElement>('[data-process-track]');
  const bar = section?.querySelector<HTMLElement>('[data-process-bar]');
  if (!section || !track) return;

  const rollIn = (el: HTMLElement, trigger: ScrollTrigger.Vars) => {
    const split = SplitText.create(el, { type: 'chars', mask: 'chars', charsClass: 'num-char' });
    gsap.from(split.chars, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.12, scrollTrigger: trigger });
  };

  const mm = gsap.matchMedia();
  mm.add('(min-width: 64rem)', () => {
    // Travel until the last step's right edge meets the content edge, not the padded box edge
    const distance = () => {
      const wrap = track.parentElement!;
      const cs = getComputedStyle(wrap);
      const inner = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      return Math.max(0, track.scrollWidth - inner);
    };
    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance() * 1.2,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    if (bar) gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + distance() * 1.2, scrub: 0.8, invalidateOnRefresh: true } });

    const viewport = track.parentElement!.clientWidth;
    section.querySelectorAll<HTMLElement>('[data-step]').forEach((step) => {
      const num = step.querySelector<HTMLElement>('[data-num]');
      if (!num) return;
      const visibleAtStart = step.offsetLeft < viewport * 0.85;
      rollIn(
        num,
        visibleAtStart
          ? { trigger: section, start: 'top 55%', toggleActions: REVERSE }
          : { trigger: step, containerAnimation: slide, start: 'left 80%', toggleActions: REVERSE },
      );
    });
  });
  mm.add('(max-width: 63.999rem)', () => {
    section.querySelectorAll<HTMLElement>('[data-num]').forEach((num) => rollIn(num, { trigger: num, start: 'top 85%', toggleActions: REVERSE }));
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

/* A small navy cursor that grows into a labelled disc over projects.
   State is re-checked on scroll too, since content moves under a still pointer. */
function cursor(lenis: Lenis) {
  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const label = dot?.querySelector<HTMLElement>('[data-cursor-label]');
  if (!dot || !label) return;
  root.classList.add('has-cursor');
  const x = gsap.quickTo(dot, 'x', { duration: 0.35, ease: 'power3' });
  const y = gsap.quickTo(dot, 'y', { duration: 0.35, ease: 'power3' });
  gsap.set(dot, { xPercent: -50, yPercent: -50, autoAlpha: 0 });

  let px = -1;
  let py = -1;
  let mode: 'none' | 'link' | 'label' = 'none';
  let labelled: HTMLElement | null = null;

  const update = () => {
    if (px < 0) return;
    const hit = document.elementFromPoint(px, py) as HTMLElement | null;
    const target = hit?.closest<HTMLElement>('[data-cursor]') ?? null;
    const link = !target && hit?.closest('a, button');
    const next = target ? 'label' : link ? 'link' : 'none';
    if (next === mode && target === labelled) return;
    mode = next;
    labelled = target;
    if (target) {
      label.textContent = target.dataset.cursor || '';
      dot.classList.toggle('is-light', target.dataset.cursorTheme === 'light');
      gsap.to(dot, { width: 104, height: 104, scale: 1, duration: 0.5, ease: 'expo.out', overwrite: 'auto' });
      gsap.to(label, { autoAlpha: 1, duration: 0.3, delay: 0.1, overwrite: true });
    } else {
      gsap.to(label, { autoAlpha: 0, duration: 0.15, overwrite: true });
      gsap.to(dot, {
        width: 10,
        height: 10,
        scale: link ? 2.4 : 1,
        duration: 0.5,
        ease: 'expo.out',
        overwrite: 'auto',
        onComplete: () => {
          if (mode !== 'label') dot.classList.remove('is-light');
        },
      });
    }
  };

  window.addEventListener('pointermove', (e) => {
    if (px < 0) {
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      gsap.to(dot, { autoAlpha: 1, duration: 0.3 });
    }
    px = e.clientX;
    py = e.clientY;
    x(px);
    y(py);
    update();
  });
  lenis.on('scroll', update);
  root.addEventListener('pointerleave', () => {
    px = -1;
    gsap.to(dot, { autoAlpha: 0, duration: 0.2 });
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
