export const siteUrl = "https://enesgules.com";

export type Page = {
  path: string;
  title: string;
  description: string;
  // Labs are client-only design experiments kept out of search results.
  lab?: true;
};

export const homePage = {
  path: "/",
  title: "Abdullah Enes Gules (Güleş) - Software Engineer",
  description:
    "Abdullah Enes Gules is a software engineer at Upstash, building Context7 and open-source tools.",
} satisfies Page;

export const componentsPage = {
  path: "/components",
  title: "Components · Abdullah Enes Gules",
  description:
    "Small interface pieces Abdullah Enes Gules builds and keeps around.",
} satisfies Page;

const labDescription = "A design experiment by Abdullah Enes Gules.";

export const pages: Page[] = [
  homePage,
  componentsPage,
  {
    path: "/dither-lab",
    title: "Dither lab · Abdullah Enes Gules",
    description: labDescription,
    lab: true,
  },
  {
    path: "/scrim-lab",
    title: "Scrim lab · Abdullah Enes Gules",
    description: labDescription,
    lab: true,
  },
  {
    path: "/dkt-dither-lab",
    title: "DKT dither lab · Abdullah Enes Gules",
    description: labDescription,
    lab: true,
  },
];
