import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    sector: z.string(),
    year: z.number(),
    summary: z.string(),
    result: z.string().optional(),
    url: z.string().url(),
    featured: z.boolean().default(true),
    // Caption shown inside the placeholder frame until real imagery is added
    imageNote: z.string(),
  }),
});

export const collections = { projects };
