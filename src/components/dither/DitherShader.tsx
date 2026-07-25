import { Dithering } from "@paper-design/shaders-react";
import {
  useEffect,
  useLayoutEffect,
  useState,
  type ComponentProps,
} from "react";
import type { ColorTheme } from "../../theme/useTheme";
import type { DitherVariant } from "./DitherBackdrop";

type DitherPreset = Omit<
  Pick<
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
  >,
  "colorFront"
> & {
  colorFront: Record<ColorTheme, string>;
};

const ditherPresets = {
  idle: {
    colorFront: {
      light: "#49566e",
      dark: "#75839d",
    },
    shape: "simplex",
    type: "4x4",
    size: 1.65,
    scale: 0.92,
    speed: 0.46,
    rotation: -10,
    offsetX: 0.14,
    offsetY: -0.24,
  },
  context7: {
    colorFront: {
      light: "#059669",
      dark: "#20b88a",
    },
    shape: "ripple",
    type: "2x2",
    size: 1.7,
    scale: 0.9,
    speed: 0.42,
    rotation: 0,
    offsetX: 0.3,
    offsetY: -0.24,
  },
  hugeicons: {
    colorFront: {
      light: "#6fae45",
      dark: "#8acb5a",
    },
    shape: "dots",
    type: "4x4",
    size: 2.2,
    scale: 1.2,
    speed: 0.8,
    rotation: 12,
    offsetX: -0.42,
    offsetY: 0,
  },
  distributed: {
    colorFront: {
      light: "#4267bd",
      dark: "#6482c7",
    },
    shape: "sphere",
    type: "8x8",
    size: 1.9,
    scale: 0.94,
    speed: 0.63,
    rotation: 0,
    offsetX: 0.38,
    offsetY: 0.28,
  },
  dkt: {
    colorFront: {
      light: "#92724c",
      dark: "#b9956c",
    },
    shape: "wave",
    type: "8x8",
    size: 1.75,
    scale: 0.84,
    speed: 0.69,
    rotation: -8,
    offsetX: -0.3,
    offsetY: 0.36,
  },
} satisfies Record<DitherVariant, DitherPreset>;

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

type DitherShaderProps = {
  theme: ColorTheme;
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
  theme: ColorTheme;
};

function DitherLayer({
  variant,
  active,
  shouldAnimate,
  compactViewport,
  theme,
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
        colorBack={theme === "dark" ? "#101411" : "#f6f6f3"}
        colorFront={preset.colorFront[theme]}
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

export function DitherShader({ theme, variant }: DitherShaderProps) {
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

  useLayoutEffect(() => {
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
        theme={theme}
      />
      <DitherLayer
        variant={layers.b}
        active={layers.active === "b"}
        shouldAnimate={shouldAnimate}
        compactViewport={preferences.compactViewport}
        theme={theme}
      />
    </div>
  );
}
