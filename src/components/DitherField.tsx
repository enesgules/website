import { Dithering } from "@paper-design/shaders-react";
import { useEffect, useState, type ComponentProps } from "react";

export type DitherVariant =
  | "idle"
  | "context7"
  | "hugeicons"
  | "distributed"
  | "dkt";

type DitherPreset = Pick<
  ComponentProps<typeof Dithering>,
  | "colorFront"
  | "shape"
  | "type"
  | "size"
  | "scale"
  | "speed"
  | "rotation"
  | "offsetX"
  | "offsetY"
>;

const ditherPresets: Record<DitherVariant, DitherPreset> = {
  idle: {
    colorFront: "#49566e",
    shape: "simplex",
    type: "4x4",
    size: 1.65,
    scale: 0.92,
    speed: 0.24,
    rotation: -10,
    offsetX: 0.14,
    offsetY: -0.24,
  },
  context7: {
    colorFront: "#059669",
    shape: "warp",
    type: "4x4",
    size: 2,
    scale: 0.74,
    speed: 0.34,
    rotation: -16,
    offsetX: 0.34,
    offsetY: -0.16,
  },
  hugeicons: {
    colorFront: "#6fae45",
    shape: "dots",
    type: "4x4",
    size: 2.2,
    scale: 1.2,
    speed: 0.55,
    rotation: 12,
    offsetX: -0.42,
    offsetY: 0,
  },
  distributed: {
    colorFront: "#4267bd",
    shape: "sphere",
    type: "8x8",
    size: 1.9,
    scale: 0.68,
    speed: 0.42,
    rotation: 0,
    offsetX: 0.38,
    offsetY: 0.28,
  },
  dkt: {
    colorFront: "#92724c",
    shape: "wave",
    type: "8x8",
    size: 1.75,
    scale: 0.84,
    speed: 0.46,
    rotation: -8,
    offsetX: -0.3,
    offsetY: 0.36,
  },
};

type ShaderPreferences = {
  reduceMotion: boolean;
  reduceData: boolean;
  compactViewport: boolean;
};

const motionQuery = "(prefers-reduced-motion: reduce)";
const dataQuery = "(prefers-reduced-data: reduce)";
const compactQuery = "(max-width: 700px)";

function readShaderPreferences(): ShaderPreferences {
  if (typeof window === "undefined") {
    return {
      reduceMotion: true,
      reduceData: false,
      compactViewport: false,
    };
  }

  return {
    reduceMotion: window.matchMedia(motionQuery).matches,
    reduceData: window.matchMedia(dataQuery).matches,
    compactViewport: window.matchMedia(compactQuery).matches,
  };
}

type DitherFieldProps = {
  variant: DitherVariant;
};

type DitherLayerKey = "a" | "b";

type DitherLayers = {
  a: DitherVariant;
  b: DitherVariant;
  active: DitherLayerKey;
};

type DitherLayerProps = {
  variant: DitherVariant;
  active: boolean;
  shouldAnimate: boolean;
  compactViewport: boolean;
};

function DitherLayer({
  variant,
  active,
  shouldAnimate,
  compactViewport,
}: DitherLayerProps) {
  const preset = ditherPresets[variant];

  return (
    <div
      className="dither-field__layer"
      data-active={active}
      data-animate={active && shouldAnimate}
      data-variant={variant}
    >
      <Dithering
        className="dither-field__shader"
        width="100%"
        height="100%"
        colorBack="#f6f6f3"
        colorFront={preset.colorFront}
        shape={preset.shape}
        type={preset.type}
        size={preset.size}
        scale={preset.scale}
        speed={active && shouldAnimate ? preset.speed : 0}
        rotation={preset.rotation}
        offsetX={preset.offsetX}
        offsetY={preset.offsetY}
        minPixelRatio={1}
        maxPixelCount={compactViewport ? 650_000 : 1_200_000}
      />
    </div>
  );
}

export function DitherField({ variant }: DitherFieldProps) {
  const [preferences, setPreferences] = useState(readShaderPreferences);
  const [layers, setLayers] = useState<DitherLayers>({
    a: variant,
    b: variant,
    active: "a",
  });

  useEffect(() => {
    const queries = [
      window.matchMedia(motionQuery),
      window.matchMedia(dataQuery),
      window.matchMedia(compactQuery),
    ];
    const updatePreferences = () =>
      setPreferences(readShaderPreferences());

    for (const query of queries) {
      query.addEventListener("change", updatePreferences);
    }

    return () => {
      for (const query of queries) {
        query.removeEventListener("change", updatePreferences);
      }
    };
  }, []);

  useEffect(() => {
    setLayers((current) => {
      if (current[current.active] === variant) {
        return current;
      }

      if (current.active === "a") {
        return {
          a: current.a,
          b: variant,
          active: "b",
        };
      }

      return {
        a: variant,
        b: current.b,
        active: "a",
      };
    });
  }, [variant]);

  const shouldAnimate =
    !preferences.reduceMotion && !preferences.reduceData;

  return (
    <div className="dither-field" data-variant={variant} aria-hidden="true">
      <DitherLayer
        variant={layers.a}
        active={layers.active === "a"}
        shouldAnimate={shouldAnimate}
        compactViewport={preferences.compactViewport}
      />
      <DitherLayer
        variant={layers.b}
        active={layers.active === "b"}
        shouldAnimate={shouldAnimate}
        compactViewport={preferences.compactViewport}
      />
    </div>
  );
}
