#!/usr/bin/env node
// Validates cross-references between content collections against the
// actual files on disk, so a typo'd id/slug/title fails the build loudly
// instead of silently rendering nothing (missing image, dead link, etc).
//
// Covers:
//  - src/content/featured/featured.json
//      `image` / `thumbnail` / `poster`  -> src/content/images/ id
//      `link.slug`                       -> slug of `link.collection`
//  - src/content/series/*.md and src/content/panoramas/*.md
//      `pieces[]`                        -> src/content/images/ id
//      `thumbnail`                       -> src/content/images/ id
//      `project`                         -> a project's `title`
//  - src/content/projects/*/index.{md,mdx}
//      `thumbnail`                       -> src/content/images/ id
//      `series[]`                        -> src/content/series/ id
//      `panoramas[]`                     -> src/content/panoramas/ id
//
// Run via `node scripts/check-content-refs.mjs` (or `npm run check:refs`).
// Wired into `prebuild` so it runs automatically before `npm run build`.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const contentDir = join(root, "src", "content");

// Mirrors Astro's default slug generation closely enough for this check:
// lowercase, whitespace becomes "-", everything else (besides letters,
// digits, "-" and "_") is stripped. Underscores are preserved as-is,
// matching how Astro slugs e.g. "grid_dirt_glass.md" -> "grid_dirt_glass".
function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");
}

function readFrontmatter(file) {
  const raw = readFileSync(file, "utf-8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  return parseYaml(match[1]) ?? {};
}

// Reads every entry of a content collection, whether it's stored as flat
// files (e.g. src/content/images/foo.md) or as directories with an
// index file (e.g. src/content/projects/Foo/index.mdx).
//
// `id` is the raw filename/dirname (used by Astro's `reference()`), and
// `slug` is Astro's slugified version (used for page URLs).
function readCollection(name) {
  const dir = join(contentDir, name);
  if (!existsSync(dir)) return [];

  const entries = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      const indexFile = ["index.md", "index.mdx"]
        .map((f) => join(full, f))
        .find(existsSync);
      if (!indexFile) continue;
      entries.push({
        id: entry,
        slug: slugify(entry),
        frontmatter: readFrontmatter(indexFile),
      });
    } else if (stat.isFile() && [".md", ".mdx"].includes(extname(entry))) {
      const id = basename(entry, extname(entry));
      entries.push({
        id,
        slug: slugify(id),
        frontmatter: readFrontmatter(full),
      });
    }
  }
  return entries;
}

const collections = {
  images: readCollection("images"),
  series: readCollection("series"),
  panoramas: readCollection("panoramas"),
  projects: readCollection("projects"),
};

const imageIds = new Set(collections.images.map((e) => e.id));

const idSets = {
  series: new Set(collections.series.map((e) => e.id)),
  panoramas: new Set(collections.panoramas.map((e) => e.id)),
  projects: new Set(collections.projects.map((e) => e.id)),
};

const slugSets = {
  series: new Set(collections.series.map((e) => e.slug)),
  panoramas: new Set(collections.panoramas.map((e) => e.slug)),
  projects: new Set(collections.projects.map((e) => e.slug)),
};

const projectTitles = new Set(
  collections.projects.map((e) => e.frontmatter.title).filter(Boolean),
);

const errors = [];
const warnings = [];

function checkImageId(label, field, value) {
  if (value == null) return;
  if (!imageIds.has(value)) {
    errors.push(
      `${label}: ${field} "${value}" not found in src/content/images/ (ids are case-sensitive filenames without extension)`,
    );
  }
}

function checkSlug(label, field, collection, value) {
  if (value == null) return;
  const valid = slugSets[collection];
  if (!valid) {
    errors.push(`${label}: ${field} references unknown collection "${collection}"`);
    return;
  }
  if (!valid.has(value)) {
    errors.push(
      `${label}: ${field} "${value}" not found in ${collection} (expected one of: ${[...valid].sort().join(", ")})`,
    );
  }
}

function checkId(label, field, collection, value) {
  if (value == null) return;
  const valid = idSets[collection];
  if (!valid) {
    errors.push(`${label}: ${field} references unknown collection "${collection}"`);
    return;
  }
  if (!valid.has(value)) {
    errors.push(
      `${label}: ${field} "${value}" not found in src/content/${collection}/ (expected one of: ${[...valid].sort().join(", ")})`,
    );
  }
}

// `project` is a free-text title rather than a slug/id reference, and may
// legitimately point at a project that hasn't been built yet (see
// PROGRESS.md). Mismatches are surfaced as warnings, not build failures.
function checkProjectTitle(label, field, value) {
  if (value == null) return;
  if (!projectTitles.has(value)) {
    warnings.push(
      `${label}: ${field} "${value}" doesn't match any existing project title (known titles: ${[...projectTitles].sort().join(", ")}). OK if "${value}" is a planned project that doesn't have a page yet.`,
    );
  }
}

// --- featured.json -------------------------------------------------------

const featuredPath = join(contentDir, "featured", "featured.json");
if (existsSync(featuredPath)) {
  const items = JSON.parse(readFileSync(featuredPath, "utf-8"));
  items.forEach((item, index) => {
    const label = `featured.json[${index}] ("${item.title ?? "untitled"}")`;

    if (item.type === "image") checkImageId(label, "image", item.image);
    checkImageId(label, "thumbnail", item.thumbnail);
    checkImageId(label, "poster", item.poster);

    const { collection, slug } = item.link ?? {};
    if (collection && slug) checkSlug(label, "link.slug", collection, slug);
  });
}

// --- series & panoramas ---------------------------------------------------

for (const collectionName of ["series", "panoramas"]) {
  for (const entry of collections[collectionName]) {
    const label = `${collectionName}/${entry.id}`;
    const { pieces, thumbnail, project } = entry.frontmatter;

    for (const piece of pieces ?? []) {
      checkImageId(label, `pieces[]`, piece);
    }
    checkImageId(label, "thumbnail", thumbnail);
    checkProjectTitle(label, "project", project);
  }
}

// --- projects ---------------------------------------------------------

for (const entry of collections.projects) {
  const label = `projects/${entry.id}`;
  const { thumbnail, series, panoramas } = entry.frontmatter;

  checkImageId(label, "thumbnail", thumbnail);
  for (const s of series ?? []) checkId(label, `series[]`, "series", s);
  for (const p of panoramas ?? []) checkId(label, `panoramas[]`, "panoramas", p);
}

// --- report ----------------------------------------------------------------

if (warnings.length > 0) {
  console.warn("Content reference warnings:\n");
  for (const w of warnings) console.warn(`  - ${w}`);
  console.warn("");
}

if (errors.length > 0) {
  console.error("Content reference check failed:\n");
  for (const e of errors) console.error(`  - ${e}`);
  console.error("\nFix the source file(s) above and re-run.");
  process.exit(1);
}

const total =
  (collections.series.length +
    collections.panoramas.length +
    collections.projects.length +
    (existsSync(featuredPath) ? JSON.parse(readFileSync(featuredPath, "utf-8")).length : 0));
console.log(`Content reference check passed (${total} entries checked).`);
