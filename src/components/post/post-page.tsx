import { useState } from "react";

import { CONTENT_ORIGIN, HAS_CONTENT_ORIGIN } from "@/constants/content-origin";
import { PHONE_COLUMN_CLASS } from "@/constants/post-page";
import { texts } from "@/texts";
import type { PostPageProps } from "@/types/components/post/post-page-props";
import { Maximize2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { SandboxedHtmlFrame } from "./sandboxed-html-frame";

/**
 * A "mini pagina" dentro do post: o HTML colado pelo autor renderizado num quadro isolado.
 *
 * O quadro tem altura fixa (e rolagem propria) porque nao ha como medir o conteudo de dentro sem
 * script de dentro avisando o tamanho. Quem quiser ler com folga abre no dialogo, com a mesma altura
 * relativa a viewport.
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
      <div className="w-full overflow-hidden">
        {pageUrl ? (
          // Origem separada: aqui o quadro PODE rodar script (o player vive dentro da página) sem
          // que isso dê acesso ao app — é a origem diferente, não a política, que garante o corte.
          // Sem `allow-same-origin` o player do YouTube não monta; com ela, mas em outra origem,
          // o documento não alcança nada do énóis.
          <iframe
            title={texts.posts.page.frameTitle}
            src={pageUrl}
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            allow="fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            loading="lazy"
            className="h-[520px] w-full bg-white"
          />
        ) : (
          <SandboxedHtmlFrame
            html={html}
            title={texts.posts.page.frameTitle}
            className="h-[520px] w-full"
            innerPadding={false}
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{texts.posts.page.dialogTitle}</DialogTitle>
          </DialogHeader>

          <div className={PHONE_COLUMN_CLASS}>
            {pageUrl ? (
              <iframe
                title={texts.posts.page.frameTitle}
                src={pageUrl}
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                allow="fullscreen"
                allowFullScreen
                referrerPolicy="no-referrer"
                className="h-[70dvh] w-full rounded-2xl border border-border-soft bg-white"
              />
            ) : (
              <SandboxedHtmlFrame
                html={html}
                title={texts.posts.page.frameTitle}
                className="h-[70dvh]"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
