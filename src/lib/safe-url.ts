/**
 * Links informados pelo usuário só viram href se forem http(s).
 *
 * O backend agora recusa javascript:/data: ao salvar, mas perfis antigos podem ter valores
 * gravados antes da correção — a renderização não pode confiar no banco (E-07/E-23).
 */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}
