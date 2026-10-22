import type { ThemeTokenMap } from "./theme-token-map";

/**
 * Bloco de tokens que um tema declara para um modo, com valores CSS prontos.
 *
 * `Partial<ThemeTokenMap>` de propósito: o tema define o que precisa e o resto
 * continua vindo do CSS da marca.
 */
export type ThemeCollectionTokens = Partial<ThemeTokenMap> & Record<string, string>;
