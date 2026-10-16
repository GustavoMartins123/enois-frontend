import { useState } from "react";

import { PHONE_FRAME_CLASS } from "@/constants/post-page";
import { texts } from "@/texts";
import type { PostPageProps } from "@/types/components/post/post-page-props";
import { Maximize2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { SandboxedHtmlFrame } from "./sandboxed-html-frame";

/**
 * A "mini pagina" dentro do post: o HTML colado pelo autor renderizado num quadro isolado.
 *
 * O quadro tem altura fixa (e rolagem propria) porque nao ha como medir o conteudo de dentro por
 * `postMessage` — isso exigiria liberar script no iframe, e ai a seguranca toda se perderia. Quem
 * quiser ler com folga abre no dialogo, que usa a mesma altura relativa a viewport.
 */
export function PostPage({ html }: PostPageProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-4">
      <div className={PHONE_FRAME_CLASS}>
        <SandboxedHtmlFrame html={html} title={texts.posts.page.frameTitle} className="h-full" />
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-light text-text-subtle transition hover:bg-surface-2 hover:text-primary"
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

          <div className="mx-auto w-full max-w-[390px]">
            <SandboxedHtmlFrame
              html={html}
              title={texts.posts.page.frameTitle}
              className="h-[70dvh]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
