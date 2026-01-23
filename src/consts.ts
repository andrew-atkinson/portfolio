import type { Site, Page, Links, Socials } from "@types";

// Global
export const SITE: Site = {
  TITLE: "Andrew Atkinson",
  DESCRIPTION:
    "Welcome to andrewatkinson.net, a portfolio showcasing the work of the artist.",
  AUTHOR: "Andrew Atkinson",
};

// About Page
export const ABOUT: Page = {
  TITLE: "About",
  DESCRIPTION: "Bio and Contact",
};

// Projects Page
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects",
};

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
};

export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Recent blog posts",
};

// Links
export const LINKS: Links = [
  {
    TEXT: "Home",
    HREF: "/",
  },
  {
    TEXT: "Projects",
    HREF: "/projects",
  },
  {
    TEXT: "About",
    HREF: "/about",
  },
];

// Socials
export const SOCIALS: Socials = [
  {
    NAME: "Github",
    ICON: "github",
    TEXT: "andrew-atkinson",
    HREF: "https://github.com/andrew-atkinson",
  },
  {
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "andrew peter atkinson",
    HREF: "https://www.linkedin.com/in/andrewpeteratkinson/",
  },
  {
    NAME: "Bluesky",
    ICON: "bluesky",
    TEXT: "songofthelark.bsky.social",
    HREF: "https://bsky.app/profile/songofthelark.bsky.social",
  },
];
