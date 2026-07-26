import {
  DitheringShapes,
  DitheringTypes,
  getShaderColorFromString,
  type DitheringShape,
  type DitheringType,
  type PaperShaderElement,
} from "@paper-design/shaders";
import { ShaderMount } from "@paper-design/shaders-react";
import { useEffect, useRef, useState } from "react";
import type { ColorTheme } from "../../theme/useTheme";
import type { DitherVariant } from "./DitherBackdrop";
import { ditherTransitionFragmentShader } from "./dither-transition-shader";

type DitherPreset = {
  colorFront: Record<ColorTheme, string>;
  mask: [x: number, y: number, radius: number];
  offsetX: number;
  offsetY: number;
  rotation: number;
  scale: number;
  shape: DitheringShape;
  size: number;
  speed: number;
  type: DitheringType;
};

const ditherPresets = {
  idle: {
    colorFront: {
      light: "#49566e",
      dark: "#75839d",
    },
    mask: [0.64, 0.2, 0.92],
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
    mask: [0.72, 0.26, 0.9],
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
    mask: [0.18, 0.46, 0.88],
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
    mask: [0.76, 0.64, 0.96],
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
    mask: [0.32, 0.7, 1.12],
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

function useShaderPreferences() {
  const [preferences, setPreferences] = useState(readShaderPreferences);

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

  return preferences;
}

type DitherShaderProps = {
  theme: ColorTheme;
  variant: DitherVariant;
};

function getGenuineShaderPreset(
  variant: DitherVariant,
  theme: ColorTheme,
) {
  const preset = ditherPresets[variant];

  return {
    color: getShaderColorFromString(preset.colorFront[theme]),
    mask: preset.mask,
    offset: [preset.offsetX, preset.offsetY],
    pxSize: preset.size,
    rotation: preset.rotation,
    scale: preset.scale,
    shape: DitheringShapes[preset.shape],
    speed: preset.speed,
    type: DitheringTypes[preset.type],
  };
}

function getGenuineShaderUniforms({
  from,
  progress,
  theme,
  to,
}: {
  from: DitherVariant;
  progress: number;
  theme: ColorTheme;
  to: DitherVariant;
}) {
  const fromPreset = getGenuineShaderPreset(from, theme);
  const toPreset = getGenuineShaderPreset(to, theme);

  return {
    u_colorBack: getShaderColorFromString(
      theme === "dark" ? "#101411" : "#f6f6f3",
    ),
    u_fromColorFront: fromPreset.color,
    u_fromMask: fromPreset.mask,
    u_fromOffset: fromPreset.offset,
    u_fromPxSize: fromPreset.pxSize,
    u_fromRotation: fromPreset.rotation,
    u_fromScale: fromPreset.scale,
    u_fromShape: fromPreset.shape,
    u_fromSpeed: fromPreset.speed,
    u_fromType: fromPreset.type,
    u_progress: progress,
    u_toColorFront: toPreset.color,
    u_toMask: toPreset.mask,
    u_toOffset: toPreset.offset,
    u_toPxSize: toPreset.pxSize,
    u_toRotation: toPreset.rotation,
    u_toScale: toPreset.scale,
    u_toShape: toPreset.shape,
    u_toSpeed: toPreset.speed,
    u_toType: toPreset.type,
  };
}

const genuineTransitionDuration = 900;

export function DitherShader({
  theme,
  variant,
}: DitherShaderProps) {
  const preferences = useShaderPreferences();
  const shaderElementRef = useRef<PaperShaderElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const animationGenerationRef = useRef(0);
  const fromVariantRef = useRef(variant);
  const toVariantRef = useRef(variant);
  const progressRef = useRef(1);
  const themeRef = useRef(theme);
  const [initialUniforms] = useState(() =>
    getGenuineShaderUniforms({
      from: variant,
      progress: 1,
      theme,
      to: variant,
    }),
  );
  const shouldAnimate =
    !preferences.reduceMotion && !preferences.reduceData;

  themeRef.current = theme;

  useEffect(() => {
    const shaderMount = shaderElementRef.current?.paperShaderMount;

    if (!shaderMount) {
      return;
    }

    shaderMount.setUniforms(
      getGenuineShaderUniforms({
        from: fromVariantRef.current,
        progress: progressRef.current,
        theme,
        to: toVariantRef.current,
      }),
    );
  }, [theme]);

  useEffect(() => {
    const shaderMount = shaderElementRef.current?.paperShaderMount;

    if (!shaderMount) {
      return;
    }

    const animationGeneration = animationGenerationRef.current + 1;
    animationGenerationRef.current = animationGeneration;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const settleOnVariant = () => {
      fromVariantRef.current = variant;
      toVariantRef.current = variant;
      progressRef.current = 1;
      shaderMount.setUniforms(
        getGenuineShaderUniforms({
          from: variant,
          progress: 1,
          theme: themeRef.current,
          to: variant,
        }),
      );
    };

    if (!shouldAnimate) {
      settleOnVariant();
      return;
    }

    let targetProgress = 1;

    if (
      variant === fromVariantRef.current &&
      fromVariantRef.current !== toVariantRef.current
    ) {
      targetProgress = 0;
    } else if (variant !== toVariantRef.current) {
      const visibleVariant =
        progressRef.current < 0.5
          ? fromVariantRef.current
          : toVariantRef.current;
      fromVariantRef.current = visibleVariant;
      toVariantRef.current = variant;
      progressRef.current = 0;
      shaderMount.setUniforms(
        getGenuineShaderUniforms({
          from: visibleVariant,
          progress: 0,
          theme: themeRef.current,
          to: variant,
        }),
      );
    }

    const startingProgress = progressRef.current;
    const progressDistance = targetProgress - startingProgress;

    if (Math.abs(progressDistance) < 0.001) {
      settleOnVariant();
      return;
    }

    const duration = genuineTransitionDuration * Math.abs(progressDistance);
    const startedAt = performance.now();

    const animate = (now: number) => {
      if (animationGeneration !== animationGenerationRef.current) {
        return;
      }

      const elapsed = Math.min((now - startedAt) / duration, 1);
      const progress = startingProgress + progressDistance * elapsed;
      progressRef.current = progress;
      shaderMount.setUniforms({ u_progress: progress });

      if (elapsed < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      animationFrameRef.current = null;
      settleOnVariant();
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationGenerationRef.current === animationGeneration) {
        animationGenerationRef.current += 1;
      }

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [shouldAnimate, variant]);

  return (
    <div
      className="dither-field"
      data-variant={variant}
      aria-hidden="true"
    >
      <ShaderMount
        className="dither-field__shader-transition"
        fragmentShader={ditherTransitionFragmentShader}
        height="100%"
        maxPixelCount={preferences.compactViewport ? 400_000 : 800_000}
        minPixelRatio={1}
        ref={shaderElementRef}
        speed={shouldAnimate ? 1 : 0}
        uniforms={initialUniforms}
        width="100%"
      />
    </div>
  );
}
