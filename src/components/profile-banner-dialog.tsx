import { useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { PROFILE_HTML_MAX_LENGTH } from "@/constants/profile";
import { texts } from "@/texts";
import type { ProfileBannerDialogProps } from "@/types/components/profile/profile-banner-dialog-props";
import { ImageIcon } from "lucide-react";

import { profileApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

import { HtmlEditor } from "@/components/html-editor";

/**
 * Capa do perfil: foto OU HTML/CSS, sempre com as duas opções na mão.
 *
 * A capa em HTML ocupa exatamente o mesmo espaço da foto (a altura da capa, não uma caixa própria) —
 * é o que o editor já mostra na pré-visualização, para ninguém descobrir o recorte depois de salvar.
 */
export function ProfileBannerDialog({
  open,
  onOpenChange,
  initialHtml,
  onPickPhoto,
  onSaved,
}: ProfileBannerDialogProps) {
  const { toast } = useToast();
  const [html, setHtml] = useState(initialHtml ?? "");

  const save = useMutation({
    mutationFn: (value: string) => profileApi.update({ bannerHtml: value }),
    onSuccess: () => {
      onOpenChange(false);
      toast(texts.profile.bannerHtml.saved);
      onSaved();
    },
    onError: () => toast(texts.profile.bannerHtml.error, "error"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{texts.profile.bannerHtml.title}</DialogTitle>
        </DialogHeader>

        <p className="text-[12px] font-normal text-text-subtle">
          {texts.profile.bannerHtml.choiceHint}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-full gap-2"
            onClick={() => {
              onOpenChange(false);
              onPickPhoto();
            }}
          >
            <ImageIcon className="h-4 w-4" />

            <>{texts.profile.bannerHtml.photo}</>
          </Button>

          {initialHtml && (
            <Button
              variant="ghost"
              className="rounded-full gap-2"
              disabled={save.isPending}
              onClick={() => save.mutate("")}
            >
              <>{texts.profile.bannerHtml.remove}</>
            </Button>
          )}
        </div>

        <div className="rounded-2xl border border-border-soft bg-surface-1 p-3">
          <HtmlEditor
            id="profile-banner-html"
            value={html}
            onChange={setHtml}
            label={texts.profile.bannerHtml.label}
            description={texts.profile.bannerHtml.description}
            placeholder={texts.profile.bannerHtml.placeholder}
            emptyPreview={texts.profile.bannerHtml.empty}
            frameTitle={texts.profile.bannerHtml.frameTitle}
            maxLength={PROFILE_HTML_MAX_LENGTH}
            // Mesma altura da capa de verdade: o autor vê o recorte antes de salvar.
            previewClassName="mt-3 h-40 w-full sm:h-52"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            {texts.common.cancel}
          </Button>

          <Button
            className="rounded-full"
            disabled={save.isPending || html === (initialHtml ?? "")}
            onClick={() => save.mutate(html)}
          >
            {save.isPending ? texts.common.saving : texts.profile.bannerHtml.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
