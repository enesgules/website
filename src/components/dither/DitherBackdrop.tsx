import {
  type CSSProperties,
  lazy,
  Suspense,
  useSyncExternalStore,
} from "react";
import type { ColorTheme } from "../../theme/useTheme";
import "./dither.css";

export type DitherVariant =
  | "idle"
  | "context7"
  | "hugeicons"
  | "distributed"
  | "dkt";

type DitherBackdropProps = {
  idleColor?: string;
  theme: ColorTheme;
  variant: DitherVariant;
};

type DitherFallbackStyle = CSSProperties & {
  "--dither-idle-color"?: string;
};

const DitherShader = lazy(() =>
  import("./DitherShader").then((module) => ({
    default: module.DitherShader,
  })),
);

let webGlSupport: boolean | undefined;

function canUseWebGl() {
  if (webGlSupport !== undefined) {
    return webGlSupport;
  }

  const canvas = document.createElement("canvas");
  const context =
    canvas.getContext("webgl2") ?? canvas.getContext("webgl");

  context?.getExtension("WEBGL_lose_context")?.loseContext();

  webGlSupport = context !== null;
  return webGlSupport;
}

function subscribeToWebGlSupport() {
  return () => {};
}

function readServerWebGlSupport() {
  return false;
}

function DitherFallback({
  idleColor,
  variant,
}: Pick<DitherBackdropProps, "idleColor" | "variant">) {
  const style: DitherFallbackStyle = {
    "--dither-idle-color": variant === "idle" ? idleColor : undefined,
  };

  return (
    <div
      className="dither-field dither-field--fallback"
      data-variant={variant}
      style={style}
      aria-hidden="true"
    />
  );
}

export function DitherBackdrop({
  idleColor,
  theme,
  variant,
}: DitherBackdropProps) {
  // Prerendered HTML has the fallback; the shader replaces it after hydration.
  const canRenderShader = useSyncExternalStore(
    subscribeToWebGlSupport,
    canUseWebGl,
    readServerWebGlSupport,
  );

  return (
    <div
      className="dither-backdrop"
      data-variant={variant}
    >
      <Suspense
        fallback={
          <DitherFallback idleColor={idleColor} variant={variant} />
        }
      >
        {canRenderShader ? (
          <DitherShader
            idleColor={idleColor}
            theme={theme}
            transition="crossfade"
            variant={variant}
          />
        ) : (
          <DitherFallback idleColor={idleColor} variant={variant} />
        )}
      </Suspense>
    </div>
  );
}
