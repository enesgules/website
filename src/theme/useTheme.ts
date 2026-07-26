import { useCallback, useEffect, useState } from "react";

export type ColorTheme = "light" | "dark";

const themeStorageKey = "enesgules-theme";

const nextTheme = {
  light: "dark",
  dark: "light",
} satisfies Record<ColorTheme, ColorTheme>;

function readTheme(): ColorTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey);

  return storedTheme === "dark" ? "dark" : "light";
}

export function getNextTheme(theme: ColorTheme) {
  return nextTheme[theme];
}

export function useTheme() {
  const [theme, setTheme] = useState<ColorTheme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#101411" : "#f6f6f3");
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((current) => nextTheme[current]);
  }, []);

  return {
    cycleTheme,
    theme,
  };
}
