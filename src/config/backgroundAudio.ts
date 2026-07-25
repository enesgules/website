export type BackgroundAudioConfig = {
  enabled: boolean;
  src: string;
  label: string;
  volume: number;
};

export const backgroundAudioConfig = {
  enabled: false,
  src: "/audio/background.mp3",
  label: "Background music",
  volume: 0.28,
} satisfies BackgroundAudioConfig;
