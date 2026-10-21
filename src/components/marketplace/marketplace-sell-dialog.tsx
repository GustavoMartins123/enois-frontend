import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  CONTENT_KINDS,
  MARKETPLACE_KIND_LABELS,
  type MarketplaceKind,
} from "@/constants/marketplace-kinds";

import { ApiError, marketplaceApi } from "@/lib/api";
import { parseFaiscaInput } from "@/lib/faisca";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

const MIN_PRICE = parseFaiscaInput("50") ?? 50_000;

/**
 * Vender qualquer conteúdo por faíscas: template, banner, página, post, blog ou serviço.
 * O comprador recebe o texto/HTML em "Minhas compras" e edita antes de usar.
 */
export function MarketplaceSellDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [kind, setKind] = useState<MarketplaceKind>("TEMPLATE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("50");

  useEffect(() => {
    if (!open) return;
    setKind("TEMPLATE");
    setTitle("");
    setDescription("");
    setContent("");
    setPrice("50");
  }, [open]);

  const publish = useMutation({
    mutationFn: () =>
      marketplaceApi.publishItem({
        kind,
        title: title.trim(),
        description: description.trim() || undefined,
        content,
        price: parseFaiscaInput(price) ?? 0,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["marketplace"] });
      toast("Publicado no marketplace!", "success");
      onOpenChange(false);
    },
    onError: (error) =>
      toast(
        error instanceof ApiError ? error.message : "Não foi possível publicar agora.",
        "error",
      ),
  });

  const faiscas = parseFaiscaInput(price) ?? 0;
  const valid =
    title.trim().length >= 3 &&
    faiscas >= MIN_PRICE &&
    (kind === "SERVICE" || content.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Vender no marketplace</DialogTitle>

          <DialogDescription>
            Escolha a categoria, cole o conteúdo e defina o preço em faíscas. Quem compra recebe o
            material em “Minhas compras”, pode editar os textos e copiar o HTML.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-text-subtle">Categoria</Label>

            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as MarketplaceKind)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary"
            >
              {CONTENT_KINDS.map((value) => (
                <option key={value} value={value}>
                  {MARKETPLACE_KIND_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-text-subtle">Título</Label>

            <Input
              value={title}
              maxLength={160}
              placeholder="Ex.: Banner de portfólio minimalista"
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-text-subtle">Descrição (opcional)</Label>

            <Textarea
              value={description}
              rows={2}
              maxLength={500}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-text-subtle">
              {kind === "SERVICE" ? "O que está incluído no serviço" : "Conteúdo (HTML ou texto)"}
            </Label>

            <Textarea
              value={content}
              rows={8}
              maxLength={200_000}
              placeholder={
                kind === "SERVICE"
                  ? "Descreva o serviço, prazo e o que a pessoa recebe."
                  : '<section style="...">Cole aqui o HTML do template...</section>'
              }
              onChange={(event) => setContent(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-text-subtle">Preço em faíscas</Label>

            <Input
              type="number"
              min={50}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />

            <p className="text-xs text-text-subtle">Mínimo de 50 faíscas.</p>
          </div>

          <Button
            className="w-full rounded-full"
            disabled={!valid || publish.isPending}
            onClick={() => publish.mutate()}
          >
            {publish.isPending ? "Publicando…" : "Publicar e vender"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
