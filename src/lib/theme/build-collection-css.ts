import { THEME_COLLECTIONS } from "@/constants/theme-collections";
import type { Theme } from "@/types/preferences/theme";
import type { ThemeCollection } from "@/types/preferences/theme-collection";

/**
 * Resolve o identificador para um tema da coleção.
 *
 * Identificador inválido (ou tema removido em uma versão futura) devolve `null` —
 * e a aplicação cai no padrão da marca, nunca num tema pela metade.
 */
export function resolveThemeCollection(id: string | null | undefined): ThemeCollection | null {
  if (!id) return null;
  return THEME_COLLECTIONS.find((collection) => collection.id === id) ?? null;
}

/**
 * CSS completo de um tema da coleção: os tokens no seletor de especificidade alta
 * (a mesma lição do tema de cores livres — `html:root`/`html:root.dark`, porque
 * `:root` sozinho empata com o CSS da marca e um chunk por rota ganhava depois)
 * mais o CSS estrutural do tema, que já vem escopado por `data-theme`.
 *
 * O modo que o tema não define não existe aqui: um tema só-claro injetado no
 * escuro traz os tokens claros no seletor `.dark` — inclusive o texto claro —,
 * que é o que o mantém legível; um tema só-escuro vale nos dois modos pelo mesmo
 * caminho, na direção oposta.
 */
export function buildCollectionCss(collection: ThemeCollection, mode: Theme): string {
  const tokens =
    mode === "dark" ? (collection.tokens.dark ?? collection.tokens.light) : collection.tokens.light;
  const declarations = Object.entries(tokens)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  const selector = mode === "dark" ? "html:root.dark" : "html:root";
  const varsBlock = `${selector}[data-theme="${collection.id}"] {\n${declarations}\n}`;

  return collection.css ? `${varsBlock}\n${collection.css}` : varsBlock;
}
