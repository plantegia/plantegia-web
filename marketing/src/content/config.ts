import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    lang: z.enum(['en', 'de']).default('en'),
    // For related posts
    category: z.enum([
      'perpetual-harvest',
      'multi-tent',
      'planning',
      'tools',
      'guides',
    ]).default('guides'),
  }),
});

export const collections = { blog };
