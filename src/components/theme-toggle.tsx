import { useEffect, useState } from "react";

import { Monitor, Moon, Sun } from "lucide-react";

import { texts } from "@/texts";

type Theme = "light" | "dark" | "system";

const storageKey = "connect-grow-theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) as Theme | null;
    const initial = stored ?? "system";
    setTheme(initial);
    applyTheme(initial);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => {
      if ((window.localStorage.getItem(storageKey) as Theme | null) === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", syncSystem);
    return () => media.removeEventListener("change", syncSystem);
  }, []);

  const cycleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    window.localStorage.setItem(storageKey, next);
    applyTheme(next);
  };

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const label =
    theme === "light" ? texts.theme.light : theme === "dark" ? texts.theme.dark : texts.theme.system;

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="grid h-10 w-10 place-items-center rounded-full text-text-subtle transition hover:bg-surface-2 hover:text-primary"
      aria-label={label}
      title={label}
    >
      <Icon className="h-5 w-5 transition-transform duration-300 ease-out" />
    </button>
  );
}
