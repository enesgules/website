import { useState } from "react";
import {
  WordmarkStage,
  type TextBackdrop,
} from "../WordmarkStage";
import "./scrim-lab.css";

const backdropOptions = [
  {
    value: "none",
    label: "None",
    detail: "The raw dither stays fully visible.",
  },
  {
    value: "text-halo",
    label: "Text halo",
    detail: "A tight paper-colored glow follows the letters.",
  },
  {
    value: "section-haze",
    label: "Section haze",
    detail: "Small soft patches sit behind each content block.",
  },
  {
    value: "soft-column",
    label: "Soft column",
    detail: "A lighter, narrower version of the old center fade.",
  },
  {
    value: "blurred-veil",
    label: "Blurred veil",
    detail: "A faint blur quiets the dither without hiding it.",
  },
] satisfies {
  value: TextBackdrop;
  label: string;
  detail: string;
}[];

export function ScrimLab() {
  const [backdrop, setBackdrop] = useState<TextBackdrop>("none");

  return (
    <>
      <WordmarkStage textBackdrop={backdrop} />

      <aside className="scrim-lab" aria-label="Text backdrop experiment">
        <div className="scrim-lab__header">
          <div>
            <span>Readability experiment</span>
            <small>Real homepage</small>
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
      </aside>
    </>
  );
}
