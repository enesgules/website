import { Composition } from "remotion";
import { OgCard, ogDurationInFrames } from "./OgCard";

export const OgRoot: React.FC = () => (
  <Composition
    id="OgCard"
    component={OgCard}
    durationInFrames={ogDurationInFrames}
    fps={30}
    width={1200}
    height={630}
  />
);
