import { useCallback, useEffect, useState } from "react";

export type ColorTheme = "light" | "dark";
export type ThemePreference = "system" | ColorTheme;

const themeStorageKey = "enesgules-theme";
const colorSchemeQuery = "(prefers-color-scheme: dark)";

const nextThemePreference = {
  system: "light",
  light: "dark",
  dark: "system",
} satisfies Record<ThemePreference, ThemePreference>;

function readSystemTheme(): ColorTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia(colorSchemeQuery).matches ? "dark" : "light";
}

function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey);

  if (
    storedTheme === "system" ||
    storedTheme === "light" ||
    storedTheme === "dark"
  ) {
    return storedTheme;
  }

  return "system";
}

export function getNextThemePreference(theme: ThemePreference) {
  return nextThemePreference[theme];
}

export function useTheme() {
  const [preference, setPreference] =
    useState<ThemePreference>(readThemePreference);
  const [systemTheme, setSystemTheme] = useState<ColorTheme>(readSystemTheme);
  const resolvedTheme = preference === "system" ? systemTheme : preference;

  useEffect(() => {
    const mediaQuery = window.matchMedia(colorSchemeQuery);

    function updateSystemTheme(event: MediaQueryListEvent) {
      setSystemTheme(event.matches ? "dark" : "light");
    }

    setSystemTheme(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", updateSystemTheme);

    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, preference);
  }, [preference]);

  const cycleTheme = useCallback(() => {
    setPreference((current) => nextThemePreference[current]);
  }, []);

  return {
    cycleTheme,
    preference,
    resolvedTheme,
  };
}
