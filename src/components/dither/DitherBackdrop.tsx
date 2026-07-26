import { lazy, Suspense, useState } from "react";
import type { ColorTheme } from "../../theme/useTheme";
import "./dither.css";

export type DitherVariant =
  | "idle"
  | "context7"
  | "hugeicons"
  | "distributed"
  | "dkt";

type DitherBackdropProps = {
  theme: ColorTheme;
  variant: DitherVariant;
};

const DitherShader = lazy(() =>
  import("./DitherShader").then((module) => ({
    default: module.DitherShader,
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

function DitherFallback({ variant }: Pick<DitherBackdropProps, "variant">) {
  return (
    <div
      className="dither-field dither-field--fallback"
      data-variant={variant}
      aria-hidden="true"
    />
  );
}

export function DitherBackdrop({
  theme,
  variant,
}: DitherBackdropProps) {
  const [canRenderShader] = useState(canUseWebGl);

  return (
    <div
      className="dither-backdrop"
      data-variant={variant}
    >
      <Suspense
        fallback={
          <DitherFallback variant={variant} />
        }
      >
        {canRenderShader ? (
          <DitherShader
            theme={theme}
            variant={variant}
          />
        ) : (
          <DitherFallback variant={variant} />
        )}
      </Suspense>
    </div>
  );
}
