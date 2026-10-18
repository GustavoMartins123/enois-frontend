import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";
import { Palette, ShieldAlert } from "lucide-react";

import { themesApi } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";
import { usePreferencesStore } from "@/stores/preferences.store";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/temas")({
  head: () => ({ meta: [{ title: texts.themeGallery.seoTitle }] }),
  component: Galeria,
});

/** Miniatura real: renderiza os tokens do pacote (fundo, superfície, destaque). */
function Miniatura({ packageJson }: { packageJson: string }) {
  let bg = "#f5f5f5", surface = "#ffffff", primary = "#7c3aed";
  try {
    const palette = JSON.parse(packageJson).palette;
    bg = palette.background ?? bg;
    surface = palette.surface ?? surface;
    primary = palette.primary ?? primary;
  } catch {
    // pacote invalido não chega aqui (o backend valida), mas o preview não pode quebrar
  }

  return (
    <div className="h-16 w-full rounded-md border border-border-soft p-1.5" style={{ background: bg }}>
      <div className="flex h-full flex-col justify-center gap-1 rounded-sm p-1.5" style={{ background: surface }}>
        <div className="h-1.5 w-2/3 rounded-full" style={{ background: primary }} />
        <div className="h-1 w-full rounded-full opacity-60" style={{ background: primary }} />
        <div className="mt-0.5 h-1 w-3/5 rounded-full opacity-40" style={{ background: primary }} />
      </div>
    </div>
  );
}

function Galeria() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const setThemeSettings = usePreferencesStore((state) => state.setThemeSettings);

  const { data, isLoading } = useQuery({
    queryKey: ["theme-gallery"],
    queryFn: () => themesApi.list(60),
  });

  const install = useMutation({
    mutationFn: (themeId: string) => themesApi.install(themeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["theme-gallery"] });
    },
  });

  const report = useMutation({
    mutationFn: (themeId: string) => themesApi.report(themeId),
    onSuccess: () => toast("Denúncia registrada. Obrigada por cuidar da rede.", "success"),
    onError: () => toast("Não foi possível denunciar.", "error"),
  });

  const themes = data ?? [];

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Temas da comunidade</h1>

          <p className="text-sm text-muted-foreground">
            Temas criados pela própria rede, feitos só de cores — sem CSS livre, sem imagens.
            Instalar aplica na hora e você volta ao seu tema quando quiser.
          </p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : themes.length === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-surface-card">
            <EmptyState icon={Palette} title="Nenhum tema publicado ainda." />
            <p className="pb-6 text-center text-xs text-text-subtle">
              Personalize o seu no menu de aparência e publique aqui.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {themes.map((theme) => (
              <li key={theme.id} className="surface-card space-y-2 p-4">
                <Miniatura packageJson={theme.packageJson} />

                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-text-strong">{theme.name}</h3>

                  <span className="ml-auto shrink-0 text-[11px] text-text-subtle">
                    {theme.installs} {theme.installs === 1 ? "instalação" : "instalações"}
                  </span>
                </div>

                {theme.description && (
                  <p className="text-xs text-text-subtle">{theme.description}</p>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      install.mutate(theme.id);
                      try {
                        const pkg = JSON.parse(theme.packageJson);
                        const accent = hexToHsv(pkg.palette?.primary ?? "#7c3aed");
                        const bg = hexToHsv(pkg.palette?.background ?? "#ffffff");
                        // O motor de temas é o mesmo do diálogo de aparência: accent +
                        // fundo regeneram todos os tokens (o texto é derivado com contraste).
                        setThemeSettings({
                          accent: { hue: accent.h, chroma: Math.min(0.28, accent.s * 0.7), lightness: 0.5 },
                          background: { hue: bg.h, chroma: Math.min(0.03, bg.s * 0.06) },
                        });
                        install.mutate(theme.id);
                        toast("Tema aplicado!", "success");
                      } catch {
                        toast("Não foi possível aplicar o tema.", "error");
                      }
                    }}
                  >
                    Aplicar
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-destructive"
                    onClick={() => report.mutate(theme.id)}
                    disabled={report.isPending}
                  >
                    Denunciar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppContainer>
  );
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return { h: hue, s: max === 0 ? 0 : d / max, v: max };
}
