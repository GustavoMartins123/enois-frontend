import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { Copy, Download } from "lucide-react";

import { marketplaceApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

/**
 * Conteúdo de uma compra: o comprador edita os textos aqui mesmo e copia o HTML.
 *
 * A edição é local (o material comprado não muda no servidor): o objetivo é adaptar o template
 * antes de colar no perfil, no post, na página ou no blog.
 */
export function MarketplaceContentDialog({
  purchaseId,
  title,
  onClose,
}: {
  purchaseId: string;
  title: string | null | undefined;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const content = useQuery({
    queryKey: ["marketplace", "purchase-content", purchaseId],
    queryFn: () => marketplaceApi.purchaseContent(purchaseId),
  });

  const [text, setText] = useState("");

  useEffect(() => {
    if (content.data) {
      setText(content.data.content ?? "");
    }
  }, [content.data]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast("HTML copiado — cole onde quiser usar.", "success");
    } catch {
      toast("Não deu para copiar. Selecione o texto e copie à mão.", "error");
    }
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(title ?? "conteudo").replace(/[^\w-]+/g, "-").toLowerCase()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{content.data?.title ?? title ?? "Conteúdo comprado"}</DialogTitle>

          <DialogDescription>
            Edite os textos abaixo antes de usar. O arquivo original continua na sua compra; esta
            edição é só para copiar o HTML já personalizado.
          </DialogDescription>
        </DialogHeader>

        {content.isLoading ? (
          <p className="py-8 text-center text-sm text-text-subtle">Carregando…</p>
        ) : content.isError ? (
          <p className="py-8 text-center text-sm text-destructive">
            Não foi possível abrir o conteúdo desta compra.
          </p>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={text}
              rows={16}
              maxLength={200_000}
              onChange={(event) => setText(event.target.value)}
              className="font-mono text-xs"
            />

            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" className="gap-2 rounded-full" onClick={download}>
                <Download className="h-4 w-4" />

                <>{texts_download}</>
              </Button>

              <Button className="gap-2 rounded-full" onClick={copy}>
                <Copy className="h-4 w-4" />

                <>Copiar HTML</>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const texts_download = "Baixar .html";
