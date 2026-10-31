import { Config } from "@remotion/cli/config";

Config.setEntryPoint("og/index.ts");
// The dither backdrop is a WebGL shader.
Config.setChromiumOpenGlRenderer("angle");
Config.setOverwriteOutput(true);
