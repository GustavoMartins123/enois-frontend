import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { BlogPostFormat } from "@/types/application/blog/blog-post-format";
import type { BlogPostDialogProps } from "@/types/components/blog/blog-post-dialog-props";
import { Eye, PenLine } from "lucide-react";

import { blogsApi } from "@/lib/api/blogs";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { useToast } from "@/components/ui/toast";

import { HtmlEditor } from "@/components/html-editor";
import { MentionTextarea } from "@/components/mention-textarea";
import { RichText } from "@/components/post/rich-text";

/**
 * Escrever um post do blog.
 *
 * Dois caminhos, porque o público é misto: "Texto" é o modo de quem sabe usar o Word ou o Obsidian —
 * a barra de formatação escreve markdown simples (# título, **negrito**, - lista) e a prévia mostra
 * como fica; "HTML/CSS" é o editor livre, o mesmo das páginas do perfil. Nos dois casos o backend
 * guarda o que a pessoa escreveu (markdown como markdown, HTML sanitizado).
 */
export function BlogPostDialog({ open, onOpenChange, post }: BlogPostDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [format, setFormat] = useState<BlogPostFormat>("MARKDOWN");
  const [preview, setPreview] = useState(false);
  // Só no post NOVO faz sentido perguntar: editar nunca reenvia e-mail.
  const [avisar, setAvisar] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(post?.title ?? "");
    setBody(post?.body ?? "");
    setFormat(post?.bodyFormat ?? "MARKDOWN");
    setPreview(false);
    setAvisar(true);
    setError(null);
  }, [open, post]);

  const publish = useMutation({
    mutationFn: () =>
      post
        ? blogsApi.editPost(post.id, { title, body, format })
        : blogsApi.publish({ title, body, format, notifySubscribers: avisar }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast(post ? texts.blog.editor.updated : texts.blog.editor.published);
      onOpenChange(false);
    },
    onError: (err) => setError(err instanceof Error ? err.message : texts.blog.editor.error),
  });

  const canPublish = title.trim().length > 0 && body.trim().length > 0 && !publish.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-normal">
            {post ? texts.blog.editor.editPost : texts.blog.newPost}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={texts.blog.editor.postTitle}
            maxLength={200}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Pill active={format === "MARKDOWN"} onClick={() => setFormat("MARKDOWN")} size="md">
              {texts.blog.editor.modeText}
            </Pill>

            <Pill active={format === "HTML"} onClick={() => setFormat("HTML")} size="md">
              {texts.blog.editor.modeHtml}
            </Pill>

            {format === "MARKDOWN" && (
              <Pill active={preview} onClick={() => setPreview((current) => !current)} size="md">
                {preview ? (
                  <span className="inline-flex items-center gap-1.5">
                    <PenLine className="h-3.5 w-3.5" aria-hidden />

                    <>{texts.blog.editor.write}</>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" aria-hidden />

                    <>{texts.blog.editor.preview}</>
                  </span>
                )}
              </Pill>
            )}
          </div>

          {format === "MARKDOWN" ? (
            <div className="space-y-2">
              {preview ? (
                <div className="min-h-40 rounded-2xl border border-border bg-muted/40 px-3 py-2">
                  <RichText
                    content={body}
                    className="whitespace-pre-line break-words text-sm font-normal leading-relaxed text-text-strong"
                  />
                </div>
              ) : (
                <MentionTextarea
                  value={body}
                  onChange={(value) => setBody(value)}
                  placeholder={texts.blog.editor.textHint}
                  className="min-h-40 rounded-2xl border border-border bg-muted/40 px-3 py-2 text-sm font-normal"
                  maxLength={20_000}
                  toolbar
                />
              )}

              <p className="text-xs font-normal text-text-subtle">{texts.blog.editor.textHint}</p>
            </div>
          ) : (
            <HtmlEditor
              id="blog-post-html"
              value={body}
              onChange={setBody}
              label={texts.blog.editor.modeHtml}
              description={texts.blog.editor.htmlHint}
              placeholder={
                '<style>\n.post { color: #f4efff; }\n</style>\n<article class="post">...</article>'
              }
              emptyPreview="Cole um HTML para ver a pré-visualização."
              frameTitle={texts.blog.newPost}
              maxLength={20_000}
              previewClassName="-mx-3 -mb-3 mt-3 h-[320px] w-full"
            />
          )}

          {!post && (
            <label className="flex items-start gap-2 text-xs font-normal text-text-subtle">
              <input
                type="checkbox"
                checked={avisar}
                onChange={(event) => setAvisar(event.target.checked)}
                className="mt-0.5"
              />

              <span>
                <span className="block font-medium text-text-strong">
                  {texts.blog.editor.notifySubscribers}
                </span>

                {texts.blog.editor.notifySubscribersHint}
              </span>
            </label>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
              {texts.common.cancel}
            </Button>

            <Button size="sm" onClick={() => publish.mutate()} disabled={!canPublish}>
              {publish.isPending
                ? texts.common.publishing
                : post
                  ? texts.blog.editor.savePost
                  : texts.blog.editor.publish}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
