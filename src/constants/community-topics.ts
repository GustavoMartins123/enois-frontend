import { texts } from "@/texts";

/**
 * Os assuntos da plataforma, num lugar só — comunidades, compositor e personalização leem daqui.
 *
 * Começaram como os tópicos de comunidade e foram ampliados conforme a rede deixou de ser só de
 * tecnologia: humor, saúde, casa, pets, família, política, fé, moda. Os oito originais continuam
 * primeiro e válidos — comunidades e posts antigos não mudam de mão. "Todas" é filtro de vitrine,
 * não assunto.
 *
 * A lista espelha ContentTaxonomy.TOPICS no backend; um assunto só vale se os dois lados o
 * conhecem.
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
  // O que a plataforma realmente abriga.
  "GAMES",
  "ART",
  "MUSIC",
  "EDUCACAO",
  "CIENCIA",
  "EMPREENDER",
  "FINANCAS",
  "MARKETING",
  "RH",
  "DADOS",
  // A rede é para todos os nichos, não só tech.
  "FUN",
  "QUALIDADE_VIDA",
  "SAUDE",
  "VIAGEM",
  "COMIDA",
  "ESPORTES",
  "CINEMA",
  "LIVROS",
  "FOTOGRAFIA",
  "CASA",
  "PETS",
  "PARENTALIDADE",
  "RELACIONAMENTOS",
  "MODA",
  "POLITICA",
  "RELIGIAO",
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
  GAMES: texts.communities.topics.GAMES,
  ART: texts.communities.topics.ART,
  MUSIC: texts.communities.topics.MUSIC,
  EDUCACAO: texts.communities.topics.EDUCACAO,
  CIENCIA: texts.communities.topics.CIENCIA,
  EMPREENDER: texts.communities.topics.EMPREENDER,
  FINANCAS: texts.communities.topics.FINANCAS,
  MARKETING: texts.communities.topics.MARKETING,
  RH: texts.communities.topics.RH,
  DADOS: texts.communities.topics.DADOS,
  FUN: texts.communities.topics.FUN,
  QUALIDADE_VIDA: texts.communities.topics.QUALIDADE_VIDA,
  SAUDE: texts.communities.topics.SAUDE,
  VIAGEM: texts.communities.topics.VIAGEM,
  COMIDA: texts.communities.topics.COMIDA,
  ESPORTES: texts.communities.topics.ESPORTES,
  CINEMA: texts.communities.topics.CINEMA,
  LIVROS: texts.communities.topics.LIVROS,
  FOTOGRAFIA: texts.communities.topics.FOTOGRAFIA,
  CASA: texts.communities.topics.CASA,
  PETS: texts.communities.topics.PETS,
  PARENTALIDADE: texts.communities.topics.PARENTALIDADE,
  RELACIONAMENTOS: texts.communities.topics.RELACIONAMENTOS,
  MODA: texts.communities.topics.MODA,
  POLITICA: texts.communities.topics.POLITICA,
  RELIGIAO: texts.communities.topics.RELIGIAO,
};
