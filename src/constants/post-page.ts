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
 * Largura da coluna da página: 450px, para a página cobrir a largura do post.
 *
 * Continua sendo um viewport estreito — o HTML se comporta como numa tela de celular (quebra de
 * linha, media queries, mídia em largura cheia) e o resultado cabe inteiro num print. Em tela menor
 * o quadro encolhe junto, mantendo a proporção.
 */
export const PHONE_FRAME_WIDTH = 450;
/** Mesma proporção de antes (1:2), agora na largura nova. */
export const PHONE_FRAME_HEIGHT = 900;

/** Coluna da página: a largura que o quadro e os players logo abaixo dele compartilham. */
export const PHONE_COLUMN_CLASS = "mx-auto w-full max-w-[450px]";

/** O quadro em si: a coluna mais a proporção de tela. */
export const PHONE_FRAME_CLASS = `${PHONE_COLUMN_CLASS} aspect-[390/780] h-auto min-h-0`;
