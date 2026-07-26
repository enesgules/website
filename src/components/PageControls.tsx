import {
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import type { ColorTheme } from "../theme/useTheme";
import { BackgroundAudio } from "./BackgroundAudio";
import { PageControl, PageControlIcon } from "./ui/PageControl";
import { TooltipProvider } from "./ui/Tooltip";

type ThemeToggleProps = {
  theme: ColorTheme;
  onThemeCycle: () => void;
};

function ThemeToggle({ theme, onThemeCycle }: ThemeToggleProps) {
  return (
    <PageControl
      label="Switch theme"
      data-theme={theme}
      onClick={onThemeCycle}
    >
      <PageControlIcon active={theme === "light"} icon={Sun03Icon} />
      <PageControlIcon active={theme === "dark"} icon={Moon02Icon} />
    </PageControl>
  );
}

type PageControlsProps = {
  theme: ColorTheme;
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
