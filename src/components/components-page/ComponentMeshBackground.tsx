import { MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import type { ColorTheme } from "../../theme/useTheme";

type MeshPaletteName = "favicons" | "turkish-icons" | "menu";

type MeshPalette = {
  base: string;
  primary: string;
  secondary: string;
  highlight: string;
};

const meshPalettes: Record<
  ColorTheme,
  Record<MeshPaletteName, MeshPalette>
> = {
  light: {
    favicons: {
      base: "#e8f7ef",
      primary: "#8fd7ba",
      secondary: "#a7dde3",
      highlight: "#fffdf7",
    },
    "turkish-icons": {
      base: "#f8e4e8",
      primary: "#efb3c0",
      secondary: "#d98fa5",
      highlight: "#fff9f6",
    },
    menu: {
      base: "#f6f0e4",
      primary: "#e3c39b",
      secondary: "#c99864",
      highlight: "#fff9ed",
    },
  },
  dark: {
    favicons: {
      base: "#10261e",
      primary: "#146b4b",
      secondary: "#16737b",
      highlight: "#8ae3b9",
    },
    "turkish-icons": {
      base: "#e9c1cb",
      primary: "#d692a3",
      secondary: "#b8647c",
      highlight: "#fff7f8",
    },
    menu: {
      base: "#281f17",
      primary: "#755035",
      secondary: "#a36c43",
      highlight: "#e6c28f",
    },
  },
};

type ComponentMeshBackgroundProps = {
  palette: MeshPaletteName;
  theme: ColorTheme;
};

export function ComponentMeshBackground({
  palette: paletteName,
  theme,
}: ComponentMeshBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();
  const palette = meshPalettes[theme][paletteName];

  return (
    <div className="component-mesh-background" aria-hidden="true">
      <MeshGradient
        className="component-mesh-background__canvas"
        colors={[
          palette.base,
          palette.primary,
          palette.highlight,
          palette.secondary,
        ]}
        distortion={0.78}
        swirl={0.42}
        grainMixer={0}
        grainOverlay={0}
        speed={shouldReduceMotion ? 0 : 0.22}
        minPixelRatio={1}
        maxPixelCount={1_000_000}
        width="100%"
        height="100%"
      />
    </div>
  );
}
