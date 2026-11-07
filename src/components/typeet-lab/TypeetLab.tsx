import { ShaderMount } from "@paper-design/shaders-react";
import { useState } from "react";
import { useTheme } from "../../theme/useTheme";
import {
  defaultPrismSettings,
  getPresetUniforms,
  getVariantWeights,
  getWeightUniforms,
  type PrismSettings,
} from "../dither/DitherShader";
import { ditherTransitionFragmentShader } from "../dither/dither-transition-shader";
import { PageControls } from "../PageControls";
import { WordmarkContent } from "../WordmarkStage";
import "./typeet-lab.css";

type Knob = {
  key: keyof PrismSettings;
  label: string;
  min: number;
  max: number;
  step: number;
};

const knobGroups: { title: string; knobs: Knob[] }[] = [
  {
    title: "Prism",
    knobs: [
      { key: "prismX", label: "X", min: 0, max: 1, step: 0.01 },
      { key: "prismY", label: "Y", min: 0, max: 1, step: 0.01 },
      { key: "prismSize", label: "Size", min: 0.02, max: 0.3, step: 0.005 },
      { key: "refraction", label: "Refraction", min: 1.05, max: 1.8, step: 0.01 },
      { key: "dispersion", label: "Dispersion", min: 0, max: 0.8, step: 0.01 },
    ],
  },
  {
    title: "Beam",
    knobs: [
      { key: "beamAngle", label: "Angle", min: -45, max: 45, step: 1 },
      { key: "aim", label: "Aim", min: -0.9, max: 0.9, step: 0.05 },
      { key: "beamWidth", label: "Width", min: 0.004, max: 0.12, step: 0.002 },
      { key: "beamSoftness", label: "Soft edge", min: 0, max: 1, step: 0.05 },
      { key: "beamTexture", label: "Texture", min: 0, max: 1, step: 0.05 },
      { key: "brightness", label: "Brightness", min: 0.2, max: 1, step: 0.05 },
    ],
  },
  {
    title: "Rainbow",
    knobs: [
      { key: "fanLength", label: "Length", min: 0.3, max: 3, step: 0.05 },
      { key: "shimmer", label: "Shimmer", min: 0, max: 1, step: 0.05 },
    ],
  },
  {
    title: "Motion",
    knobs: [
      { key: "speed", label: "Speed", min: 0, max: 2, step: 0.05 },
      { key: "sway", label: "Sway", min: 0, max: 20, step: 0.5 },
      { key: "wave", label: "Light wave", min: 0, max: 2, step: 0.05 },
    ],
  },
];

// Tune the Typeet prism over the real homepage, then copy the values into
// defaultPrismSettings.
export function TypeetLab() {
  const { cycleTheme, theme } = useTheme();
  const [settings, setSettings] = useState(defaultPrismSettings);
  const [copied, setCopied] = useState(false);
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const uniforms = {
    ...getPresetUniforms(theme, "crossfade", { prism: settings }),
    ...getWeightUniforms(getVariantWeights("typeet")),
  };

  const copySettings = () => {
    void navigator.clipboard
      .writeText(JSON.stringify(settings, null, 2))
      .then(() => setCopied(true));
  };

  return (
    <main className="profile" data-quiet-dither="true">
      <div className="dither-backdrop" data-variant="typeet">
        <div className="dither-field" data-variant="typeet" aria-hidden="true">
          <ShaderMount
            className="dither-field__shader-transition"
            fragmentShader={ditherTransitionFragmentShader}
            height="100%"
            maxPixelCount={800_000}
            minPixelRatio={1}
            speed={reduceMotion ? 0 : 1}
            uniforms={uniforms}
            width="100%"
          />
        </div>
      </div>

      <PageControls theme={theme} onThemeCycle={cycleTheme} />

      <WordmarkContent onDitherVariantChange={() => {}} />

      <details className="typeet-lab" open>
        <summary>Prism knobs</summary>
        {knobGroups.map((group) => (
          <fieldset key={group.title}>
            <legend>{group.title}</legend>
            {group.knobs.map((knob) => (
              <label key={knob.key}>
                <span>{knob.label}</span>
                <input
                  type="range"
                  min={knob.min}
                  max={knob.max}
                  step={knob.step}
                  value={settings[knob.key]}
                  onChange={(event) => {
                    setCopied(false);
                    setSettings({
                      ...settings,
                      [knob.key]: event.target.valueAsNumber,
                    });
                  }}
                />
                <output>{settings[knob.key]}</output>
              </label>
            ))}
          </fieldset>
        ))}
        <div className="typeet-lab__actions">
          <button type="button" onClick={copySettings}>
            {copied ? "Copied" : "Copy settings"}
          </button>
          <button
            type="button"
            onClick={() => {
              setCopied(false);
              setSettings(defaultPrismSettings);
            }}
          >
            Reset
          </button>
        </div>
      </details>
    </main>
  );
}
