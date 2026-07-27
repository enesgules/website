import {
  GithubIcon,
  Linkedin01Icon,
  Mail01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "../theme/useTheme";
import {
  DitherBackdrop,
  type DitherVariant,
} from "./dither/DitherBackdrop";
import { ExternalFaviconLink } from "./ExternalFaviconLink";
import { PageControls } from "./PageControls";

type Project = {
  name: string;
  description: string;
  href: string;
  dither: Exclude<DitherVariant, "idle">;
};

export type TextBackdrop =
  | "none"
  | "text-halo"
  | "section-haze"
  | "soft-column"
  | "blurred-veil";

const projects: ReadonlyArray<Project> = [
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

const context7RepositoryUrl = "https://github.com/upstash/context7";
const context7RepositoryApiUrl =
  "https://api.github.com/repos/upstash/context7";
const fallbackContext7StarCount = 60_000;
const compactNumberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 0,
  notation: "compact",
});

let context7StarCountRequest: Promise<number | null> | null = null;

function readStargazerCount(value: unknown) {
  if (
    typeof value !== "object" ||
    value === null ||
    !("stargazers_count" in value)
  ) {
    return null;
  }

  const count = value.stargazers_count;
  return typeof count === "number" ? count : null;
}

function fetchContext7StarCount() {
  if (!context7StarCountRequest) {
    context7StarCountRequest = fetch(context7RepositoryApiUrl)
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return readStargazerCount(await response.json());
      })
      .catch(() => null);
  }

  return context7StarCountRequest;
}

