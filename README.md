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

## Details

- Press `G` (or the footer button) to show the 12-column grid overlay.
- Footer clock shows studio time in `site.timeZone`.

## Deploy

Import the repo in Vercel or Cloudflare Pages (framework preset: Astro, build `npm run build`, output `dist`),
then point studioj.io at it.
