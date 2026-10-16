/**
 * Origem de conteúdo das páginas.
 *
 * A página é servida em `{CONTENT_ORIGIN}/pages/{postId}`, numa origem SEPARADA da do app, e é isso
 * que permite o quadro rodar com scripts liberados (necessário para o player de terceiros montar)
 * sem dar ao HTML colado acesso à sessão de quem lê. **Nunca aponte isto para a origem do app**: no
 * mesmo host, `allow-same-origin` + `allow-scripts` entregam o `localStorage` a quem colou o HTML.
 *
 * Enquanto a variável não estiver definida, o quadro cai no modo antigo (documento embutido, sandbox
 * sem scripts): mais restritivo, sem player — é o padrão seguro até o DNS existir.
 */
export const CONTENT_ORIGIN: string = (import.meta.env.VITE_CONTENT_ORIGIN ?? "")
  .trim()
  .replace(/\/$/, "");

/** Há origem de conteúdo configurada (e ela não é a do app)? */
export const HAS_CONTENT_ORIGIN = CONTENT_ORIGIN.length > 0;
