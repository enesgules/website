import { useTheme } from "../../theme/useTheme";
import type { DktFieldStyle } from "../dither/DitherShader";
import { DktDitherPreview } from "./DktDitherPreview";
import "./dkt-dither-lab.css";

const options = [
  {
    detail: "The current wave, included as the baseline.",
    fieldStyle: "wave",
    label: "Current wave",
  },
  {
    detail: "One rounded field floats and turns through a short range.",
    fieldStyle: "single-card",
    label: "Slow float",
  },
  {
    detail: "Two rounded fields drift independently and pass through each other.",
    fieldStyle: "offset-pair",
    label: "Drifting pair",
  },
  {
    detail: "Three rounded fields move separately with open space between them.",
    fieldStyle: "card-cluster",
    label: "Loose trio",
  },
] satisfies {
  detail: string;
  fieldStyle: DktFieldStyle;
  label: string;
}[];

export function DktDitherLab() {
  const { cycleTheme, theme } = useTheme();

  return (
    <main className="dkt-dither-lab">
      <header className="dkt-dither-lab__header">
        <a href="/">Back to site</a>
        <button type="button" onClick={cycleTheme}>
          {theme === "light" ? "Dark" : "Light"} theme
        </button>
      </header>

      <section className="dkt-dither-lab__intro" aria-labelledby="dkt-lab-title">
        <p>DKT Materyal dither study</p>
        <h1 id="dkt-lab-title">Same pixels. Moving blocks.</h1>
        <span>
          The grain stays untouched. The rounded fields move underneath it.
        </span>
      </section>

      <section className="dkt-dither-lab__grid" aria-label="Dither alternatives">
        {options.map((option, index) => (
          <article
            className="dkt-dither-option"
            data-recommended={index === 3}
            key={option.fieldStyle}
          >
            <div className="dkt-dither-option__canvas" aria-hidden="true">
              <DktDitherPreview
                fieldStyle={option.fieldStyle}
                theme={theme}
              />
            </div>
            <div className="dkt-dither-option__copy">
              <p>{String(index + 1).padStart(2, "0")}</p>
              <div>
                <h2>{option.label}</h2>
                <span>{option.detail}</span>
              </div>
              {index === 3 ? <small>My pick</small> : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
