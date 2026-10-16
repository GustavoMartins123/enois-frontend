import { useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { PROFILE_HTML_MAX_LENGTH } from "@/constants/profile";
import { texts } from "@/texts";
import type { ProfileBioDialogProps } from "@/types/components/profile/profile-bio-dialog-props";
import { Code2 } from "lucide-react";

import { profileApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

import { HtmlEditor } from "@/components/html-editor";

/**
 * Bio do perfil em HTML/CSS.
 *
 * Deixar vazio é uma ação legítima: limpa o HTML e o perfil volta a mostrar a bio de texto — por
 * isso o botão de limpar existe, em vez de o campo "não deixar" apagar.
 */
export function ProfileBioDialog({ initialHtml, onSaved }: ProfileBioDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [html, setHtml] = useState(initialHtml ?? "");

  const save = useMutation({
    mutationFn: () => profileApi.update({ bioHtml: html }),
    onSuccess: () => {
      setOpen(false);
      toast(texts.profile.bioHtml.saved);
      onSaved();
    },
    onError: () => toast(texts.profile.bioHtml.error, "error"),
  });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full gap-1.5"
        onClick={() => {
          setHtml(initialHtml ?? "");
          setOpen(true);
        }}
      >
        <Code2 className="h-4 w-4" />

        <>{texts.profile.bioHtml.action}</>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{texts.profile.bioHtml.title}</DialogTitle>
          </DialogHeader>

          <p className="text-xs font-normal text-text-subtle">{texts.profile.bioHtml.hint}</p>

          <HtmlEditor
            id="profile-bio-html"
            value={html}
            onChange={setHtml}
            label={texts.profile.bioHtml.label}
            description={texts.profile.bioHtml.description}
            placeholder={texts.profile.bioHtml.placeholder}
            emptyPreview={texts.profile.bioHtml.empty}
            frameTitle={texts.profile.bioHtml.frameTitle}
            maxLength={PROFILE_HTML_MAX_LENGTH}
            previewClassName="mt-3 h-[280px]"
          />

          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              {texts.common.cancel}
            </Button>

            <Button
              className="rounded-full"
              disabled={save.isPending || html === (initialHtml ?? "")}
              onClick={() => save.mutate()}
            >
              {save.isPending ? texts.common.saving : texts.profile.bioHtml.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
