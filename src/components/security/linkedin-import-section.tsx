import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { LinkedinImportPreview } from "@/types/application/profile/linkedin-import-preview";

import { preferencesApi, profileApi, projectsApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/**
 * Importar o ARQUIVO DE DADOS do LinkedIn (Configurações → "Obter uma cópia dos seus
 * dados" → ZIP). O backend parseia e DEVOLVE o retrato; nada é salvo automaticamente —
 * a pessoa marca o que quer e o app cria experiencias, formação, certificações e
 * projetos pelos endpoints normais.
 */
export function LinkedinImportSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [preview, setPreview] = useState<LinkedinImportPreview | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const importar = useMutation({
    mutationFn: (file: File) => preferencesApi.importLinkedinArchive(file),
    onSuccess: (preview) => {
      setPreview(preview);
      setSelected({
        ...Object.fromEntries(preview.experiences.map((_, i) => [`exp${i}`, true])),
        ...Object.fromEntries(preview.education.map((_, i) => [`edu${i}`, true])),
        ...Object.fromEntries(preview.certifications.map((_, i) => [`cert${i}`, true])),
        ...Object.fromEntries(preview.projects.map((_, i) => [`proj${i}`, true])),
      });
    },
    onError: (error) => toast(error.message, "error"),
  });

  const salvar = useMutation({
    mutationFn: async () => {
      if (!preview) return;
      const saves: Promise<unknown>[] = [];
      preview.experiences.forEach((exp, i) => {
        if (!selected[`exp${i}`]) return;
        saves.push(
          profileApi.experiences.create({
            title: exp.title ?? "",
            company: exp.company ?? "",
            location: exp.location,
            description: exp.description,
            startDate: exp.startDate,
            endDate: exp.endDate,
          }),
        );
      });
      preview.education.forEach((edu, i) => {
        if (!selected[`edu${i}`]) return;
        saves.push(
          profileApi.education.create({
            school: edu.school ?? "",
            degree: edu.degree ?? "",
            field: edu.field ?? "",
            description: edu.description,
            startDate: edu.startDate,
            endDate: edu.endDate,
          }),
        );
      });
      preview.certifications.forEach((cert, i) => {
        if (!selected[`cert${i}`]) return;
        saves.push(
          profileApi.certifications.create({
            name: cert.name,
            issuer: cert.issuer ?? "",
            description: null,
            issueDate: cert.issueDate,
            expirationDate: null,
            credentialUrl: null,
          }),
        );
      });
      preview.projects.forEach((project, i) => {
        if (!selected[`proj${i}`]) return;
        saves.push(
          projectsApi.create({
            title: project.title ?? "",
            stack: [],
            repoUrl: project.url,
            status: null,
            diary: [],
            html: null,
          }),
        );
      });
      await Promise.all(saves);
      return saves.length;
    },
    onSuccess: (count) => {
      toast(texts.account.linkedinImport.done(count ?? 0));
      setPreview(null);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => toast(error.message, "error"),
  });

  const toggle = (key: string) => setSelected((current) => ({ ...current, [key]: !current[key] }));

  const linhas = preview
    ? [
        ...preview.experiences.map((exp, i) => ({
          key: `exp${i}`,
          label: `${exp.title ?? ""} — ${exp.company ?? ""}`,
        })),
        ...preview.education.map((edu, i) => ({
          key: `edu${i}`,
          label: `${edu.school} — ${edu.degree || edu.field || ""}`,
        })),
        ...preview.certifications.map((cert, i) => ({ key: `cert${i}`, label: cert.name })),
        ...preview.projects.map((project, i) => ({ key: `proj${i}`, label: project.title })),
      ]
    : [];

  return (
    <div className="space-y-2 border-t border-border-soft pt-3">
      <p className="text-xs font-medium text-text-strong">{texts.account.linkedinImport.title}</p>

      <p className="text-xs font-normal text-text-subtle">{texts.account.linkedinImport.hint}</p>

      {!preview && (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-soft px-3 py-1.5 text-xs text-text-subtle transition hover:text-text-strong">
          {texts.account.linkedinImport.button}
          <input
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) importar.mutate(file);
              event.target.value = "";
            }}
          />
        </label>
      )}

      {importar.isPending && <p className="text-xs text-text-subtle">{texts.common.loading}</p>}

      {preview && (
        <div className="space-y-2">
          <p className="text-xs font-normal text-text-subtle">
            {texts.account.linkedinImport.found(preview.found)}
          </p>

          <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg bg-surface-1 p-2">
            {linhas.map((linha) => (
              <label key={linha.key} className="flex items-center gap-2 text-xs text-text-strong">
                <input
                  type="checkbox"
                  checked={selected[linha.key] ?? false}
                  onChange={() => toggle(linha.key)}
                />

                <span className="truncate">{linha.label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="rounded-full"
              disabled={salvar.isPending}
              onClick={() => salvar.mutate()}
            >
              {texts.account.linkedinImport.save}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="rounded-full"
              onClick={() => setPreview(null)}
            >
              {texts.common.cancel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
