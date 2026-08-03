import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect } from "react";
import { projects } from "../../data/projects";
import { useTheme } from "../../theme/useTheme";
import { DitherBackdrop } from "../dither/DitherBackdrop";
import { ExternalFaviconLink } from "../ExternalFaviconLink";
import { PageControls } from "../PageControls";
import { QuickLinksMenu } from "../QuickLinksMenu";
import "./components-page.css";

export function ComponentsPage() {
  const { cycleTheme, theme } = useTheme();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Components · Abdullah Enes Gules";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main
      className="profile components-page"
      data-quiet-dither="true"
      aria-labelledby="components-page-title"
    >
      <DitherBackdrop theme={theme} variant="idle" />

      <PageControls theme={theme} onThemeCycle={cycleTheme} />

      <div className="components-page__shell">
        <a className="components-page__back" href="/">
          <HugeiconsIcon
            className="components-page__back-icon"
            icon={ArrowLeft02Icon}
            size={16}
            strokeWidth={1.7}
            aria-hidden="true"
          />
          <span>Home</span>
        </a>

        <header className="profile__header components-page__header">
          <div className="profile__identity">
            <h1 id="components-page-title">Components</h1>
            <p>Small interface pieces I build and keep around.</p>
          </div>
        </header>

        <div className="component-showcase-list">
          <section
            className="component-showcase"
            aria-labelledby="morphing-menu-title"
          >
            <div className="component-showcase__meta">
              <div>
                <h2 id="morphing-menu-title">Morphing quick links</h2>
              </div>
              <p>
                A compact link list that expands from the same surface instead
                of opening a separate panel.
              </p>
            </div>

            <div className="component-demo component-demo--menu">
              <QuickLinksMenu projects={projects} />
            </div>
          </section>

          <section
            className="component-showcase"
            aria-labelledby="favicon-links-title"
          >
            <div className="component-showcase__meta">
              <div>
                <h2 id="favicon-links-title">Favicon links</h2>
              </div>
              <p>
                Links reveal the destination favicon on hover or keyboard
                focus.
              </p>
            </div>

            <div className="component-demo component-demo--favicons">
              <p className="component-favicon-demo">
                I build{" "}
                <ExternalFaviconLink
                  faviconSrc="/brand/context7.png"
                  href="https://context7.com"
                >
                  Context7
                </ExternalFaviconLink>{" "}
                <span className="component-favicon-demo__keep">
                  at{" "}
                  <ExternalFaviconLink
                    faviconSrc="/brand/upstash-icon-dark.svg"
                    href="https://upstash.com"
                    iconBackground="#0A0A0A"
                    iconPadding={2}
                  >
                    Upstash
                  </ExternalFaviconLink>
                  .
                </span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
