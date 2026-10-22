/**
 * Teto do HTML/CSS da bio do perfil, em caracteres.
 *
 * Mesmo número para todo mundo (como o da página) e espelhado no backend
 * (`SafeHtml.MAX_PROFILE_HTML`), que é quem recusa de verdade. É menor que o teto da página
 * porque o perfil aparece em muito mais telas — lista de conexões, busca, sugestões.
 */
export const PROFILE_HTML_MAX_LENGTH = 20_000;
