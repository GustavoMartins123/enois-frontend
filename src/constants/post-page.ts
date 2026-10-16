/**
 * Teto de uma "página" publicada, em caracteres de HTML.
 *
 * É um número só, e é igual para todo mundo: o mesmo valor limita o que o campo deixa digitar e o
 * que o backend aceita gravar e renderizar (o `MAX_PAGE_HTML` de `SafeHtml` no backend). Não existe
 * exceção por reputação, tipo de conta ou quantidade de posts — a página de qualquer pessoa cabe no
 * mesmo espaço, e o contador abaixo do campo mostra exatamente essa conta.
 */
export const PAGE_HTML_MAX_LENGTH = 100_000;
