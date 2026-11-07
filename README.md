# studioj.io

Studio Jio's portfolio site. Astro 6 + Tailwind CSS 4, static output, no client framework.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Where things live

| What | File |
| --- | --- |
| Studio facts (headline, tagline, email, location, socials, process steps) | `src/site.ts` |
| Projects (one Markdown file each) | `src/content/projects/*.md` |
| Brand colors and fonts | `@theme` block in `src/styles/global.css` |
| Page sections | `src/components/` |
| Logo files | `src/assets/brand/` |

## Adding a project

Copy `src/content/projects/safespeed.md`, change the frontmatter, and set `order`. The first two featured
projects fill the large and offset slots; the third slot is always the "Next project" call to action.

## Placeholders to replace

Search for `TODO` in `src/site.ts`. Image frames are placeholders; swap `Frame` for Astro's `<Image>` in
`src/components/ProjectCard.astro` once screenshots exist.

## Motion

All motion lives in `src/scripts/motion.ts` (GSAP + ScrollTrigger + SplitText, Lenis smooth scroll). Markup opts in
with data attributes:

| Attribute | Effect |
| --- | --- |
| `data-hero-title`, `data-intro`, `data-intro-rule` | Page-load sequence |
| `data-reveal="lines"` / `"up"` / `"stagger"` | Scroll reveals |
| `data-rule` | Rule draws left to right |
| `data-shot` + `data-shot-img` | Screenshot wipes in; full page scrolls inside the frame on hover |
| `data-speed="0.1"` | Parallax drift (desktop only) |
| `data-num` | Process numerals roll up |
| `data-marquee` | Ticker that reacts to scroll speed and direction |
| `data-cursor="Label"` | Custom cursor grows and shows the label |
| `data-magnetic` | Button leans toward the pointer |

With `prefers-reduced-motion`, or if the script fails, the page renders complete and static.

Project screenshots are full-page captures (1280px wide) in `src/assets/work/`.

## Details

- Press `G` (or the footer button) to show the 12-column grid overlay.
- Press `D` (or the header button) to switch light and dark. The choice is remembered; until then the site follows the device setting. Dark values live in the `[data-theme="dark"]` block of `global.css`.
- Footer clock shows studio time in `site.timeZone`.

## Deploy

Import the repo in Vercel or Cloudflare Pages (framework preset: Astro, build `npm run build`, output `dist`),
then point studioj.io at it.
