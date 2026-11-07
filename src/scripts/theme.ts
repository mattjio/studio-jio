// Light / dark switch. The choice is remembered; until someone picks, the site
// follows the device setting. Press D or use the header button.
type Theme = 'light' | 'dark';
const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: dark)');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const metaColor = document.querySelector<HTMLMetaElement>('[data-theme-color]');

const current = (): Theme => (root.dataset.theme === 'dark' ? 'dark' : 'light');

const paint = (theme: Theme) => {
  root.dataset.theme = theme;
  metaColor?.setAttribute('content', theme === 'dark' ? '#0C1522' : '#EAE6DF');
  document.querySelectorAll<HTMLElement>('[data-theme-label]').forEach((el) => {
    el.textContent = theme === 'dark' ? 'Light' : 'Dark';
  });
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((el) => {
    el.setAttribute('aria-pressed', String(theme === 'dark'));
  });
};

const choose = (theme: Theme) => {
  try {
    localStorage.setItem('theme', theme);
  } catch {}
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !reduce) doc.startViewTransition(() => paint(theme));
  else paint(theme);
};

paint(current());

document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((el) =>
  el.addEventListener('click', () => choose(current() === 'dark' ? 'light' : 'dark')),
);

document.addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement | null;
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'd' || e.key === 'D') choose(current() === 'dark' ? 'light' : 'dark');
});

media.addEventListener('change', (e) => {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem('theme');
  } catch {}
  if (!stored) paint(e.matches ? 'dark' : 'light');
});
