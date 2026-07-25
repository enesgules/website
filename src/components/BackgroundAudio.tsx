import {
  HeadphoneMuteIcon,
  HeadphonesIcon,
} from "@hugeicons/core-free-icons";
import { useEffect, useRef, useState } from "react";
import { PageControl, PageControlIcon } from "./ui/PageControl";

type PlaybackState = "paused" | "loading" | "playing" | "error";

type AnimationFrameRef = {
  current: number | null;
};

const fadeInDuration = 480;
const fadeOutDuration = 280;
const audioSource = "/audio/background.mp3";
const audioLabel = "Background music";
const audioVolume = 0.28;

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
    const progress = Math.min(
      Math.max((now - startedAt) / duration, 0),
      1,
    );
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

export function BackgroundAudio() {
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
        target: audioVolume,
      });
    } catch {
      setPlayback("error");
    }
  }

  const actionLabel = isUnavailable
    ? `${audioLabel} unavailable`
    : isPlaying
      ? `Turn ${audioLabel.toLowerCase()} off`
      : `Turn ${audioLabel.toLowerCase()} on`;

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSource}
        loop
        preload="none"
        onError={() => setPlayback("error")}
      />
      <PageControl
        label={actionLabel}
        aria-pressed={isPlaying}
        disabled={playback === "loading" || isUnavailable}
        onClick={togglePlayback}
      >
        <PageControlIcon active={!isPlaying} icon={HeadphoneMuteIcon} />
        <PageControlIcon active={isPlaying} icon={HeadphonesIcon} />
      </PageControl>
    </>
  );
}
