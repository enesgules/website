import type { DitherVariant } from "../components/dither/DitherBackdrop";

export type Project = {
  name: string;
  description: string;
  href: string;
  dither: Exclude<DitherVariant, "idle">;
};

export const projects: ReadonlyArray<Project> = [
  {
    name: "Context7",
    description:
      "Up-to-date, version-specific library docs and code examples for AI agents.",
    href: "https://context7.com",
    dither: "context7",
  },
  {
    name: "Hugeicons Animated",
    description:
      "A collection of hand-animated React icons you can install and edit.",
    href: "https://hugeicons-animated.com",
    dither: "hugeicons",
  },
  {
    name: "Distributed Concepts",
    description:
      "Explore distributed database behavior through an interactive 3D globe.",
    href: "https://distributedconcepts.com",
    dither: "distributed",
  },
  {
    name: "DKT Materyal",
    description:
      "Generate printable materials with AI for Turkish speech therapists.",
    href: "https://dktmateryal.com",
    dither: "dkt",
  },
];
