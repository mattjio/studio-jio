// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://studioj.io',
  vite: { plugins: [tailwindcss()] },
});
