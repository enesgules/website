import { lazy, Suspense } from "react";
import { WordmarkStage } from "./components/WordmarkStage";

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

export function App() {
  if (window.location.pathname === "/dither-lab") {
    return (
      <Suspense fallback={null}>
        <DitherLab />
      </Suspense>
    );
  }

  if (window.location.pathname === "/scrim-lab") {
    return (
      <Suspense fallback={null}>
        <ScrimLab />
      </Suspense>
    );
  }

  return <WordmarkStage />;
}
