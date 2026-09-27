import { useCallback, useSyncExternalStore } from "react";

export type ColorTheme = "light" | "dark";

const themeStorageKey = "enesgules-theme";

const nextTheme = {
  light: "dark",
  dark: "light",
} satisfies Record<ColorTheme, ColorTheme>;

const themeListeners = new Set<() => void>();

// The inline script in index.html sets data-theme before hydration.
function readTheme(): ColorTheme {
  return document.documentElement.dataset.theme === "dark"
    ? "dark"
    : "light";
}

function readServerTheme(): ColorTheme {
  return "light";
}

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

function writeTheme(theme: ColorTheme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#101411" : "#f6f6f3");
  window.localStorage.setItem(themeStorageKey, theme);

  for (const listener of themeListeners) {
    listener();
  }
}

export function getNextTheme(theme: ColorTheme) {
  return nextTheme[theme];
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    readTheme,
    readServerTheme,
  );

  const cycleTheme = useCallback(() => {
    writeTheme(nextTheme[readTheme()]);
  }, []);

  return {
    cycleTheme,
    theme,
  };
}
