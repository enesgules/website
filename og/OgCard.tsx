import { ShaderMount } from "@paper-design/shaders-react";
import { useEffect } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import {
  getEmptyWeights,
  getPresetUniforms,
  getVariantWeights,
  getWeightUniforms,
  type VariantWeights,
} from "../src/components/dither/DitherShader";
import { ditherTransitionFragmentShader } from "../src/components/dither/dither-transition-shader";
import { projects } from "../src/data/projects";

// 1200×630 link preview. Frame 0 is the still og:image, so it shows the idle state.
const ink = "#171816";
const muted = "rgb(23 24 22 / 59%)";
const accents = {
  context7: "#059669",
  hugeicons: "#6fae45",
  distributed: "#4267bd",
  dkt: "#92724c",
  typeet: "#3852ff",
} as const;

// Idle, then each project, then idle again so the video ends where it starts.
const stops = [
  { variant: "idle", name: "Now", description: "Building Context7 and open-source tools.", color: muted },
  ...projects.map((project) => ({
    variant: project.dither,
    name: project.name,
    description: project.description,
    color: accents[project.dither],
  })),
] as const;
const timeline = [...stops, stops[0]];

const holdFrames = 42;
const fadeFrames = 18;
// The extra frame lets the closing fade finish, so the last frame is fully idle like frame 0.
export const ogDurationInFrames = holdFrames * (timeline.length - 1) + fadeFrames + 1;

const ease = { easing: Easing.bezier(0.23, 1, 0.32, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Progress of timeline step `index` coming in and going out, each from 0 to 1.
function stepPhases(frame: number, index: number) {
  const start = index * holdFrames;
  const enter = index === 0 ? 1 : interpolate(frame, [start, start + fadeFrames], [0, 1], ease);
  const exit =
    index === timeline.length - 1
      ? 0
      : interpolate(frame, [start + holdFrames, start + holdFrames + fadeFrames], [0, 1], ease);
  return { enter, exit };
}

// How much of step `index` shows at `frame`, from 0 to 1.
function stepAmount(frame: number, index: number) {
  const { enter, exit } = stepPhases(frame, index);
  return Math.min(enter, 1 - exit);
}

// Where step `index` sits on the caption drum: 1 is below, 0 is in front, -1 is above.
function stepPosition(frame: number, index: number) {
  const { enter, exit } = stepPhases(frame, index);
  return 1 - enter - exit;
}

function getWeights(frame: number): VariantWeights {
  const weights: VariantWeights = getEmptyWeights();

  timeline.forEach((step, index) => {
    getVariantWeights(step.variant).forEach((weight, slot) => {
      weights[slot] += weight * stepAmount(frame, index);
    });
  });

  return weights;
}

// The homepage places each field for a tall page. These masks ([x, y, radius] in screen space)
// and shape offsets frame every field on the right side of the wide card. Order: idle,
// context7, hugeicons, distributed, dkt, typeet. DKT shows two floating cards, which follow its mask.
const homepageUniforms = getPresetUniforms("light", "crossfade", { dktFieldStyle: "card-pair" });
const presetUniforms = {
  ...homepageUniforms,
  // [shape, pixel size, scale, field style]; a smaller globe keeps clear of the name.
  "u_params[0]": homepageUniforms["u_params[0]"].map(([shape, pxSize, scale, fieldStyle], index) => [
    shape,
    pxSize,
    index === 3 ? 0.54 : scale,
    fieldStyle,
  ]),
  "u_masks[0]": [
    [0.8, 0.42, 0.62],
    [0.8, 0.5, 0.6],
    [0.82, 0.5, 0.44],
    [0.84, 0.5, 0.72],
    [0.81, 0.5, 0.75],
    [0.62, 0.5, 1.2],
  ],
  "u_offsets[0]": [
    [0.5, -0.1],
    [0.57, 0],
    [-0.42, 0],
    [0.66, 0],
    [0.57, 0.1],
    [0, 0],
  ],
};

// The dither never repeats, so the last frame cannot match the first by itself. Over the
// opening idle hold, fade from the dither one loop later to the current one: frame 0 then
// shows the frame that comes after the last one, and the video loops without a jump.
const loopBlendFrames = 30;

function Dither({ frame, opacity }: { frame: number; opacity: number }) {
  const { fps } = useVideoConfig();
  const { delayRender, continueRender } = useDelayRender();

  useEffect(() => {
    // The shader paints on the next animation frame; hold the screenshot until it has.
    const handle = delayRender("Painting dither frame");
    requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)));
  }, [continueRender, delayRender, frame]);

  return (
    <ShaderMount
      fragmentShader={ditherTransitionFragmentShader}
      frame={(frame / fps) * 1000}
      height="100%"
      minPixelRatio={1}
      speed={0}
      style={{ inset: 0, opacity, position: "absolute" }}
      uniforms={{ ...presetUniforms, ...getWeightUniforms(getWeights(frame)) }}
      width="100%"
    />
  );
}

export const OgCard: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "#f6f6f3",
        color: ink,
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      {frame < loopBlendFrames && (
        <Dither frame={frame + ogDurationInFrames} opacity={0.72 * (1 - frame / loopBlendFrames)} />
      )}
      <Dither frame={frame} opacity={0.72 * Math.min(frame / loopBlendFrames, 1)} />
      {/* Keeps the text on plain paper while the dither moves on the right. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, #f6f6f3 0%, rgb(246 246 243 / 92%) 40%, rgb(246 246 243 / 0%) 72%)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          inset: 0,
          justifyContent: "space-between",
          padding: "72px 88px",
          position: "absolute",
        }}
      >
        <div style={{ color: muted, fontSize: 26 }}>enesgules.com</div>

        <div>
          <div style={{ fontSize: 76, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1 }}>
            Abdullah Enes Gules
          </div>
          <div style={{ color: muted, fontSize: 40, letterSpacing: "-0.02em", marginTop: 14 }}>
            Software Engineer at Upstash
          </div>
        </div>

        <div style={{ height: 64, perspective: 700, position: "relative", width: 820 }}>
          {stops.map((stop, index) => {
            // The first stop also closes the timeline; use whichever pass is nearer the front.
            const position = [index, ...(index === 0 ? [timeline.length - 1] : [])]
              .map((step) => stepPosition(frame, step))
              .reduce((nearest, next) => (Math.abs(next) < Math.abs(nearest) ? next : nearest));

            return (
              <div
                key={stop.name}
                style={{
                  backfaceVisibility: "hidden",
                  inset: 0,
                  opacity: interpolate(Math.abs(position), [0, 0.75], [1, 0], { extrapolateRight: "clamp" }),
                  position: "absolute",
                  // Turn on a drum 40px behind the caption: the old one rolls up, the new one rolls in from below.
                  transform: `translateZ(-40px) rotateX(${position * -80}deg) translateZ(40px)`,
                }}
              >
                <div style={{ alignItems: "center", display: "flex", fontSize: 26, fontWeight: 500, gap: 12 }}>
                  <span style={{ background: stop.color, borderRadius: 99, height: 12, width: 12 }} />
                  {stop.name}
                </div>
                <div style={{ color: muted, fontSize: 22, marginTop: 6 }}>{stop.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
