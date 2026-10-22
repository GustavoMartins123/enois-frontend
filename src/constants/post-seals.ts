import { texts } from "@/texts";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Copy,
  Feather,
  Heart,
  HelpCircle,
  Hourglass,
  LifeBuoy,
  Lightbulb,
  Star,
} from "lucide-react";

/**
 * Os nove selos de post (3x3 no seletor).
 *
 * Selo é a sinalização ao lado da reação: a comunidade marca o post no topo — o que presta
 * (importante, interessante, dica, ajuda, boa pergunta, inspirador) e o que não presta (duplicado,
 * fanfic, massante). Um por pessoa por post; o identificador é o mesmo do backend.
 */
export const POST_SEALS: { id: string; label: string; icon: LucideIcon; className: string }[] = [
  {
    id: "IMPORTANTE",
    label: texts.posts.seals.items.important,
    icon: AlertTriangle,
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  {
    id: "INTERESSANTE",
    label: texts.posts.seals.items.interesting,
    icon: Star,
    className: "border-opportunity/40 bg-opportunity/15 text-opportunity-foreground",
  },
  {
    id: "DICA",
    label: texts.posts.seals.items.tip,
    icon: Lightbulb,
    className: "border-highlight-insight-text/30 bg-highlight-insight text-highlight-insight-text",
  },
  {
    id: "AJUDA",
    label: texts.posts.seals.items.help,
    icon: LifeBuoy,
    className: "border-growth/30 bg-growth/10 text-growth",
  },
  {
    id: "DUPLICADO",
    label: texts.posts.seals.items.duplicate,
    icon: Copy,
    className: "border-border-soft bg-surface-2 text-text-subtle",
  },
  {
    id: "FANFIC",
    label: texts.posts.seals.items.fanfic,
    icon: Feather,
    className: "border-highlight-project-text/30 bg-highlight-project text-highlight-project-text",
  },
  {
    id: "MASSANTE",
    label: texts.posts.seals.items.tiring,
    icon: Hourglass,
    className: "border-border-soft bg-surface-2 text-text-subtle",
  },
  {
    id: "BOA_PERGUNTA",
    label: texts.posts.seals.items.goodQuestion,
    icon: HelpCircle,
    className: "border-highlight-article-text/30 bg-highlight-article text-highlight-article-text",
  },
  {
    id: "INSPIRADOR",
    label: texts.posts.seals.items.inspiring,
    icon: Heart,
    className: "border-primary/30 bg-primary-soft text-primary",
  },
];

/** O selo pelo id (a API devolve o identificador; a tela precisa do rótulo e do ícone). */
export function postSeal(id: string) {
  return POST_SEALS.find((seal) => seal.id === id) ?? null;
}
