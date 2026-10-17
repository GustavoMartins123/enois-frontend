import { texts } from "@/texts";
import type { BackgroundStyle } from "@/types/preferences/background-style";
import type { Theme } from "@/types/preferences/theme";
import type { ThemeSettings } from "@/types/preferences/theme-settings";

import { buildPageDeclarations, buildWidgetDeclarations } from "./build-background-style";
import { buildCollectionCss, resolveThemeCollection } from "./build-collection-css";
import {
  buildThemeColor,
  buildThemeCss,
  clampThemeSettings,
  isDefaultThemeSettings,
} from "./build-theme-tokens";

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
 * Aplica o que o usuário escolheu, em camadas: padrão da marca / tema da coleção >
 * cor de destaque livre > cor de widget livre > plano de fundo (página) livre.
 * Coleção inválida (removida, editada à mão) é tratada como ausência — nunca aplica
 * um tema pela metade. A cor de widget pinta o interno dos cartões/painéis E ajusta
 * o texto a ela; o plano de fundo troca só a página, atrás de tudo.
 */
export function applyThemeSettings(
  settings: ThemeSettings,
  mode: Theme,
  collectionId?: string | null,
  widgetBackground?: BackgroundStyle | null,
  pageBackground?: BackgroundStyle | null,
): void {
  if (typeof document === "undefined") return;

  const collection = resolveThemeCollection(collectionId);
  // Com um tema da galeria ativo, as cores livres passam a ser CAMADA: o destaque
  // livre pinta por cima da identidade (que mantém superfícies e relevos).
  const accentOverride =
    !collection || isDefaultThemeSettings(settings) ? null : clampThemeSettings(settings).accent;

  // O atributo é o escopo do CSS estrutural; sem coleção, ele sai de cena junto.
  if (collection) {
    document.documentElement.dataset.theme = collection.id;
  } else {
    delete document.documentElement.dataset.theme;
  }

  const existing = document.getElementById(THEME_STYLE_ELEMENT_ID);

  if (!collection && isDefaultThemeSettings(settings) && !widgetBackground && !pageBackground) {
    existing?.remove();
    localStorage.removeItem(THEME_CSS_STORAGE_KEY);
    localStorage.removeItem(THEME_COLLECTION_STORAGE_KEY);
    updateThemeColorElement(undefined);
    return;
  }

  let css = collection
    ? buildCollectionCss(collection, mode, { accent: accentOverride })
    : buildThemeCss(settings, mode);

  // Os fundos livres entram no MESMO seletor de especificidade alta dos tokens: um
  // chunk de rota não os desfaz no meio da navegação (lição da camada de cores).
  const selector = mode === "dark" ? "html:root.dark" : "html:root";
  const layers: Record<string, string>[] = [];
  if (widgetBackground) layers.push(buildWidgetDeclarations(widgetBackground));
  if (pageBackground) layers.push(buildPageDeclarations(pageBackground));
  for (const declarations of layers) {
    const block = Object.entries(declarations)
      .map(([name, value]) => `  ${name}: ${value};`)
      .join("\n");
    css += `\n\n${selector} {\n${block}\n}`;
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
  // A barra do navegador acompanha o fundo da página quando ele existe.
  const chromeColor = pageBackground
    ? pageBackground.type === "solid"
      ? pageBackground.color
      : pageBackground.from
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
