import { useRef, useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { ProfileResumeDialogProps } from "@/types/components/profile/profile-resume-dialog-props";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  useToast,
} from "@rede-enois/design-system/ui";
import { FileText, Upload, X } from "lucide-react";

import { profileApi } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";
import { useMediaUpload } from "@/lib/use-media-upload";

/** Teto do arquivo: currículo é texto; acima disso é portfólio disfarçado. */
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

/**
 * Currículo do perfil: subir um PDF, baixar o que está lá e remover.
 *
 * O arquivo vive no storage de mídia (como avatar e emblema) e o perfil guarda só o endereço e o
 * nome original — é o nome que faz o download sair como "curriculo-ana.pdf" em vez de um id do CDN.
 *
 * Nada disso aparece no perfil público: quem lê a página não vê que existe currículo. Ele é da
 * pessoa, e ela decide quando entregar (no envio de uma candidatura, por exemplo).
 */
export function ProfileResumeDialog({ resumeUrl, resumeName, onSaved }: ProfileResumeDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const upload = useMediaUpload();
  const fileRef = useRef<HTMLInputElement>(null);

  const save = useMutation({
    mutationFn: (data: { resumeUrl: string; resumeName: string }) => profileApi.update(data),
    onSuccess: (_result, variables) => {
      toast(variables.resumeUrl === "" ? texts.profile.resume.removed : texts.profile.resume.saved);
      onSaved();
    },
    onError: () => toast(texts.profile.resume.error, "error"),
  });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast(texts.profile.resume.wrongType, "error");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      toast(texts.profile.resume.tooBig, "error");
      return;
    }
    try {
      const result = await upload.upload(file, "RESUME");
      await save.mutateAsync({ resumeUrl: result.cdnUrl, resumeName: file.name });
    } catch {
      toast(texts.profile.resume.error, "error");
    }
  };

  // Baixar de verdade (com o nome do arquivo) quando o storage permite ler daqui; se não permitir,
  // abre o PDF numa aba — o navegador oferece salvar de qualquer jeito.
  const download = async () => {
    const url = resolveCdnUrl(resumeUrl);
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = resumeName || "curriculo.pdf";
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const busy = upload.status === "uploading" || save.isPending;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full gap-1.5"
        onClick={() => setOpen(true)}
      >
        <FileText className="h-4 w-4" />

        <>{texts.profile.resume.action}</>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-normal">{texts.profile.resume.title}</DialogTitle>
          </DialogHeader>

          <p className="text-xs font-normal text-text-subtle">{texts.profile.resume.hint}</p>

          <div className="flex flex-wrap items-center gap-2">
            {resumeUrl ? (
              <>
                <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-normal text-text-strong">
                  <FileText className="h-4 w-4 shrink-0" aria-hidden />

                  <span className="truncate">{resumeName || "curriculo.pdf"}</span>
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={busy}
                  onClick={() => void download()}
                >
                  {texts.profile.resume.download}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full gap-1.5 text-destructive hover:text-destructive"
                  disabled={busy}
                  onClick={() => save.mutate({ resumeUrl: "", resumeName: "" })}
                >
                  <X className="h-4 w-4" />

                  <>{texts.profile.resume.remove}</>
                </Button>
              </>
            ) : (
              <span className="text-sm font-normal text-text-subtle">
                {texts.profile.resume.empty}
              </span>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void handleFile(file);
            }}
          />

          <Button
            className="rounded-full gap-1.5"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" />

            <>{busy ? texts.profile.resume.sending : texts.profile.resume.upload}</>
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
