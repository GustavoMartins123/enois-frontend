import { texts } from "@/texts";
import type { BackgroundStyle } from "@/types/preferences/background-style";
import type { Theme } from "@/types/preferences/theme";
import type { ThemeSettings } from "@/types/preferences/theme-settings";

import { buildBackgroundDeclarations } from "./build-background-style";
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
  backgroundStyle?: BackgroundStyle | null,
): void {
  if (typeof document === "undefined") return;

  const collection = resolveThemeCollection(collectionId);
  // Quem manda no fundo com um tema da galeria ativo é o tema; o fundo escolhido
  // vale na personalização de cores livres.
  const background = collection ? null : (backgroundStyle ?? null);

  // O atributo é o escopo do CSS estrutural; sem coleção, ele sai de cena junto.
  if (collection) {
    document.documentElement.dataset.theme = collection.id;
  } else {
    delete document.documentElement.dataset.theme;
  }

  const existing = document.getElementById(THEME_STYLE_ELEMENT_ID);

  if (!collection && isDefaultThemeSettings(settings) && !background) {
    existing?.remove();
    localStorage.removeItem(THEME_CSS_STORAGE_KEY);
    localStorage.removeItem(THEME_COLLECTION_STORAGE_KEY);
    updateThemeColorElement(undefined);
    return;
  }

  let css = collection ? buildCollectionCss(collection, mode) : buildThemeCss(settings, mode);

  if (background) {
    // O fundo escolhido entra no MESMO seletor de especificidade alta dos tokens:
    // um chunk de rota não o desfaz no meio da navegação (lição da camada de cores).
    const selector = mode === "dark" ? "html:root.dark" : "html:root";
    const declarations = Object.entries(buildBackgroundDeclarations(background))
      .map(([name, value]) => `  ${name}: ${value};`)
      .join("\n");
    css += `\n\n${selector} {\n${declarations}\n}`;
  }
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
  // A barra do navegador acompanha o fundo escolhido quando ele existe.
  const chromeColor = background
    ? background.type === "solid"
      ? background.color
      : background.from
    : undefined;
  updateThemeColorElement(
    collection ? collection.metaColor : (chromeColor ?? buildThemeColor(settings, mode)),
  );
}

function updateThemeColorElement(color: string | undefined): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  meta.setAttribute("content", color ?? texts.pwa.themeColor);
}
