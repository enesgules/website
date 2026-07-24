import { lazy, Suspense, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";

const DitherField = lazy(() =>
  import("./DitherField").then((module) => ({
    default: module.DitherField,
  })),
);

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
  const [isOpen, setIsOpen] = useState(false);
  const [canRenderShader] = useState(canUseWebGl);

  return (
    <main
      className="wordmark-stage"
      data-open={isOpen}
      aria-labelledby="page-title"
    >
      <h1 className="visually-hidden" id="page-title">
        Abdullah Enes Gules, software engineer at Upstash building Context7
      </h1>

      <Suspense
        fallback={
          <div
            className="dither-field dither-field--fallback"
            aria-hidden="true"
          />
        }
      >
        {canRenderShader ? (
          <DitherField />
        ) : (
          <div
            className="dither-field dither-field--fallback"
            aria-hidden="true"
          />
        )}
      </Suspense>

      <div className="identity-control">
        <button
          className="identity-toggle"
          type="button"
          aria-label={isOpen ? "Close introduction" : "Meet Abdush"}
          aria-pressed={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="identity-toggle__orb">
            <ThinkingOrb
              state={isOpen ? "solving" : "shaping"}
              size={64}
              theme="dark"
              speed={0.72}
              aria-hidden="true"
              style={{ width: "64%", height: "64%" }}
            />
          </span>

          <span className="identity-toggle__labels" aria-hidden="true">
            <span className="identity-toggle__label identity-toggle__label--closed">
              meet abdush
            </span>
            <span className="identity-toggle__label identity-toggle__label--open">
              close
            </span>
          </span>
        </button>
      </div>

      <div className="wordmark" aria-hidden="true">
        <span className="wordmark__nickname">abdush</span>

        <div className="wordmark__name">
          <span className="wordmark__half wordmark__half--left">enes</span>
          <span className="wordmark__half wordmark__half--right">gules</span>
        </div>
      </div>

      <footer className="identity-rail">
        <div className="identity-rail__intro">
          <p>
            I build{" "}
            <a
              href="https://context7.com"
              target="_blank"
              rel="noreferrer"
            >
              Context7
            </a>{" "}
            at{" "}
            <a href="https://upstash.com" target="_blank" rel="noreferrer">
              Upstash
            </a>
            .
          </p>
          <p className="identity-rail__meta">
            software engineer · istanbul
          </p>
        </div>

        <nav className="identity-links" aria-label="Find Enes online">
          <a
            href="https://github.com/enesgules"
            target="_blank"
            rel="noreferrer"
          >
            github <span aria-hidden="true">↗</span>
          </a>
          <a
            href="https://www.linkedin.com/in/abdullah-enes-gules"
            target="_blank"
            rel="noreferrer"
          >
            linkedin <span aria-hidden="true">↗</span>
          </a>
          <a
            href="https://x.com/abdushbag"
            target="_blank"
            rel="noreferrer"
          >
            x <span aria-hidden="true">↗</span>
          </a>
          <a href="mailto:abdullah.enes.gules@gmail.com">email</a>
        </nav>
      </footer>
    </main>
  );
}
