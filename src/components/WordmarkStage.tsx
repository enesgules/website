import { lazy, Suspense, useState } from "react";
import type { DitherVariant } from "./DitherField";

const DitherField = lazy(() =>
  import("./DitherField").then((module) => ({
    default: module.DitherField,
  })),
);

type Project = {
  name: string;
  description: string;
  href: string;
  dither: Exclude<DitherVariant, "idle">;
};

const projects: ReadonlyArray<Project> = [
  {
    name: "Context7",
    description:
      "Up-to-date library documentation and code examples for AI coding agents.",
    href: "https://context7.com",
    dither: "context7",
  },
  {
    name: "Hugeicons Animated",
    description:
      "Hand-animated React icons that install as editable source code.",
    href: "https://hugeicons-animated.com",
    dither: "hugeicons",
  },
  {
    name: "Distributed Concepts",
    description:
      "A 3D lesson that makes distributed database behavior visible.",
    href: "https://distributedconcepts.com",
    dither: "distributed",
  },
  {
    name: "DKT Materyal",
    description:
      "Printable activity cards made for Turkish speech therapists.",
    href: "https://dktmateryal.com",
    dither: "dkt",
  },
];

function canUseWebGl() {
  if (typeof document === "undefined") {
    return false;
  }

  const canvas = document.createElement("canvas");
  const context =
    canvas.getContext("webgl2") ?? canvas.getContext("webgl");

  context?.getExtension("WEBGL_lose_context")?.loseContext();

  return context !== null;
}

export function WordmarkStage() {
  const [canRenderShader] = useState(canUseWebGl);
  const [ditherVariant, setDitherVariant] =
    useState<DitherVariant>("idle");

  return (
    <main className="profile" aria-labelledby="page-title">
      <div className="dither-backdrop" data-variant={ditherVariant}>
        <Suspense
          fallback={
            <div
              className="dither-field dither-field--fallback"
              data-variant={ditherVariant}
              aria-hidden="true"
            />
          }
        >
          {canRenderShader ? (
            <DitherField variant={ditherVariant} />
          ) : (
            <div
              className="dither-field dither-field--fallback"
              data-variant={ditherVariant}
              aria-hidden="true"
            />
          )}
        </Suspense>
      </div>

      <div className="profile__shell">
        <header className="profile__header">
          <div className="profile__identity">
            <h1 id="page-title">Abdullah Enes Gules</h1>
            <p>Software Engineer</p>
          </div>
          <img
            className="profile__avatar"
            src="https://avatars.githubusercontent.com/u/101020733?v=4"
            alt=""
            width="44"
            height="44"
            aria-hidden="true"
          />
        </header>

        <section className="profile-section profile-section--today">
          <h2>Today</h2>
          <div className="profile-section__body">
            <p>
              I build{" "}
              <a
                className="inline-favicon-link"
                href="https://context7.com"
                target="_blank"
                rel="noreferrer"
              >
                Context7
                <img
                  className="inline-favicon-link__icon"
                  src="https://context7.com/favicon.ico"
                  alt=""
                  width="20"
                  height="20"
                  aria-hidden="true"
                />
              </a>{" "}
              at{" "}
              <a
                className="inline-favicon-link"
                href="https://upstash.com"
                target="_blank"
                rel="noreferrer"
              >
                Upstash
                <img
                  className="inline-favicon-link__icon"
                  src="https://upstash.com/icons/favicon-32x32.png"
                  alt=""
                  width="20"
                  height="20"
                  aria-hidden="true"
                />
              </a>
              . It gives AI coding agents current, version-specific library
              docs and code examples.
            </p>
            <p>
              I also build small open-source tools and interactive ways to
              explain technical ideas.
            </p>
          </div>
        </section>

        <section className="profile-section" aria-labelledby="projects-title">
          <h2 id="projects-title">Projects</h2>

          <div className="project-list">
            {projects.map((project) => (
              <a
                className="project-entry"
                data-project={project.dither}
                href={project.href}
                key={project.href}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => setDitherVariant(project.dither)}
                onMouseLeave={() => setDitherVariant("idle")}
                onFocus={() => setDitherVariant(project.dither)}
                onBlur={() => setDitherVariant("idle")}
              >
                <span className="project-entry__title">{project.name}</span>
                <span className="project-entry__description">
                  {project.description}
                </span>
                <span className="project-entry__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </section>

        <footer className="profile-footer">
          <nav className="social-links" aria-label="Find Enes online">
            <a
              className="social-text-link"
              href="https://github.com/enesgules"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              className="social-text-link"
              href="https://www.linkedin.com/in/abdullah-enes-gules"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              className="social-text-link"
              href="https://x.com/abdushbag"
              target="_blank"
              rel="noreferrer"
            >
              X (Twitter)
            </a>
            <a
              className="social-text-link"
              href="mailto:abdullah.enes.gules@gmail.com"
            >
              Email
            </a>
          </nav>
        </footer>
      </div>
    </main>
  );
}
