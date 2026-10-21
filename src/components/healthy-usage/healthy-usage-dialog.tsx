import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { TOPICS, TOPIC_LABELS } from "@/constants/community-topics";
import { texts } from "@/texts";
import { HeartPulse } from "lucide-react";

import { preferencesApi } from "@/lib/api";
import {
  HEALTHY_USAGE_MAX_MINUTES,
  HEALTHY_USAGE_MIN_MINUTES,
  clampMinutes,
  readHealthyUsage,
  writeHealthyUsage,
} from "@/lib/healthy-usage";
import { usePersonalization } from "@/lib/use-personalization";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

/** Os assuntos reais da plataforma (mesma taxonomia das comunidades); "Todas" não é assunto. */
const TOPIC_OPTIONS = TOPICS.filter((topic) => topic !== "Todas");

/** Módulos desativáveis — os mesmos identificadores que o backend valida. */
const MODULE_OPTIONS: { id: string; label: string; hint?: string }[] = [
  { id: "COMMUNITIES", label: texts.navigation.items.communities },
  { id: "GROUPS", label: texts.navigation.items.groups },
  { id: "MESSAGES", label: texts.navigation.items.messages },
  { id: "BLOGS", label: texts.navigation.items.blogs },
  { id: "JOBS", label: texts.navigation.items.jobs },
  { id: "COMPANIES", label: texts.navigation.items.companies },
  { id: "MENTORING", label: texts.navigation.items.mentoring },
  {
    id: "EVENTS",
    label: texts.navigation.items.events,
    hint: texts.personalization.eventsDependency,
  },
  { id: "DAILY_GAMES", label: "Jogos diários" },
  { id: "COMMUNITY_GAMES", label: "Jogos da comunidade" },
];

/**
 * Uso saudável: o lembrete de pausa (local, do aparelho) + o centro de personalização
 * (assuntos preferidos, assuntos que não gosto e módulos desativados — com a fonte única
 * no backend, aplicada na navegação, nos feeds e nas recomendações).
 */
