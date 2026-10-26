import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { usePreferencesStore } from "@/stores/preferences.store";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
  useToast,
} from "@rede-enois/design-system/ui";

import { ApiError, marketplaceApi, themesApi } from "@/lib/api";
import { formatFaisca, parseFaiscaInput } from "@/lib/faisca";
import { resolveThemeCollection } from "@/lib/theme/build-collection-css";
import { buildGalleryPackage } from "@/lib/theme/gallery-package";

/**
 * "Vender no marketplace" da APARÊNCIA ATUAL.
 *
 * O marketplace não vende só tema de coleção: vende a personalização como um pacote de cores —
 * a coleção ativa, o destaque livre e o fundo de página entram nos mesmos cinco pares de cor da
 * galeria. O fluxo é um só: publica o pacote na galeria (o que o comprador instala) e já o lista
 * à venda em faíscas. Quem compra recebe o tema pela galeria e pode exportar o arquivo
 * `.enois-theme` como qualquer outro.
 */
export function ThemeSellDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const theme = usePreferencesStore((state) => state.theme);
  const collectionId = usePreferencesStore((state) => state.themeCollection);
  const settings = usePreferencesStore((state) => state.themeSettings);
  const pageBackground = usePreferencesStore((state) => state.pageBackground);

  const activeCollection = resolveThemeCollection(collectionId);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("50");

  useEffect(() => {
    if (!open) return;
    setName(activeCollection?.name ?? "");
    setDescription("");
    setPrice("50");
  }, [open, activeCollection?.name]);

  const sell = useMutation({
    mutationFn: async () => {
      const cleanName = name.trim();
      const cleanDescription = description.trim() || undefined;
      // 1) o pacote da aparência atual entra na galeria (é ele que o comprador instala);
      const galleryPackage = buildGalleryPackage({
        collectionId,
        settings,
        mode: theme,
        page: pageBackground,
      });
      const published = await themesApi.publish({
        name: cleanName,
        description: cleanDescription,
        packageJson: galleryPackage.packageJson,
        modeDefault: galleryPackage.modeDefault,
      });
      // 2) e a listagem do marketplace aponta para esse tema.
      return marketplaceApi.publish({
        itemId: published.id,
        title: cleanName,
        description: cleanDescription,
        price: parseFaiscaInput(price) ?? 0,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["marketplace"] });
      void queryClient.invalidateQueries({ queryKey: ["theme-gallery"] });
      toast("Publicado na galeria e à venda no marketplace!", "success");
      onOpenChange(false);
    },
    onError: (error) =>
      toast(
        error instanceof ApiError ? error.message : "Não foi possível vender agora. Tente de novo.",
        "error",
      ),
  });

  const faiscas = parseFaiscaInput(price) ?? 0;
  const valid = name.trim().length >= 3 && faiscas >= 50_000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-normal">Vender esta aparência</DialogTitle>

          <DialogDescription>
            Sua personalização atual vira um tema na galeria e entra à venda no marketplace em
            faíscas. Quem compra recebe o tema pela galeria e pode exportar o arquivo
            <span className="font-mono"> .enois-theme</span> como qualquer outro.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-text-subtle">Nome do tema</Label>

            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              placeholder="Ex.: Meu tema roxo"
              className="bg-muted"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-text-subtle">Descrição (opcional)</Label>

            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              maxLength={500}
              className="bg-muted"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-text-subtle">Preço em faíscas</Label>

            <Input
              type="number"
              min={50}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="bg-muted"
            />

            <p className="text-xs text-text-subtle">
              Mínimo de 50 faíscas. Você recebe {formatFaisca(faiscas)} faíscas (−10% da plataforma)
              depois que o comprador confirmar — ele tem 7 dias para confirmar ou pedir reembolso.
            </p>
          </div>

          <Button
            className="w-full rounded-full"
            disabled={!valid || sell.isPending}
            onClick={() => sell.mutate()}
          >
            {sell.isPending ? "Publicando…" : "Publicar e vender"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
