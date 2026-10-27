/**
 * Valida que uma URL é blob: antes de usar em src de img/video/audio.
 *
 * CodeQL rastreia File → createObjectURL → src como XSS (js/xss-through-dom).
 * A validação pelo construtor URL quebra a cadeia de taint.
 */
export function safeBlobSrc(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "blob:") return url;
  } catch {
    /* URL invalida */
  }
  return "";
}