export function HealthyUsageDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);
  const [minutes, setMinutes] = useState(30);
  const [liked, setLiked] = useState<string[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [disabledModules, setDisabledModules] = useState<string[]>([]);
  const [nightRestReminder, setNightRestReminder] = useState(true);

  const { data: personalization } = usePersonalization();

  useEffect(() => {
    if (!open) return;
    const config = readHealthyUsage();
    setEnabled(config.enabled);
    setMinutes(config.minutes);
  }, [open]);

  useEffect(() => {
    if (!open || !personalization) return;
    setLiked(personalization.likedTopics);
    setBlocked(personalization.blockedTopics);
    setDisabledModules(personalization.disabledModules);
    setNightRestReminder(personalization.nightRestReminder);
  }, [open, personalization]);

  // Um assunto não pode estar nos dois lados: marcar num remove do outro (o backend recusa
  // o conflito, e a tela evita chegar lá).
  const toggleLiked = (topic: string) => {
    setLiked((current) =>
      current.includes(topic) ? current.filter((value) => value !== topic) : [...current, topic],
    );
    setBlocked((current) => current.filter((value) => value !== topic));
  };

  const toggleBlocked = (topic: string) => {
    setBlocked((current) =>
      current.includes(topic) ? current.filter((value) => value !== topic) : [...current, topic],
    );
    setLiked((current) => current.filter((value) => value !== topic));
  };

  const toggleModule = (module: string, off: boolean) => {
    setDisabledModules((current) =>
      off ? [...current, module] : current.filter((value) => value !== module),
    );
  };

  const save = useMutation({
    mutationFn: () =>
      preferencesApi.setPersonalization({
        likedTopics: liked,
        blockedTopics: blocked,
        disabledModules,
        nightRestReminder,
      }),
    onSuccess: () => {
      writeHealthyUsage({ enabled, minutes: clampMinutes(minutes) });
      void queryClient.invalidateQueries({ queryKey: ["personalization"] });
      toast(texts.personalization.saved, "success");
      onOpenChange(false);
    },
    onError: (error) =>
      toast(error instanceof Error ? error.message : texts.personalization.saveError, "error"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-normal">
            <HeartPulse className="h-5 w-5 text-primary" />

            <>{texts.account.healthyUsage.title}</>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-1">
          <p className="text-sm text-muted-foreground">{texts.account.healthyUsage.description}</p>

          <label className="flex items-start justify-between gap-3 rounded-2xl border border-border-soft bg-surface-card p-3">
            <span className="min-w-0">
              <span className="block text-sm font-medium text-text-strong">
                {texts.account.healthyUsage.switchLabel}
              </span>

              <span className="mt-0.5 block text-xs text-text-subtle">
                {texts.account.healthyUsage.switchHint}
              </span>
            </span>

            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-text-strong">
              {texts.account.healthyUsage.minutesLabel}
            </span>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={HEALTHY_USAGE_MIN_MINUTES}
                max={HEALTHY_USAGE_MAX_MINUTES}
                value={minutes}
                disabled={!enabled}
                onChange={(event) => setMinutes(Number(event.target.value))}
                className="w-28"
              />

              <span className="text-sm text-text-subtle">
                {texts.account.healthyUsage.minutesUnit}
              </span>
            </div>

            <span className="block text-xs text-text-subtle">
              {texts.account.healthyUsage.minutesHint}
            </span>
          </label>

          <label className="flex items-start justify-between gap-3 rounded-2xl border border-border-soft bg-surface-card p-3">
            <span className="min-w-0">
              <span className="block text-sm font-medium text-text-strong">
                {texts.account.healthyUsage.nightRestTitle}
              </span>

              <span className="mt-0.5 block text-xs text-text-subtle">
                {texts.account.healthyUsage.nightRestDescription}
              </span>
            </span>

            <Switch checked={nightRestReminder} onCheckedChange={setNightRestReminder} />
          </label>

          <section className="space-y-2 border-t border-border-soft pt-4">
            <h3 className="text-sm font-semibold text-text-strong">
              {texts.personalization.likeTitle}
            </h3>

            <p className="text-xs text-text-subtle">{texts.personalization.likeHint}</p>

            <div className="flex flex-wrap gap-1.5">
              {TOPIC_OPTIONS.map((topic) => (
                <Pill key={topic} active={liked.includes(topic)} onClick={() => toggleLiked(topic)}>
                  {TOPIC_LABELS[topic]}
                </Pill>
              ))}
            </div>
          </section>

          <section className="space-y-2 border-t border-border-soft pt-4">
            <h3 className="text-sm font-semibold text-text-strong">
              {texts.personalization.dislikeTitle}
            </h3>

            <p className="text-xs text-text-subtle">{texts.personalization.dislikeHint}</p>

            <div className="flex flex-wrap gap-1.5">
              {TOPIC_OPTIONS.map((topic) => (
                <Pill
                  key={topic}
                  active={blocked.includes(topic)}
                  onClick={() => toggleBlocked(topic)}
                >
                  {TOPIC_LABELS[topic]}
                </Pill>
              ))}
            </div>
          </section>

          <section className="space-y-2 border-t border-border-soft pt-4">
            <h3 className="text-sm font-semibold text-text-strong">
              {texts.personalization.modulesTitle}
            </h3>

            <p className="text-xs text-text-subtle">{texts.personalization.modulesHint}</p>

            <div className="space-y-1">
              {MODULE_OPTIONS.map((module) => {
                const off = disabledModules.includes(module.id);

                return (
                  <label
                    key={module.id}
                    className="flex items-start justify-between gap-3 rounded-xl px-1 py-2"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm text-text-strong">{module.label}</span>

                      {module.hint && (
                        <span className="mt-0.5 block text-xs text-text-subtle">{module.hint}</span>
                      )}
                    </span>

                    <Switch checked={!off} onCheckedChange={(on) => toggleModule(module.id, !on)} />
                  </label>
                );
              })}
            </div>
          </section>

          <div className="flex justify-end border-t border-border-soft pt-4">
            <Button
              className="rounded-full"
              disabled={save.isPending}
              onClick={() => save.mutate()}
            >
              {texts.account.healthyUsage.save}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
