import {
  DitheringShapes,
  getShaderColorFromString,
  type DitheringShape,
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
};

export type DitherTransition =
  | "morph"
  | "crossfade"
  | "scatter"
  | "radial"
  | "sweep"
  | "vortex"
  | "signal-tear"
  | "noise-flood"
  | "crossfade-swell"
  | "crossfade-interference"
  | "crossfade-chromatic"
  | "crossfade-orbit";

const ditherTransitionValues = {
  morph: 0,
  crossfade: 1,
  scatter: 2,
  radial: 3,
  sweep: 4,
  vortex: 5,
  "signal-tear": 6,
  "noise-flood": 7,
  "crossfade-swell": 8,
  "crossfade-interference": 9,
  "crossfade-chromatic": 10,
  "crossfade-orbit": 11,
} satisfies Record<DitherTransition, number>;

const ditherPresets = {
  idle: {
    colorFront: {
      light: "#49566e",
      dark: "#75839d",
    },
    mask: [0.64, 0.2, 0.92],
    shape: "simplex",
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
    size: 1.7,
    scale: 0.9,
    speed: 0.24,
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
    size: 2.2,
    scale: 1.2,
    speed: 0.42,
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
  transition?: DitherTransition;
  variant: DitherVariant;
};

const ditherVariants = [
  "idle",
  "context7",
  "hugeicons",
  "distributed",
  "dkt",
] satisfies DitherVariant[];

export type VariantWeights = [number, number, number, number, number];

function getShaderPreset(
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
  };
}

export function getVariantWeights(
  variant: DitherVariant,
): VariantWeights {
  return [
    variant === "idle" ? 1 : 0,
    variant === "context7" ? 1 : 0,
    variant === "hugeicons" ? 1 : 0,
    variant === "distributed" ? 1 : 0,
    variant === "dkt" ? 1 : 0,
  ];
}

function getEmptyWeights(): VariantWeights {
  return [0, 0, 0, 0, 0];
}

export function getWeightUniforms(weights: VariantWeights) {
  return {
    u_weights: weights.slice(0, 4),
    u_dktWeight: weights[4],
  };
}

export function getSpatialTransitionUniforms({
  progress,
  target,
}: {
  progress: number;
  target: DitherVariant;
}) {
  const targetPreset = ditherPresets[target];

  return {
    u_targetIndex: ditherVariants.indexOf(target),
    u_transitionOrigin: targetPreset.mask.slice(0, 2),
    u_transitionProgress: progress,
  };
}

export function getPresetUniforms(
  theme: ColorTheme,
  transition: DitherTransition,
) {
  const presets = ditherVariants.map((variant) =>
    getShaderPreset(variant, theme),
  );

  return {
    u_colorBack: getShaderColorFromString(
      theme === "dark" ? "#101411" : "#f6f6f3",
    ),
    u_transitionStyle: ditherTransitionValues[transition],
    ...getSpatialTransitionUniforms({ progress: 1, target: "idle" }),
    "u_colorFronts[0]": presets.map((preset) => preset.color),
    "u_masks[0]": presets.map((preset) => preset.mask),
    "u_motion[0]": presets.map((preset) => [
      preset.rotation,
      preset.speed,
    ]),
    "u_offsets[0]": presets.map((preset) => preset.offset),
    "u_params[0]": presets.map((preset) => [
      preset.shape,
      preset.pxSize,
      preset.scale,
      0,
    ]),
  };
}

const transitionAngularFrequency = 9;
const maximumFrameDelta = 1 / 30;
const springPositionTolerance = 0.0005;
const springVelocityTolerance = 0.005;

export function DitherShader({
  theme,
  transition = "crossfade",
  variant,
}: DitherShaderProps) {
  const preferences = useShaderPreferences();
  const shaderElementRef = useRef<PaperShaderElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameTimeRef = useRef<number | null>(null);
  const weightsRef = useRef<VariantWeights>(getVariantWeights(variant));
  const velocitiesRef = useRef<VariantWeights>(getEmptyWeights());
  const targetWeightsRef = useRef<VariantWeights>(
    getVariantWeights(variant),
  );
  const [initialUniforms] = useState(() => ({
    ...getPresetUniforms(theme, transition),
    ...getWeightUniforms(getVariantWeights(variant)),
  }));
  const shouldAnimate =
    !preferences.reduceMotion && !preferences.reduceData;

  useEffect(() => {
    const shaderMount = shaderElementRef.current?.paperShaderMount;

    if (!shaderMount) {
      return;
    }

    shaderMount.setUniforms(getPresetUniforms(theme, transition));
  }, [theme, transition]);

  useEffect(() => {
    const shaderMount = shaderElementRef.current?.paperShaderMount;

    if (!shaderMount) {
      return;
    }

    const targetWeights = getVariantWeights(variant);
    targetWeightsRef.current = targetWeights;

    if (!shouldAnimate) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      frameTimeRef.current = null;
      weightsRef.current = targetWeights;
      velocitiesRef.current = getEmptyWeights();
      shaderMount.setUniforms(getWeightUniforms(targetWeights));
      return;
    }

    if (animationFrameRef.current !== null) {
      return;
    }

    const animate = (now: number) => {
      const previousFrameTime = frameTimeRef.current ?? now;
      const delta = Math.min(
        Math.max((now - previousFrameTime) / 1000, 0),
        maximumFrameDelta,
      );
      frameTimeRef.current = now;

      const nextWeights = getEmptyWeights();
      const nextVelocities = getEmptyWeights();
      let maximumDistance = 0;
      let maximumVelocity = 0;

      for (let index = 0; index < nextWeights.length; index += 1) {
        const target = targetWeightsRef.current[index];
        const displacement = weightsRef.current[index] - target;
        const velocity = velocitiesRef.current[index];
        const decay = Math.exp(-transitionAngularFrequency * delta);
        const springTerm =
          velocity + transitionAngularFrequency * displacement;
        const nextDisplacement =
          (displacement + springTerm * delta) * decay;
        const nextVelocity =
          (velocity -
            transitionAngularFrequency * springTerm * delta) *
          decay;

        nextWeights[index] = target + nextDisplacement;
        nextVelocities[index] = nextVelocity;
        maximumDistance = Math.max(
          maximumDistance,
          Math.abs(nextDisplacement),
        );
        maximumVelocity = Math.max(
          maximumVelocity,
          Math.abs(nextVelocity),
        );
      }

      if (
        maximumDistance <= springPositionTolerance &&
        maximumVelocity <= springVelocityTolerance
      ) {
        weightsRef.current = targetWeightsRef.current;
        velocitiesRef.current = getEmptyWeights();
        frameTimeRef.current = null;
        animationFrameRef.current = null;
        shaderMount.setUniforms(
          getWeightUniforms(targetWeightsRef.current),
        );
        return;
      }

      weightsRef.current = nextWeights;
      velocitiesRef.current = nextVelocities;
      shaderMount.setUniforms(getWeightUniforms(nextWeights));
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    frameTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [shouldAnimate, variant]);

  useEffect(
    () => () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    },
    [],
  );

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
