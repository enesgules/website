import { Dithering } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";

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

export function DitherField() {
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

  const shouldAnimate =
    !preferences.reduceMotion && !preferences.reduceData;

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
        speed={shouldAnimate ? 0.14 : 0}
        minPixelRatio={1}
        maxPixelCount={
          preferences.compactViewport ? 650_000 : 1_200_000
        }
      />
    </div>
  );
}