function Context7StarCount() {
  const [starCount, setStarCount] = useState(fallbackContext7StarCount);

  useEffect(() => {
    let isActive = true;

    void fetchContext7StarCount().then((count) => {
      if (isActive && count !== null) {
        setStarCount(count);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <a
      className="context7-stars"
      href={context7RepositoryUrl}
      target="_blank"
      rel="noreferrer"
    >
      <span className="context7-stars__count">
        {compactNumberFormatter.format(starCount)}
      </span>{" "}
      stars on GitHub
      <span
        className="link-icon-tile context7-stars__icon"
        aria-hidden="true"
      >
        <HugeiconsIcon icon={GithubIcon} size={15} strokeWidth={1.7} />
      </span>
    </a>
  );
}

type SocialSentenceLinkProps = {
  href: string;
  icon: IconSvgElement;
  iconSize?: number;
  label: string;
  newTab?: boolean;
};

function SocialSentenceLink({
  href,
  icon,
  iconSize = 15,
  label,
  newTab = false,
}: SocialSentenceLinkProps) {
  return (
    <a
      className="social-sentence__link"
      href={href}
      rel={newTab ? "noreferrer" : undefined}
      target={newTab ? "_blank" : undefined}
    >
      <span className="social-sentence__label">{label}</span>
      <span
        className="link-icon-tile social-sentence__icon"
        aria-hidden="true"
      >
        <HugeiconsIcon
          icon={icon}
          size={iconSize}
          strokeWidth={1.7}
        />
      </span>
    </a>
  );
}

function SocialFooter() {
  const sentenceRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const sentence = sentenceRef.current;

    if (!sentence) {
      return;
    }

    const positionIcons = () => {
      const links = Array.from(
        sentence.querySelectorAll<HTMLElement>(".social-sentence__link"),
      );
      const labels = links.map((link) =>
        link.querySelector<HTMLElement>(".social-sentence__label"),
      );
      const labelTops = labels.flatMap((label) =>
        label ? [label.getBoundingClientRect().top] : [],
      );
      const firstLineTop = Math.min(...labelTops);

      links.forEach((link, index) => {
        const label = labels[index];

        if (!label) {
          return;
        }

        const isFirstLine =
          Math.abs(label.getBoundingClientRect().top - firstLineTop) < 2;
        link.dataset.iconPosition = isFirstLine ? "top" : "bottom";
      });
    };

    positionIcons();
    window.addEventListener("resize", positionIcons);

    let isActive = true;
    void document.fonts.ready.then(() => {
      if (isActive) {
        positionIcons();
      }
    });

    return () => {
      isActive = false;
      window.removeEventListener("resize", positionIcons);
    };
  }, []);

  return (
    <footer className="profile-footer">
      <p className="social-sentence" ref={sentenceRef}>
        Find my code on{" "}
        <SocialSentenceLink
          href="https://github.com/enesgules"
          icon={GithubIcon}
          label="GitHub"
          newTab
        />
        . You can also reach me through{" "}
        <SocialSentenceLink
          href="https://x.com/abdushbag"
          icon={NewTwitterIcon}
          iconSize={14}
          label="X"
          newTab
        />
        ,{" "}
        <SocialSentenceLink
          href="https://www.linkedin.com/in/abdullah-enes-gules"
          icon={Linkedin01Icon}
          label="LinkedIn"
          newTab
        />
        , or{" "}
        <SocialSentenceLink
          href="mailto:abdullah.enes.gules@gmail.com"
          icon={Mail01Icon}
          label="email"
        />
        .
      </p>
    </footer>
  );
}

type WordmarkStageProps = {
  textBackdrop?: TextBackdrop;
};

export function WordmarkStage({
  textBackdrop = "section-haze",
}: WordmarkStageProps) {
  const [ditherVariant, setDitherVariant] =
    useState<DitherVariant>("idle");
  const { cycleTheme, theme } = useTheme();

  return (
    <main
      className="profile"
      data-text-backdrop={textBackdrop}
      aria-labelledby="page-title"
    >
      <DitherBackdrop
        theme={theme}
        variant={ditherVariant}
      />

      <PageControls
        theme={theme}
        onThemeCycle={cycleTheme}
      />

      <div className="profile__shell">
        <header className="profile__header">
          <div className="profile__identity">
            <h1 id="page-title">Abdullah Enes Gules</h1>
            <p>Software Engineer</p>
          </div>
          <img
            className="profile__avatar"
            src="/profile.jpg"
            alt=""
            width="44"
            height="44"
            aria-hidden="true"
          />
        </header>

        <section className="profile-section profile-section--today">
          <h2>Now</h2>
          <div className="profile-section__body">
            <p>
              I build{" "}
              <ExternalFaviconLink
                href="https://context7.com"
                faviconSrc="/brand/context7.png"
              >
                Context7
              </ExternalFaviconLink>{" "}
              at{" "}
              <ExternalFaviconLink
                href="https://upstash.com"
                faviconSrc="/brand/upstash-icon-dark.svg"
                iconBackground="#0A0A0A"
              >
                Upstash
              </ExternalFaviconLink>
              . It gives AI agents up-to-date, version-specific library docs
              and code examples. I was the first engineer at Context7 and
              helped build it from the ground up. Today, I’m still one of its
              core contributors. The open-source repo has{" "}
              <Context7StarCount />.
            </p>
          </div>
        </section>

        <section className="profile-section" aria-labelledby="projects-title">
          <h2 id="projects-title">Projects</h2>

          <div
            className="project-list"
            onPointerLeave={() => setDitherVariant("idle")}
          >
            {projects.map((project) => (
              <a
                className="project-entry"
                data-project={project.dither}
                href={project.href}
                key={project.href}
                target="_blank"
                rel="noreferrer"
                onPointerEnter={() => setDitherVariant(project.dither)}
                onPointerLeave={() => setDitherVariant("idle")}
                onFocus={() => setDitherVariant(project.dither)}
                onBlur={() => setDitherVariant("idle")}
              >
                <span className="project-entry__title">{project.name}</span>
                <span className="project-entry__description">
                  {project.description}
                </span>
              </a>
            ))}
          </div>
        </section>

        <SocialFooter />
      </div>
    </main>
  );
}
