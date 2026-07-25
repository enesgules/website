import { useEffect, useRef, useState } from "react";
import type { BackgroundAudioConfig } from "../config/backgroundAudio";

type BackgroundAudioProps = BackgroundAudioConfig;

type PlaybackState = "paused" | "loading" | "playing" | "error";

type AnimationFrameRef = {
  current: number | null;
};

const fadeInDuration = 480;
const fadeOutDuration = 280;

function cancelFade(frameRef: AnimationFrameRef) {
  if (frameRef.current === null) {
    return;
  }

  cancelAnimationFrame(frameRef.current);
  frameRef.current = null;
}

function fadeVolume({
  audio,
  duration,
  frameRef,
  onComplete,
  target,
}: {
  audio: HTMLAudioElement;
  duration: number;
  frameRef: AnimationFrameRef;
  onComplete?: () => void;
  target: number;
}) {
  cancelFade(frameRef);

  const initialVolume = audio.volume;
  const startedAt = performance.now();

  function updateVolume(now: number) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    audio.volume =
      initialVolume + (target - initialVolume) * easedProgress;

    if (progress < 1) {
      frameRef.current = requestAnimationFrame(updateVolume);
      return;
    }

    frameRef.current = null;
    onComplete?.();
  }

  frameRef.current = requestAnimationFrame(updateVolume);
}

export function BackgroundAudio({
  enabled,
  label,
  src,
  volume,
}: BackgroundAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const [playback, setPlayback] =
    useState<PlaybackState>("paused");

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      cancelFade(fadeFrameRef);
      audio?.pause();
    };
  }, []);

  if (!enabled) {
    return null;
  }

  const isPlaying = playback === "playing";
  const isUnavailable = playback === "error";

  async function togglePlayback() {
    const audio = audioRef.current;

    if (!audio || playback === "loading" || isUnavailable) {
      return;
    }

    if (isPlaying) {
      setPlayback("paused");
      fadeVolume({
        audio,
        duration: fadeOutDuration,
        frameRef: fadeFrameRef,
        target: 0,
        onComplete: () => audio.pause(),
      });
      return;
    }

    cancelFade(fadeFrameRef);
    audio.volume = 0;
    setPlayback("loading");

    try {
      await audio.play();
      setPlayback("playing");
      fadeVolume({
        audio,
        duration: fadeInDuration,
        frameRef: fadeFrameRef,
        target: volume,
      });
    } catch {
      setPlayback("error");
    }
  }

  const actionLabel = isUnavailable
    ? `${label} unavailable`
    : isPlaying
      ? `Pause ${label.toLowerCase()}`
      : `Play ${label.toLowerCase()}`;

  return (
    <div className="background-audio">
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="none"
        onError={() => setPlayback("error")}
      />
      <button
        className="background-audio__toggle"
        type="button"
        aria-label={actionLabel}
        aria-pressed={isPlaying}
        data-playing={isPlaying}
        disabled={playback === "loading" || isUnavailable}
        onClick={togglePlayback}
      >
        <span>{isUnavailable ? "Music unavailable" : "Music"}</span>
        <span className="background-audio__meter" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
    </div>
  );
}
