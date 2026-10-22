/**
 * Reconhece link de GIF aceito pelo comentário — o mesmo critério do `link-previews`, para não
 * deixar entrar link que depois não renderiza como GIF.
 */
export function isGifUrl(value: string): boolean {
  return (
    /^https:\/\/(media|i)\.giphy\.com\//.test(value) ||
    /^https:\/\/media\d*\.tenor\.com\//.test(value) ||
    /\.gif(\?|$)/i.test(value) ||
    /giphy\.com\/(?:gifs\/)?[^/?#]*-[a-zA-Z0-9]+\/?$/.test(value)
  );
}
