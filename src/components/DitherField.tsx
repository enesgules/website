import { Dithering } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";

export function DitherField() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(preference.matches);

    updatePreference();
    preference.addEventListener("change", updatePreference);

    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  return (
    <div className="dither-field" aria-hidden="true">
      <Dithering
        className="dither-field__shader"
        width="100%"
        height="100%"
        colorBack="#e9e9e4"
        colorFront="#111214"
        shape="warp"
        type="8x8"
        size={2}
        scale={1.15}
        speed={reduceMotion ? 0 : 0.16}
        maxPixelCount={1_500_000}
      />
    </div>
  );
}
