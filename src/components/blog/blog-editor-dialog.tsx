import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { BlogEditorDialogProps } from "@/types/components/blog/blog-editor-dialog-props";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Textarea,
} from "@rede-enois/design-system/ui";

import { blogsApi } from "@/lib/api/blogs";

import { HtmlEditor } from "@/components/html-editor";

/**
 * Criar/editar o blog: nome, descrição e o tema em HTML/CSS.
 *
 * O tema é o mesmo editor (e o mesmo quadro isolado) das páginas do perfil — HTML e CSS livres,
 * sanitizados no backend. Vazio = cabeçalho padrão do blog.
 */
export function BlogEditorDialog({ open, onOpenChange, blog }: BlogEditorDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [themeHtml, setThemeHtml] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Abriu o diálogo: parte do que já existe (edição) ou do zero (criação).
  useEffect(() => {
    if (!open) return;
    setTitle(blog?.title ?? "");
    setDescription(blog?.description ?? "");
    setThemeHtml(blog?.themeHtml ?? "");
    setError(null);
  }, [open, blog]);

  const save = useMutation({
    mutationFn: () => blogsApi.save({ title, description, themeHtml }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      onOpenChange(false);
    },
    onError: (err) => setError(err instanceof Error ? err.message : texts.blog.editor.error),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-normal">
            {blog ? texts.blog.edit : texts.blog.create}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <p className="text-sm font-normal text-text-subtle">{texts.blog.editor.blogTitle}</p>

            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-normal text-text-subtle">
              {texts.blog.editor.blogDescription}
            </p>

            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <HtmlEditor
            id="blog-theme-html"
            value={themeHtml}
            onChange={setThemeHtml}
            label={texts.blog.editor.theme}
            description={texts.blog.editor.themeHint}
            placeholder={
              '<style>\n.capa { background: #151515; }\n</style>\n<div class="capa">...</div>'
            }
            emptyPreview="Cole um HTML para ver a pré-visualização."
            frameTitle={texts.blog.title}
            maxLength={20_000}
            previewClassName="-mx-3 -mb-3 mt-3 h-[280px] w-full"
          />

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
              {texts.common.cancel}
            </Button>

            <Button
              size="sm"
              onClick={() => save.mutate()}
              disabled={!title.trim() || save.isPending}
            >
              {save.isPending ? texts.common.saving : texts.blog.editor.save}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
