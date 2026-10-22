import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { CommunityProjectView } from "@/types/application/projects/community-project-view";
import type { CommunityProjectFormState } from "@/types/components/projects/community-project-form-state";

import { communityProjectsApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

const EMPTY: CommunityProjectFormState = {
  title: "",
  shortDescription: "",
  description: "",
  url: "",
  repoUrl: "",
  tags: "",
  category: "",
  slug: "",
  cover: "",
};

/** Criar/editar projeto: mesma ficha do card e da página, sem mexer nos campos de jogo. */
export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: CommunityProjectView | null;
  onSaved?: (project: CommunityProjectView) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CommunityProjectFormState>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(
      project
        ? {
            title: project.title,
            shortDescription: project.shortDescription ?? "",
            description: project.description ?? "",
            url: project.url ?? "",
            repoUrl: project.repoUrl ?? "",
            tags: project.tags ?? "",
            category: project.category ?? "",
            slug: project.slug,
            cover: project.cover ?? "",
          }
        : EMPTY,
    );
  }, [open, project]);

  const save = useMutation({
    mutationFn: () => {
      const data = {
        title: form.title,
        shortDescription: form.shortDescription,
        description: form.description,
        url: form.url,
        repoUrl: form.repoUrl,
        tags: form.tags,
        category: form.category,
        slug: form.slug,
        cover: form.cover,
      };
      return project
        ? communityProjectsApi.edit(project.id, data)
        : communityProjectsApi.submit(data);
    },
    onSuccess: (saved) => {
      toast(project ? texts.projects.editor.updated : texts.projects.editor.sent, "success");
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      onSaved?.(saved);
      onOpenChange(false);
    },
    onError: (error) =>
      toast(error instanceof Error ? error.message : texts.projects.editor.error, "error"),
  });

  const field = (key: keyof CommunityProjectFormState) => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value })),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-normal">
            {project ? texts.projects.editor.editTitle : texts.projects.editor.createTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input placeholder={texts.projects.editor.title} maxLength={200} {...field("title")} />
          <Input
            placeholder={texts.projects.editor.shortDescription}
            maxLength={300}
            {...field("shortDescription")}
          />
          <Textarea
            placeholder={texts.projects.editor.description}
            rows={5}
            maxLength={4000}
            {...field("description")}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input placeholder={texts.projects.editor.url} {...field("url")} />
            <Input placeholder={texts.projects.editor.repoUrl} {...field("repoUrl")} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              placeholder={texts.projects.editor.category}
              maxLength={120}
              {...field("category")}
            />
            <Input placeholder={texts.projects.editor.tags} maxLength={500} {...field("tags")} />
          </div>

          <Input placeholder={texts.projects.editor.cover} {...field("cover")} />
          <Input placeholder={texts.projects.editor.slug} maxLength={120} {...field("slug")} />

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
              {texts.projects.editor.cancel}
            </Button>

            <Button
              className="rounded-full"
              disabled={save.isPending || form.title.trim().length < 3}
              onClick={() => save.mutate()}
            >
              {save.isPending ? texts.projects.editor.saving : texts.projects.editor.save}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
