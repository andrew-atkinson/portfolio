import { defineCollection, z, reference } from "astro:content";

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
    thumbnail: z.string().optional(),
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

const videos = defineCollection({
  schema: z.object({
    src: z.string(),
    title: z.string(),
    alt: z.string(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
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
  type: "content",
  schema: z.object({
    layout: z.string().optional(),
    view: z.string().optional(),
    title: z.string(),
    pieces: z.array(reference("images")),
    project: z.string().optional(),
    id: z.string().optional(),
    initialIndex: z.number().optional(),
    thumbnail: z.string().optional(),
    loops: z.boolean().default(false),
  }),
});

const panoramas = defineCollection({
  type: "content",
  schema: z.object({
    layout: z.string().optional(),
    title: z.string(),
    pieces: z.array(reference("images")),
    project: z.string().optional(),
    id: z.string().optional(),
    initialIndex: z.number().optional(),
    thumbnail: z.string().optional(),
    loops: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: () =>
    z.object({
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()),
      draft: z.boolean().optional(),
      demoUrl: z.string().optional(),
      repoUrl: z.string().optional(),
      series: z.array(reference("series")).optional(),
      panoramas: z.array(reference("panoramas")).optional(),
      images: z.array(reference("images")).optional(),
      thumbnail: z.string().optional(),
    }),
});

const legal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
});

// Featured works for the front-page carousel.
// Each entry links to a project/series/panorama page and is one of:
// image, video (hosted on Bunny Stream), or p5 sketch.
//
// All entries live in a single file, src/content/featured/featured.json,
// as an array. Slide order follows array order.
const linkTarget = z.object({
  collection: z.enum(["projects", "series", "panoramas"]),
  slug: z.string(),
});

const featured = defineCollection({
  type: "data",
  schema: ({ image }) =>
    z.array(
      z.discriminatedUnion("type", [
        z.object({
          type: z.literal("image"),
          title: z.string(),
          image: reference("images"),
          link: linkTarget,
        }),
        z.object({
          type: z.literal("video"),
          title: z.string(),
          videoId: z.string(),
          libraryId: z.string().optional(),
          poster: image().optional(),
          link: linkTarget,
        }),
        z.object({
          type: z.literal("p5"),
          title: z.string(),
          sketch: z.string(),
          thumbnail: image().optional(),
          link: linkTarget,
        }),
      ]),
    ),
});

export const collections = {
  about,
  blog,
  projects,
  legal,
  series,
  pieces,
  images,
  panoramas,
  featured,
  videos,
};
