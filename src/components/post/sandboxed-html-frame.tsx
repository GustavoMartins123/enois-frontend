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
      sandbox="allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="no-referrer"
      loading="lazy"
      className={cn("w-full rounded-xl border border-border-soft bg-white", className)}
    />
  );
}

/** Politica aplicada por dentro do quadro: sem rede, sem script, sem formulario. */
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
    '<base target="_blank">',
    `<style>${BASE_CSS}</style>`,
    "</head><body>",
    html,
    "</body></html>",
  ].join("");
}
