import { useCallback, useEffect, useRef, useState } from "react";

import type { SandboxedHtmlFrameProps } from "@/types/components/post/sandboxed-html-frame-props";

import { cn } from "@/lib/utils";

/**
 * Renderiza o HTML de uma pagina dentro de um iframe isolado.
 *
 * Aqui mora a seguranca do recurso, e ela nao depende do sanitizador estar perfeito:
 *
 * - `sandbox` sem `allow-scripts`: script nenhum executa, nem com evento inline. `allow-same-origin`
 *   ENTRA de proposito, e nao afrouxa isso: quem executa script e o `allow-scripts`, que continua
 *   fora. O que a mesma origem da e o direito de o NOSSO codigo medir a altura do documento
 *   (`contentDocument`), e e assim que o quadro cresce ate o conteudo em vez de rolar por dentro.
 *   Nao acrescente `allow-scripts` aqui: com a mesma origem, isso daria ao HTML colado o mesmo
 *   poder do app (storage e sessao de quem le) — e e justamente o que o recurso evita.
 * - CSP dentro do proprio documento (`default-src 'none'`): nenhuma requisicao sai dai, entao o
 *   HTML nao consegue chamar um servidor externo nem carregar pixel de rastreio. O que segue
 *   liberado e imagem/video em https e data: com CSS inline, que e o que dá aparencia a pagina.
 * - Sem `allow-top-navigation`: o pior caso de um link e navegar dentro do quadro — e como
 *   colocamos `<base target="_blank">`, o link abre em outra aba em vez de trocar a pagina do post.
 *
 * `srcDoc` (e nao insercao por DOM) garante que o conteudo nunca e interpretado no documento do
 * app: ele nasce dentro do iframe, ja sob o sandbox.
 */
export function SandboxedHtmlFrame({
  html,
  className,
  title,
  innerPadding = true,
  autoHeight = true,
}: SandboxedHtmlFrameProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [measured, setMeasured] = useState<number | null>(null);

  /**
   * Altura do conteudo, medida do lado de fora.
   *
   * Sem `allow-scripts` nao ha script dentro do quadro para avisar o tamanho — mas com
   * `allow-same-origin` o documento e legivel daqui, entao a conta sai no pai. `scrollHeight` do
   * `body` e do `documentElement` (o maior dos dois) cobre tanto documento curto quanto conteudo
   * que estoura, e o `ResizeObserver` refaz a conta quando imagem ou fonte mudam o tamanho.
   */
  const measure = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    const body = doc.body;
    const root = doc.documentElement;
    const altura = Math.ceil(
      Math.max(
        body?.scrollHeight ?? 0,
        body?.offsetHeight ?? 0,
        root?.scrollHeight ?? 0,
        root?.offsetHeight ?? 0,
      ),
    );
    if (altura > 0) setMeasured((atual) => (atual === altura ? atual : altura));
  }, []);

  useEffect(() => {
    if (!autoHeight) return;
    const element = frame.current;
    if (!element) return;

    let observer: ResizeObserver | null = null;
    const attach = () => {
      measure();
      const body = element.contentDocument?.body;
      if (body && typeof ResizeObserver !== "undefined") {
        observer?.disconnect();
        observer = new ResizeObserver(() => measure());
        observer.observe(body);
      }
    };

    element.addEventListener("load", attach);
    // O `srcdoc` pode ter carregado antes deste efeito (primeira pintura): mede agora tambem.
    attach();
    window.addEventListener("resize", measure);

    return () => {
      element.removeEventListener("load", attach);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [autoHeight, html, measure]);

  return (
    <iframe
      ref={frame}
      title={title}
      srcDoc={buildDocument(html, innerPadding)}
      // Sem `allow-scripts` e sem `allow-same-origin`: e o que garante que o HTML colado nao roda
      // codigo. `allow-fullscreen` existe so para o botao de tela cheia do player de video, e
      // `autoplay` delega a permissao do autoplay que o autor pediu: midia muda toca sozinha (mesmo
      // dentro do sandbox); com som, o navegador continua exigindo um gesto de quem le.
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      allow="autoplay; fullscreen"
      allowFullScreen
      referrerPolicy="no-referrer"
      loading="lazy"
      // Sem borda, cantos ou sombra por padrão: quem envolve (card do post, card "Sobre") já dá o
      // acabamento, e a página deve encostar nas bordas em vez de flutuar dentro de uma moldura.
      // Quem quiser moldura passa a classe (o diálogo "Abrir página", por exemplo).
      // `border-0` e `bg-transparent` são obrigatórios, não estilo: o navegador desenha uma borda
      // clara de 2px em todo iframe por padrão, e o fundo branco aparecia atrás do conteúdo do autor
      // em tema escuro. Sem os dois, sobra uma "bordinha branca" em volta de tudo que é HTML/CSS.
      className={cn("w-full border-0 bg-transparent", className)}
      // A classe do chamador continua valendo como altura ate a medida chegar (o SSR nao mede):
      // o estilo em linha e que manda depois dela.
      style={autoHeight && measured ? { height: measured } : undefined}
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
  // O que já está implícito no `default-src 'none'` vai escrito: a lista é a auditoria da política.
  // Quadro dentro de quadro, plugin, formulário, requisição de dados e worker ficam de fora — nenhuma
  // dessas portas existe no que a página precisa fazer.
  "frame-src 'none'",
  "object-src 'none'",
  "connect-src 'none'",
  "worker-src 'none'",
  "form-action 'none'",
].join("; ");

/**
 * Aparencia base da pagina colada. Entra ANTES do `<style>` do autor, entao o CSS dele sobrescreve
 * o que quiser. Fundo claro de proposito: uma pagina colada assume papel branco, e o quadro
 * precisa ler como "site dentro do post", nao como parte do tema do app.
 */
function buildBaseCss(innerPadding: boolean): string {
  const padding = innerPadding ? "14px 16px" : "0";
  return `*{box-sizing:border-box}
html,body{margin:0}
body{background:transparent;color:light-dark(#1a1a1a,#e8e6ff);color-scheme:light dark;padding:${padding};overflow-wrap:break-word;
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
blockquote{margin:.6em 0;padding-left:12px;border-left:3px solid #ddd;color:#555}
/* Onde vai um player embutido: o quadro não roda script, então o vídeo/áudio aparece logo abaixo
   da página. Aqui fica a marca do lugar dele, para a página não perder a referência visual. */
[data-enois-embed]{display:block;aspect-ratio:16/9;background:#f2f2f5;border-radius:10px;
border:1px dashed #cfcfd6;margin:.8em 0}`;
}

function buildDocument(html: string, innerPadding: boolean): string {
  return [
    '<!doctype html><html lang="pt-BR"><head>',
    `<meta http-equiv="Content-Security-Policy" content="${FRAME_CSP}">`,
    // Viewport de celular: e o tamanho do quadro, entao o HTML se comporta como numa tela de
    // telefone (e o print sai inteiro, sem rolagem).
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<base target="_blank">',
    `<style>${buildBaseCss(innerPadding)}</style>`,
    "</head><body>",
    html,
    "</body></html>",
  ].join("");
}
