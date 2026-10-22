/**
 * Altura do CONTEUDO de um quadro HTML isolado, medida de fora.
 *
 * O quadro roda com `allow-same-origin` e SEM `allow-scripts`: nao ha script la dentro para
 * avisar o tamanho, mas o documento e legivel daqui — entao a conta sai no pai.
 *
 * O truque: o `<html>` do quadro tem a altura da viewport, e o `scrollHeight` dele NUNCA e menor
 * que ela. Usado direto na conta, ele fazia o quadro nunca encolher: uma bio de tres linhas
 * deixava um buraco de 500px abaixo do texto (o quadro ficava com a altura inicial). O
 * `scrollHeight` do `<html>` so entra quando o conteudo ESTOURA a viewport.
 */
export function contentHeight(medidas: {
  bodyScrollHeight: number;
  bodyOffsetHeight: number;
  rootScrollHeight: number;
  rootClientHeight: number;
  rootOffsetHeight: number;
}): number {
  const {
    bodyScrollHeight,
    bodyOffsetHeight,
    rootScrollHeight,
    rootClientHeight,
    rootOffsetHeight,
  } = medidas;
  const root = rootScrollHeight > rootClientHeight ? rootScrollHeight : 0;
  return Math.ceil(Math.max(bodyScrollHeight, bodyOffsetHeight, root, rootOffsetHeight));
}
