import { defineCollection, z, reference } from "astro:content";
import { glob } from "astro/loaders";

const about = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
  }),
});

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
  }),
});

const images = defineCollection({
  schema: ({ image }) =>
    z.object({
      src: image(),
      title: z.string(),
      alt: z.string(),
      description: z.string().optional(),
      date: z.coerce.date().optional(),
      time: z.string().optional(),
    }),
});

const pieces = z.object({
  schema: z.object({
    type: z.string(),
    title: z.string(),
    description: z.string().optional(),
    src: z.string(),
    alt: z.string().optional(),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/series" }),
  schema: z.object({
    layout: z.string().optional(),
    title: z.string(),
    pieces: z.array(reference("images")),
    project: z.string().optional(),
    id: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
    demoUrl: z.string().optional(),
    repoUrl: z.string().optional(),
    // series: z.array(series).optional(),
  }),
});

const legal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
});

export const collections = {
  about,
  blog,
  projects,
  legal,
  series,
  pieces,
  images,
};
