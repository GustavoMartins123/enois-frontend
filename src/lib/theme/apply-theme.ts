import { texts } from "@/texts";
import type { Theme } from "@/types/preferences/theme";
import type { ThemeSettings } from "@/types/preferences/theme-settings";

import { buildThemeColor, buildThemeCss, isDefaultThemeSettings } from "./build-theme-tokens";

export const THEME_STYLE_ELEMENT_ID = "app-theme";

/**
 * Chave onde o CSS já resolvido fica guardado.
 *
 * O script que roda antes do primeiro paint só injeta este texto — assim ele não
 * precisa repetir a matemática de cor e não existe flash de tema ao carregar.
 */
export const THEME_CSS_STORAGE_KEY = "connect-grow-theme-css";

/** Aplica o tema escolhido; no padrão, remove a sobrescrita e volta ao CSS da marca. */
export function applyThemeSettings(settings: ThemeSettings, mode: Theme): void {
  if (typeof document === "undefined") return;

  const existing = document.getElementById(THEME_STYLE_ELEMENT_ID);

  if (isDefaultThemeSettings(settings)) {
    existing?.remove();
    localStorage.removeItem(THEME_CSS_STORAGE_KEY);
    updateThemeColorElement(undefined);
    return;
  }

  const css = buildThemeCss(settings, mode);
  const style = (existing as HTMLStyleElement | null) ?? document.createElement("style");
  style.id = THEME_STYLE_ELEMENT_ID;
  style.textContent = css;
  if (!existing) document.head.appendChild(style);

  localStorage.setItem(THEME_CSS_STORAGE_KEY, css);
  updateThemeColorElement(buildThemeColor(settings, mode));
}

function updateThemeColorElement(color: string | undefined): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  meta.setAttribute("content", color ?? texts.pwa.themeColor);
}
