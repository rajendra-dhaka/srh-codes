import { useState } from "react";

export function useThemeMode(defaultTheme = "light", onThemeChange) {
  const [theme, setTheme] = useState(defaultTheme);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      onThemeChange?.(nextTheme);
      return nextTheme;
    });
  };

  return { theme, toggleTheme };
}
