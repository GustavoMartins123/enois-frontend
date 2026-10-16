import type { SandboxedHtmlFrameProps } from "@/types/components/post/sandboxed-html-frame-props";

import { cn } from "@/lib/utils";

/**
 * Renderiza o HTML de uma pagina dentro de um iframe isolado.
 *
 * Aqui mora a seguranca do recurso, e ela nao depende do sanitizador estar perfeito:
 *
 * - `sandbox` sem `allow-scripts`: script nenhum executa, nem com evento inline. Sem
 *   `allow-same-origin`, o iframe tambem nao enxerga o documento pai, cookies ou storage — a
 *   origem e opaca, entao nada aqui alcanca a sessao de quem esta lendo.
 * - CSP dentro do proprio documento (`default-src 'none'`): nenhuma requisicao sai dai, entao o
 *   HTML nao consegue chamar um servidor externo nem carregar pixel de rastreio. O que segue
 *   liberado e imagem/video em https e data: com CSS inline, que e o que dá aparencia a pagina.
 * - Sem `allow-top-navigation`: o pior caso de um link e navegar dentro do quadro — e como
 *   colocamos `<base target="_blank">`, o link abre em outra aba em vez de trocar a pagina do post.
 *
 * `srcDoc` (e nao insercao por DOM) garante que o conteudo nunca e interpretado no documento do
 * app: ele nasce dentro do iframe, ja sob o sandbox.
 */
export function SandboxedHtmlFrame({ html, className, title }: SandboxedHtmlFrameProps) {
  return (
    <iframe
      title={title}
      srcDoc={buildDocument(html)}
      // Sem `allow-scripts` e sem `allow-same-origin`: e o que garante que o HTML colado nao roda
      // codigo. `allow-fullscreen` existe so para o botao de tela cheia do player de video.
      sandbox="allow-popups allow-popups-to-escape-sandbox"
      allow="fullscreen"
      allowFullScreen
      referrerPolicy="no-referrer"
      loading="lazy"
      className={cn("w-full rounded-2xl border border-border-soft bg-white shadow-soft", className)}
    />
  );
}

/**
 * Politica aplicada por dentro do quadro: sem script, sem formulario e sem rede — exceto imagem e
 * midia em https (ou embutidas em data:), que sao o conteudo que a pagina legitimamente carrega e o
 * que toca dentro do post. Nao ha `frame-src`: quadro dentro de quadro fica de fora de proposito
 * (era por ali que entraria player de terceiros, e ele exigiria liberar script).
 */
const FRAME_CSP = [
  "default-src 'none'",
  "img-src https: data:",
  "media-src https: data:",
  "font-src data:",
  "style-src 'unsafe-inline'",
  "form-action 'none'",
].join("; ");

/**
 * Aparencia base da pagina colada. Entra ANTES do `<style>` do autor, entao o CSS dele sobrescreve
 * o que quiser. Fundo claro de proposito: uma pagina colada assume papel branco, e o quadro
 * precisa ler como "site dentro do post", nao como parte do tema do app.
 */
const BASE_CSS = `*{box-sizing:border-box}
html,body{margin:0}
body{background:#fff;color:#1a1a1a;padding:14px 16px;overflow-wrap:break-word;
font:400 14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
h1,h2,h3,h4,h5,h6{line-height:1.25;margin:.6em 0 .4em}
p{margin:.5em 0}
img,video,svg,canvas{max-width:100%;height:auto}
figure{margin:.8em 0}
audio{width:100%}
figcaption{font-size:12px;color:#666;margin-top:4px}
a{color:#7c3aed}
ul,ol{padding-left:1.4em}
table{border-collapse:collapse;max-width:100%;font-size:13px}
th,td{border:1px solid #e3e3e3;padding:5px 8px;text-align:left}
pre{overflow-x:auto;background:#f5f5f5;padding:10px;border-radius:8px}
code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px}
blockquote{margin:.6em 0;padding-left:12px;border-left:3px solid #ddd;color:#555}`;

function buildDocument(html: string): string {
  return [
    '<!doctype html><html lang="pt-BR"><head>',
    `<meta http-equiv="Content-Security-Policy" content="${FRAME_CSP}">`,
    // Viewport de celular: e o tamanho do quadro, entao o HTML se comporta como numa tela de
    // telefone (e o print sai inteiro, sem rolagem).
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<base target="_blank">',
    `<style>${BASE_CSS}</style>`,
    "</head><body>",
    html,
    "</body></html>",
  ].join("");
}
