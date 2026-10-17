import type { ThemeCollectionPreview } from "./theme-collection-preview";
import type { ThemeCollectionTokens } from "./theme-collection-tokens";

export type ThemeCollection = {
  /** Identificador estável — é o que viaja para o backend e fica salvo na conta. */
  id: string;
  name: string;
  description: string;
  /** Cor da barra do navegador enquanto o tema está ativo. */
  metaColor: string;
  /**
   * Tokens por modo. Quando o tema não tem variante escura (`dark` ausente), a
   * clara vale nos dois modos — é isso que faz um tema de fundo claro continuar
   * legível com o app em modo escuro: o texto claro da marca é sobrescrito pelo
   * texto claro do tema no seletor `.dark`.
   */
  tokens: { light: ThemeCollectionTokens; dark?: ThemeCollectionTokens };
  /**
   * CSS estrutural do tema (relevos, vidro, brilhos) — regras planas, uma por
   * linha, já escritas com o escopo `html:root[data-theme="…"]` (e a variante
   * `.dark` quando o efeito vale nos dois modos), então nada vaza para outro tema.
   */
  css?: string;
  /** Amostra representativa para a galeria. */
  preview: ThemeCollectionPreview;
};
