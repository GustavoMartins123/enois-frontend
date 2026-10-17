import { texts } from "@/texts";
import type { Theme } from "@/types/preferences/theme";
import type { ThemeSettings } from "@/types/preferences/theme-settings";

import { buildCollectionCss, resolveThemeCollection } from "./build-collection-css";
import { buildThemeColor, buildThemeCss, isDefaultThemeSettings } from "./build-theme-tokens";

export const THEME_STYLE_ELEMENT_ID = "app-theme";

/**
 * Chave onde o CSS já resolvido fica guardado.
 *
 * O script que roda antes do primeiro paint só injeta este texto — assim ele não
 * precisa repetir a matemática de cor e não existe flash de tema ao carregar.
 */
export const THEME_CSS_STORAGE_KEY = "connect-grow-theme-css";

/**
 * Identificador da coleção temática ativa, em chave própria para o pré-paint.
 *
 * O CSS estrutural do tema é escopado por `data-theme`, então o atributo precisa
 * existir ANTES do primeiro paint — é o que impede o conteúdo piscar sem o tema.
 */
export const THEME_COLLECTION_STORAGE_KEY = "connect-grow-theme-collection";

/**
 * Aplica o que o usuário escolheu, na ordem: coleção temática (tema completo) >
 * personalização de cores > padrão da marca. Coleção inválida (removida, editada à
 * mão) é tratada como ausência — nunca aplica um tema pela metade.
 */
export function applyThemeSettings(
  settings: ThemeSettings,
  mode: Theme,
  collectionId?: string | null,
): void {
  if (typeof document === "undefined") return;

  const collection = resolveThemeCollection(collectionId);

  // O atributo é o escopo do CSS estrutural; sem coleção, ele sai de cena junto.
  if (collection) {
    document.documentElement.dataset.theme = collection.id;
  } else {
    delete document.documentElement.dataset.theme;
  }

  const existing = document.getElementById(THEME_STYLE_ELEMENT_ID);

  if (!collection && isDefaultThemeSettings(settings)) {
    existing?.remove();
    localStorage.removeItem(THEME_CSS_STORAGE_KEY);
    localStorage.removeItem(THEME_COLLECTION_STORAGE_KEY);
    updateThemeColorElement(undefined);
    return;
  }

  const css = collection ? buildCollectionCss(collection, mode) : buildThemeCss(settings, mode);
  const style = (existing as HTMLStyleElement | null) ?? document.createElement("style");
  style.id = THEME_STYLE_ELEMENT_ID;
  style.textContent = css;
  if (!existing) document.head.appendChild(style);

  localStorage.setItem(THEME_CSS_STORAGE_KEY, css);
  if (collection) {
    localStorage.setItem(THEME_COLLECTION_STORAGE_KEY, collection.id);
  } else {
    localStorage.removeItem(THEME_COLLECTION_STORAGE_KEY);
  }
  updateThemeColorElement(collection ? collection.metaColor : buildThemeColor(settings, mode));
}

function updateThemeColorElement(color: string | undefined): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  meta.setAttribute("content", color ?? texts.pwa.themeColor);
}
