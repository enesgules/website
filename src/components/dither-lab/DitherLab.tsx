import { useState } from "react";
import { useTheme } from "../../theme/useTheme";
import type { DitherVariant } from "../dither/DitherBackdrop";
import type { DitherTransition } from "../dither/DitherShader";
import { DitherComparisonCanvas } from "./DitherComparisonCanvas";
import "./dither-lab.css";

const variants = [
  { label: "Idle", value: "idle" },
  { label: "Context7", value: "context7" },
  { label: "Hugeicons", value: "hugeicons" },
  { label: "Distributed", value: "distributed" },
  { label: "DKT", value: "dkt" },
] satisfies { label: string; value: DitherVariant }[];

const transitionGroups = [
  {
    label: "Crossfades",
    options: [
      {
        value: "crossfade",
        label: "Clean",
        detail: "One field fades down as the other fades up.",
      },
      {
        value: "crossfade-swell",
        label: "Double exposure",
        detail: "Both fields hold near-full density through the midpoint.",
      },
      {
        value: "crossfade-interference",
        label: "Interference",
        detail: "Overlapping dots cancel and carve holes in each other.",
      },
      {
        value: "crossfade-chromatic",
        label: "Chromatic split",
        detail: "The outgoing and incoming fields split red and cyan.",
      },
      {
        value: "crossfade-orbit",
        label: "Orbit split",
        detail: "The fields drift apart, cross, and lock back into place.",
      },
    ],
  },
  {
    label: "Other transitions",
    options: [
      {
        value: "morph",
        label: "Morph",
        detail: "Shape, color, and position merge continuously.",
      },
      {
        value: "scatter",
        label: "Pixel scatter",
        detail: "Cells switch independently in a controlled random order.",
      },
      {
        value: "radial",
        label: "Radial bloom",
        detail: "The next field expands outward from its own focal point.",
      },
      {
        value: "sweep",
        label: "Diagonal sweep",
        detail: "A textured diagonal edge carries the next field across.",
      },
      {
        value: "vortex",
        label: "Vortex rip",
        detail: "A corkscrew seam tears the next field into view.",
      },
      {
        value: "signal-tear",
        label: "Signal tear",
        detail: "Broken scanlines jump ahead, stall, and briefly invert.",
      },
      {
        value: "noise-flood",
        label: "Noise flood",
        detail: "Organic islands erupt and merge until the field takes over.",
      },
    ],
  },
] satisfies {
  label: string;
  options: {
    value: DitherTransition;
    label: string;
    detail: string;
  }[];
}[];

function isDitherVariant(value: string): value is DitherVariant {
  return variants.some((variant) => variant.value === value);
}

export function DitherLab() {
  const { cycleTheme, theme } = useTheme();
  const [from, setFrom] = useState<DitherVariant>("hugeicons");
  const [to, setTo] = useState<DitherVariant>("distributed");
  const [transition, setTransition] =
    useState<DitherTransition>("crossfade");
  const [replayKey, setReplayKey] = useState(0);

  const replay = () => setReplayKey((current) => current + 1);

  return (
    <main className="dither-lab">
      <header className="dither-lab__header">
        <a className="dither-lab__back" href="/">
          Back to site
        </a>
        <button
          className="dither-lab__theme"
          type="button"
          onClick={cycleTheme}
        >
          {theme === "light" ? "Dark" : "Light"} theme
        </button>
      </header>

      <section className="dither-lab__intro" aria-labelledby="lab-title">
        <p className="dither-lab__eyebrow">Dither transition lab</p>
        <h1 id="lab-title">One canvas. Five crossfades.</h1>
        <p>
          The presets and timing stay fixed. Pick a transition, then replay the
          same pair.
        </p>
      </section>

      <section className="dither-lab__bench" aria-label="Transition preview">
        <div className="dither-lab-canvas">
          <DitherComparisonCanvas
            from={from}
            replayKey={replayKey}
            theme={theme}
            to={to}
            transition={transition}
          />
          <div className="dither-lab-canvas__meta" aria-hidden="true">
            <span>{from}</span>
            <span>to</span>
            <span>{to}</span>
          </div>
          <span className="dither-lab-canvas__count">1 WebGL canvas</span>
        </div>

        <div className="dither-lab__controls">
          <div className="dither-lab__pair">
            <label>
              <span>From</span>
              <select
                value={from}
                onChange={(event) => {
                  if (isDitherVariant(event.target.value)) {
                    setFrom(event.target.value);
                  }
                }}
              >
                {variants.map((variant) => (
                  <option key={variant.value} value={variant.value}>
                    {variant.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>To</span>
              <select
                value={to}
                onChange={(event) => {
                  if (isDitherVariant(event.target.value)) {
                    setTo(event.target.value);
                  }
                }}
              >
                {variants.map((variant) => (
                  <option key={variant.value} value={variant.value}>
                    {variant.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            className="dither-lab__modes"
            role="radiogroup"
            aria-label="Transition style"
          >
            {transitionGroups.map((group) => (
              <div className="dither-lab__mode-group" key={group.label}>
                <p>{group.label}</p>
                {group.options.map((option) => (
                  <button
                    aria-checked={transition === option.value}
                    className="dither-lab__mode"
                    data-active={transition === option.value}
                    key={option.value}
                    role="radio"
                    type="button"
                    onClick={() => {
                      setTransition(option.value);
                      replay();
                    }}
                  >
                    <span>{option.label}</span>
                    <small>{option.detail}</small>
                  </button>
                ))}
              </div>
            ))}
          </div>

          <button className="dither-lab__replay" type="button" onClick={replay}>
            Replay transition
          </button>
        </div>
      </section>
    </main>
  );
}
