import {
  ComputerIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import type { ThemePreference } from "../theme/useTheme";
import { getNextThemePreference } from "../theme/useTheme";
import { BackgroundAudio } from "./BackgroundAudio";
import { PageControl, PageControlIcon } from "./ui/PageControl";
import { TooltipProvider } from "./ui/Tooltip";

type ThemeToggleProps = {
  theme: ThemePreference;
  onThemeCycle: () => void;
};

function ThemeToggle({ theme, onThemeCycle }: ThemeToggleProps) {
  const nextTheme = getNextThemePreference(theme);
  const actionLabel = `Theme: ${theme}. Switch to ${nextTheme} mode`;

  return (
    <PageControl
      label={actionLabel}
      data-theme-preference={theme}
      onClick={onThemeCycle}
    >
      <PageControlIcon active={theme === "system"} icon={ComputerIcon} />
      <PageControlIcon active={theme === "light"} icon={Sun03Icon} />
      <PageControlIcon active={theme === "dark"} icon={Moon02Icon} />
    </PageControl>
  );
}

type PageControlsProps = {
  theme: ThemePreference;
  onThemeCycle: () => void;
};

export function PageControls({
  theme,
  onThemeCycle,
}: PageControlsProps) {
  return (
    <TooltipProvider>
      <div className="page-controls" role="group" aria-label="Page controls">
        <BackgroundAudio />
        <span className="page-controls__divider" aria-hidden="true" />
        <ThemeToggle theme={theme} onThemeCycle={onThemeCycle} />
      </div>
    </TooltipProvider>
  );
}
