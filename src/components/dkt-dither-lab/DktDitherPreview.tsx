import { ShaderMount } from "@paper-design/shaders-react";
import type { ColorTheme } from "../../theme/useTheme";
import {
  getPresetUniforms,
  getVariantWeights,
  getWeightUniforms,
  type DktFieldStyle,
} from "../dither/DitherShader";
import { ditherTransitionFragmentShader } from "../dither/dither-transition-shader";

type DktDitherPreviewProps = {
  fieldStyle: DktFieldStyle;
  theme: ColorTheme;
};

export function DktDitherPreview({
  fieldStyle,
  theme,
}: DktDitherPreviewProps) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const uniforms = {
    ...getPresetUniforms(theme, "crossfade", {
      dktFieldStyle: fieldStyle,
    }),
    ...getWeightUniforms(getVariantWeights("dkt")),
  };

  return (
    <ShaderMount
      className="dkt-dither-option__shader"
      fragmentShader={ditherTransitionFragmentShader}
      height="100%"
      maxPixelCount={180_000}
      minPixelRatio={1}
      speed={reduceMotion ? 0 : 1}
      uniforms={uniforms}
      width="100%"
    />
  );
}
