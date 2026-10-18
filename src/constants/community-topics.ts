import { texts } from "@/texts";

/**
 * Os assuntos de comunidade, num lugar só.
 *
 * Viviam dentro da tela da vitrine, e o formulário de edição não os alcançava — foi assim que o
 * tópico ficou congelado no que foi escolhido na criação. Com a lista aqui, o filtro e o seletor
 * mostram exatamente os mesmos assuntos (inclusive "Outros").
 */
export const TOPICS = [
  "Todas",
  "TECNOLOGIA",
  "ENGENHARIA",
  "DESIGN",
  "PRODUTO",
  "LIDERANCA",
  "CARREIRA",
  "FREELANCE",
  "OUTROS",
] as const;

export const TOPIC_LABELS: Record<(typeof TOPICS)[number], string> = {
  Todas: texts.communities.topics.all,
  TECNOLOGIA: texts.communities.topics.TECNOLOGIA,
  ENGENHARIA: texts.communities.topics.ENGENHARIA,
  DESIGN: texts.communities.topics.DESIGN,
  PRODUTO: texts.communities.topics.PRODUTO,
  LIDERANCA: texts.communities.topics.LIDERANCA,
  CARREIRA: texts.communities.topics.CARREIRA,
  FREELANCE: texts.communities.topics.FREELANCE,
  OUTROS: texts.communities.topics.OUTROS,
};
