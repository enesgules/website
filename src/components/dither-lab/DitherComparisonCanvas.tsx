import { ShaderMount } from "@paper-design/shaders-react";
import { useEffect, useRef, useState } from "react";
import type { PaperShaderElement } from "@paper-design/shaders";
import type { ColorTheme } from "../../theme/useTheme";
import type { DitherVariant } from "../dither/DitherBackdrop";
import {
  getPresetUniforms,
  getSpatialTransitionUniforms,
  getVariantWeights,
  getWeightUniforms,
  type DitherTransition,
  type VariantWeights,
} from "../dither/DitherShader";
import { ditherTransitionFragmentShader } from "../dither/dither-transition-shader";

type DitherComparisonCanvasProps = {
  from: DitherVariant;
  replayKey: number;
  theme: ColorTheme;
  to: DitherVariant;
  transition: DitherTransition;
};

const transitionDuration = 1_050;

function mixWeights(
  from: VariantWeights,
  to: VariantWeights,
  progress: number,
): VariantWeights {
  return [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
    from[2] + (to[2] - from[2]) * progress,
    from[3] + (to[3] - from[3]) * progress,
    from[4] + (to[4] - from[4]) * progress,
  ];
}

function easeInOutCubic(progress: number) {
  if (progress < 0.5) {
    return 4 * progress * progress * progress;
  }

  return 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function DitherComparisonCanvas({
  from,
  replayKey,
  theme,
  to,
  transition,
}: DitherComparisonCanvasProps) {
  const shaderElementRef = useRef<PaperShaderElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [initialUniforms] = useState(() => ({
    ...getPresetUniforms(theme, transition),
    ...getSpatialTransitionUniforms({ progress: 0, target: to }),
    ...getWeightUniforms(getVariantWeights(from)),
  }));
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

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

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const fromWeights = getVariantWeights(from);
    const toWeights = getVariantWeights(to);
    shaderMount.setUniforms({
      ...getSpatialTransitionUniforms({ progress: 0, target: to }),
      ...getWeightUniforms(fromWeights),
    });

    if (reduceMotion) {
      shaderMount.setUniforms({
        ...getSpatialTransitionUniforms({ progress: 1, target: to }),
        ...getWeightUniforms(toWeights),
      });
      animationFrameRef.current = null;
      return;
    }

    const startedAt = performance.now();

    const animate = (now: number) => {
      const elapsed = Math.min((now - startedAt) / transitionDuration, 1);
      const progress = easeInOutCubic(elapsed);
      shaderMount.setUniforms({
        ...getSpatialTransitionUniforms({ progress, target: to }),
        ...getWeightUniforms(mixWeights(fromWeights, toWeights, progress)),
      });

      if (elapsed < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      animationFrameRef.current = null;
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [from, reduceMotion, replayKey, to, transition]);

  return (
    <ShaderMount
      className="dither-lab-canvas__shader"
      fragmentShader={ditherTransitionFragmentShader}
      height="100%"
      maxPixelCount={900_000}
      minPixelRatio={1}
      ref={shaderElementRef}
      speed={reduceMotion ? 0 : 1}
      uniforms={initialUniforms}
      width="100%"
    />
  );
}
