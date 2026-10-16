/**
 * Teto de uma "página" publicada, em caracteres de HTML.
 *
 * É um número só, e é igual para todo mundo: o mesmo valor limita o que o campo deixa digitar e o
 * que o backend aceita gravar e renderizar (o `MAX_PAGE_HTML` de `SafeHtml` no backend). Não existe
 * exceção por reputação, tipo de conta ou quantidade de posts — a página de qualquer pessoa cabe no
 * mesmo espaço, e o contador abaixo do campo mostra exatamente essa conta.
 */
export const PAGE_HTML_MAX_LENGTH = 20_000;

/**
 * O quadro da página é uma tela de celular, não uma faixa larga.
 *
 * Duas consequências práticas: o HTML renderiza no mesmo viewport estreito que a maioria das
 * pessoas vai usar (então layout, quebra de linha e media queries se comportam como no celular) e
 * o resultado cabe inteiro num print — uma página larga obrigaria a rolar para tirar a foto.
 * A largura é fixa e a altura vem por proporção, então em tela pequena o quadro encolhe junto, sem
 * deixar de ser uma tela de celular.
 */
export const PHONE_FRAME_WIDTH = 390;
export const PHONE_FRAME_HEIGHT = 780;

/** Classe do quadro em proporção de celular, centralizado na largura disponível. */
export const PHONE_FRAME_CLASS = "mx-auto w-full max-w-[390px] aspect-[390/780] h-auto min-h-0";
