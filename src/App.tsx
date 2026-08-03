import {
  lazy,
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEventHandler,
} from "react";
import { WordmarkContent } from "./components/WordmarkStage";
import {
  DitherBackdrop,
  type DitherVariant,
} from "./components/dither/DitherBackdrop";
import { PageControls } from "./components/PageControls";
import { useTheme } from "./theme/useTheme";

const loadComponentsPage = () =>
  import("./components/components-page/ComponentsPage");

const ComponentsPage = lazy(() =>
  loadComponentsPage().then((module) => ({
    default: module.ComponentsPage,
  })),
);

const DitherLab = lazy(() =>
  import("./components/dither-lab/DitherLab").then((module) => ({
    default: module.DitherLab,
  })),
);

const ScrimLab = lazy(() =>
  import("./components/scrim-lab/ScrimLab").then((module) => ({
    default: module.ScrimLab,
  })),
);

const DktDitherLab = lazy(() =>
  import("./components/dkt-dither-lab/DktDitherLab").then((module) => ({
    default: module.DktDitherLab,
  })),
);

type ProfilePagesProps = {
  onNavigate: MouseEventHandler<HTMLAnchorElement>;
  pathname: string;
};

function ProfilePages({ onNavigate, pathname }: ProfilePagesProps) {
  const [ditherVariant, setDitherVariant] =
    useState<DitherVariant>("idle");
  const { cycleTheme, theme } = useTheme();
  const isComponentsPage = pathname === "/components";

  useEffect(() => {
    setDitherVariant("idle");
  }, [pathname]);

  return (
    <main
      className={isComponentsPage ? "profile components-page" : "profile"}
      data-dither-variant={ditherVariant}
      data-quiet-dither="true"
      data-text-backdrop={isComponentsPage ? undefined : "none"}
      aria-labelledby={
        isComponentsPage ? "components-page-title" : "page-title"
      }
    >
      <DitherBackdrop theme={theme} variant={ditherVariant} />

      <PageControls theme={theme} onThemeCycle={cycleTheme} />

      <Suspense fallback={null}>
        {isComponentsPage ? (
          <ComponentsPage onNavigate={onNavigate} />
        ) : (
          <WordmarkContent
            onComponentsIntent={() => void loadComponentsPage()}
            onDitherVariantChange={setDitherVariant}
            onNavigate={onNavigate}
          />
        )}
      </Suspense>
    </main>
  );
}

export function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const shouldScrollToTopRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      shouldScrollToTopRef.current = false;

      startTransition(() => {
        setPathname(window.location.pathname);
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useLayoutEffect(() => {
    if (!shouldScrollToTopRef.current) {
      return;
    }

    shouldScrollToTopRef.current = false;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  const handleNavigate = useCallback<
    MouseEventHandler<HTMLAnchorElement>
  >((event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const destination = new URL(event.currentTarget.href);

    if (destination.origin !== window.location.origin) {
      return;
    }

    event.preventDefault();
    window.history.pushState(null, "", destination.href);
    shouldScrollToTopRef.current = true;

    startTransition(() => {
      setPathname(destination.pathname);
    });
  }, []);

  if (pathname === "/dither-lab") {
    return (
      <Suspense fallback={null}>
        <DitherLab />
      </Suspense>
    );
  }

  if (pathname === "/scrim-lab") {
    return (
      <Suspense fallback={null}>
        <ScrimLab />
      </Suspense>
    );
  }

  if (pathname === "/dkt-dither-lab") {
    return (
      <Suspense fallback={null}>
        <DktDitherLab />
      </Suspense>
    );
  }

  return <ProfilePages onNavigate={handleNavigate} pathname={pathname} />;
}
