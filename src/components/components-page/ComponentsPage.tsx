import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, type MouseEventHandler } from "react";
import { projects } from "../../data/projects";
import { ExternalFaviconLink } from "../ExternalFaviconLink";
import { QuickLinksMenu } from "../QuickLinksMenu";
import {
  CayIcon,
  CaySpoonIcon,
  CaySugarIcon,
  EsnafButtonedIcon,
  EsnafIcon,
  EsnafSmokingIcon,
} from "../turkish-icons/TurkishIcons";
import "./components-page.css";

type ComponentsPageProps = {
  onNavigate: MouseEventHandler<HTMLAnchorElement>;
};

export function ComponentsPage({ onNavigate }: ComponentsPageProps) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Components · Abdullah Enes Gules";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="components-page__shell">
      <a className="components-page__back" href="/" onClick={onNavigate}>
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

        <section
          className="component-showcase"
          aria-labelledby="turkish-icons-title"
        >
          <div className="component-showcase__meta">
            <div>
              <h2 id="turkish-icons-title">Turkish icon explorations</h2>
            </div>
            <p>
              Exploring a simple outline style for familiar Turkish characters
              and objects.
            </p>
          </div>

          <div className="component-demo component-demo--turkish-icons">
            <div
              className="component-icon-explorations"
              aria-label="Turkish icon explorations"
            >
              <section
                className="component-icon-study"
                aria-labelledby="esnaf-study-title"
              >
                <h3
                  className="component-icon-study__title"
                  id="esnaf-study-title"
                >
                  Esnaf · Shopkeeper
                </h3>
                <div className="component-icon-study__variants component-icon-study__variants--three">
                  <figure className="component-icon-exploration">
                    <EsnafIcon className="component-icon-exploration__glyph" />
                    <figcaption>Open vest</figcaption>
                  </figure>

                  <figure className="component-icon-exploration">
                    <EsnafButtonedIcon className="component-icon-exploration__glyph" />
                    <figcaption>Waistcoat</figcaption>
                  </figure>

                  <figure className="component-icon-exploration">
                    <EsnafSmokingIcon className="component-icon-exploration__glyph" />
                    <figcaption>Smoking</figcaption>
                  </figure>
                </div>
              </section>

              <section
                className="component-icon-study"
                aria-labelledby="cay-study-title"
              >
                <h3
                  className="component-icon-study__title"
                  id="cay-study-title"
                >
                  Çay · Tea
                </h3>
                <div className="component-icon-study__variants component-icon-study__variants--three">
                  <figure className="component-icon-exploration">
                    <CayIcon className="component-icon-exploration__glyph" />
                    <figcaption>Plain</figcaption>
                  </figure>

                  <figure className="component-icon-exploration">
                    <CaySpoonIcon className="component-icon-exploration__glyph" />
                    <figcaption>Spoon</figcaption>
                  </figure>

                  <figure className="component-icon-exploration">
                    <CaySugarIcon className="component-icon-exploration__glyph" />
                    <figcaption>Sugar cubes</figcaption>
                  </figure>
                </div>
              </section>
            </div>
          </div>
        </section>

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
      </div>
    </div>
  );
}
