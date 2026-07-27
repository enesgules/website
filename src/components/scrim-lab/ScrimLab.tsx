import { type CSSProperties, useState } from "react";
import {
  WordmarkStage,
  type TextBackdrop,
} from "../WordmarkStage";
import "./scrim-lab.css";

type EvenWashTuning = {
  edgeFade: number;
  height: number;
  strength: number;
  width: number;
};

type EvenWashVariables = CSSProperties & {
  "--even-alpha-0": string;
  "--even-alpha-1": string;
  "--even-alpha-2": string;
  "--even-alpha-3": string;
  "--even-alpha-4": string;
  "--even-height": string;
  "--even-stop-1": string;
  "--even-stop-2": string;
  "--even-stop-3": string;
  "--even-stop-4": string;
  "--even-width": string;
};

const defaultEvenWashTuning = {
  edgeFade: 90,
  height: 72,
  strength: 36,
  width: 100,
} satisfies EvenWashTuning;

const defaultIdleDitherColor = "#87909a";

const tuningControls = [
  {
    key: "strength",
    label: "Strength",
    min: 30,
    max: 80,
    unit: "%",
  },
  {
    key: "width",
    label: "Width",
    min: 80,
    max: 150,
    unit: "%",
  },
  {
    key: "height",
    label: "Height",
    min: 60,
    max: 120,
    unit: "%",
  },
  {
    key: "edgeFade",
    label: "Edge fade",
    min: 40,
    max: 90,
    unit: "%",
  },
] satisfies ReadonlyArray<{
  key: keyof EvenWashTuning;
  label: string;
  min: number;
  max: number;
  unit: string;
}>;

function getEvenWashVariables(
  tuning: EvenWashTuning,
): EvenWashVariables {
  const coreStop = 100 - tuning.edgeFade;
  const stopAt = (progress: number) =>
    `${Math.round(coreStop + tuning.edgeFade * progress)}%`;
  const alphaAt = (multiplier: number) =>
    `${Math.round(tuning.strength * multiplier)}%`;

  return {
    "--even-alpha-0": `${tuning.strength}%`,
    "--even-alpha-1": alphaAt(0.89),
    "--even-alpha-2": alphaAt(0.64),
    "--even-alpha-3": alphaAt(0.32),
    "--even-alpha-4": alphaAt(0.11),
    "--even-height": `${tuning.height}%`,
    "--even-stop-1": `${coreStop}%`,
    "--even-stop-2": stopAt(0.34),
    "--even-stop-3": stopAt(0.59),
    "--even-stop-4": stopAt(0.79),
    "--even-width": `${tuning.width}%`,
  };
}

const backdropOptions = [
  {
    value: "section-haze",
    label: "Previous",
    detail: "The earlier production section halo.",
  },
  {
    value: "section-even",
    label: "Current",
    detail: "A gentler 36%, 100% by 72%, 90% fade production wash.",
  },
  {
    value: "none",
    label: "Raw",
    detail: "No section halo, included as a reference.",
  },
] satisfies {
  value: TextBackdrop;
  label: string;
  detail: string;
}[];

export function ScrimLab() {
  const [backdrop, setBackdrop] =
    useState<TextBackdrop>("section-even");
  const [evenWashTuning, setEvenWashTuning] =
    useState<EvenWashTuning>(defaultEvenWashTuning);
  const [idleDitherColor, setIdleDitherColor] = useState(
    defaultIdleDitherColor,
  );
  const evenWashVariables = getEvenWashVariables(evenWashTuning);

  const updateEvenWashTuning = (
    key: keyof EvenWashTuning,
    value: number,
  ) => {
    setEvenWashTuning((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetTuning = () => {
    setEvenWashTuning(defaultEvenWashTuning);
    setIdleDitherColor(defaultIdleDitherColor);
  };

  return (
    <div className="scrim-lab-page" style={evenWashVariables}>
      <WordmarkStage
        idleDitherColor={idleDitherColor}
        textBackdrop={backdrop}
      />

      <aside className="scrim-lab" aria-label="Text backdrop experiment">
        <div className="scrim-lab__header">
          <div>
            <span>Readability experiment</span>
            <small>Compare halo and dither settings</small>
          </div>
          <a href="/">Close</a>
        </div>

        <div
          className="scrim-lab__options"
          role="radiogroup"
          aria-label="Text backdrop"
        >
          {backdropOptions.map((option) => (
            <button
              aria-checked={backdrop === option.value}
              data-active={backdrop === option.value}
              key={option.value}
              role="radio"
              type="button"
              onClick={() => setBackdrop(option.value)}
            >
              <span>{option.label}</span>
              <small>{option.detail}</small>
            </button>
          ))}
        </div>

        <section
          className="scrim-lab__tuning"
          aria-labelledby="experiment-tuning-title"
        >
          <div className="scrim-lab__tuning-header">
            <span id="experiment-tuning-title">Tune experiment</span>
            <button type="button" onClick={resetTuning}>
              Reset
            </button>
          </div>

          {backdrop === "section-even" ? (
            <div className="scrim-lab__sliders">
              {tuningControls.map((control) => {
                const id = `even-wash-${control.key}`;
                const value = evenWashTuning[control.key];

                return (
                  <label htmlFor={id} key={control.key}>
                    <span>
                      {control.label}
                      <output htmlFor={id}>
                        {value}
                        {control.unit}
                      </output>
                    </span>
                    <input
                      id={id}
                      max={control.max}
                      min={control.min}
                      type="range"
                      value={value}
                      onChange={(event) =>
                        updateEvenWashTuning(
                          control.key,
                          Number(event.target.value),
                        )
                      }
                    />
                  </label>
                );
              })}
            </div>
          ) : null}

          <label className="scrim-lab__color" htmlFor="idle-dither-color">
            <span>
              Dither color
              <output htmlFor="idle-dither-color">
                {idleDitherColor.toUpperCase()}
              </output>
            </span>
            <input
              id="idle-dither-color"
              type="color"
              value={idleDitherColor}
              onChange={(event) => setIdleDitherColor(event.target.value)}
            />
          </label>
        </section>
      </aside>
    </div>
  );
}
