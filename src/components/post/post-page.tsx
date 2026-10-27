import { useState } from "react";

import { CONTENT_ORIGIN, HAS_CONTENT_ORIGIN } from "@/constants/content-origin";
import { PAGE_EMBED_HEIGHT } from "@/constants/post-page";
import { texts } from "@/texts";
import type { PostPageProps } from "@/types/components/post/post-page-props";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogTitle } from "@rede-enois/design-system/ui";
import { Maximize2, X } from "lucide-react";

import { SandboxedHtmlFrame } from "./sandboxed-html-frame";

/**
 * A "mini pagina" dentro do post: o HTML colado pelo autor renderizado num quadro isolado.
 *
 * No modo embutido o quadro tem a altura de um post de ~800 caracteres (PAGE_EMBED_HEIGHT) e o que
 * passar disso rola por dentro — a página não pode esticar o feed. Na origem de conteúdo o quadro já
 * era uma janela fixa; o modo de reserva agora segue a mesma regra. Quem quiser ler com folga abre o
 * diálogo em tela cheia, que é uma janela.
 *
 * O documento vem da ORIGEM DE CONTEUDO (`/pages/{id}`), separada da origem do app — e por isso o
 * quadro pode liberar script (o player de terceiros precisa) sem que o HTML colado alcance a sessao
 * de quem le. Sem essa origem configurada, cai no modo embutido, que nao roda script nenhum.
 */
export function PostPage({ postId, html }: PostPageProps) {
  const [expanded, setExpanded] = useState(false);
  const pageUrl = HAS_CONTENT_ORIGIN ? `${CONTENT_ORIGIN}/pages/${postId}` : null;

  return (
    // `-mx-*` cancela o padding do card do post: a página encosta nas laterais em vez de flutuar
    // dentro de uma moldura clara (era o que aparecia como "bordinha branca" em volta).
    <div className="-mx-4 mt-4 sm:-mx-5">
      {/* Altura fixa de "post de ~800 caracteres": nos dois modos o que passar rola por dentro,
          então a página nunca estica a lista. A largura continua a do post. */}
      <div className="w-full overflow-hidden" style={{ height: PAGE_EMBED_HEIGHT }}>
        {pageUrl ? (
          // Origem separada: aqui o quadro PODE rodar script (o player vive dentro da página) sem
          // que isso dê acesso ao app — é a origem diferente, não a política, que garante o corte.
          // Sem `allow-same-origin` o player do YouTube não monta; com ela, mas em outra origem,
          // o documento não alcança nada do énóis. `autoplay` na delegação é o que deixa acontecer
          // o autoplay pedido dentro da página (o `autoplay=1` do player de terceiros e o vídeo do
          // próprio autor) — a página só pode repassar o que este quadro concede.
          <iframe
            title={texts.posts.page.frameTitle}
            src={pageUrl}
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            allow="autoplay; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            loading="lazy"
            className="h-full w-full bg-white"
          />
        ) : (
          <SandboxedHtmlFrame
            html={html}
            title={texts.posts.page.frameTitle}
            className="h-full w-full"
            innerPadding={false}
            // Janela, não faixa: a altura vem do contêiner e o excedente rola dentro do quadro.
            autoHeight={false}
          />
        )}
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-normal text-text-subtle transition hover:bg-surface-2 hover:text-primary"
        >
          <Maximize2 className="h-3.5 w-3.5" />

          <>{texts.posts.page.expand}</>
        </button>
      </div>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        {/* Tela cheia de verdade: antes o diálogo era centralizado e ficava pequeno, "flutuando" no
            celular. Aqui o conteúdo ocupa a tela inteira e o botão de fechar vai para o canto
            superior ESQUERDO, que é onde a mão alcança. O X padrão (canto direito) sai de cena. */}
        <DialogContent
          hideClose
          className="inset-0 h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 p-0 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100"
        >
          <DialogPrimitive.Close className="absolute left-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-surface-card/90 text-text-strong shadow-lg backdrop-blur transition hover:bg-surface-card">
            <X className="h-4 w-4" />

            <span className="sr-only">{texts.accessibility.close}</span>
          </DialogPrimitive.Close>

          <span className="sr-only">
            <DialogTitle>{texts.posts.page.dialogTitle}</DialogTitle>
          </span>

          {pageUrl ? (
            <iframe
              title={texts.posts.page.frameTitle}
              src={pageUrl}
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              allow="autoplay; fullscreen"
              allowFullScreen
              referrerPolicy="no-referrer"
              className="h-full w-full bg-white"
            />
          ) : (
            <SandboxedHtmlFrame
              html={html}
              title={texts.posts.page.frameTitle}
              className="h-full w-full"
              innerPadding={false}
              // Tela cheia é janela: a rolagem de dentro é o que se espera de uma página aberta.
              autoHeight={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
