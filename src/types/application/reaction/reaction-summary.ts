import type { ReactionType } from "./reaction-type";

/**
 * Contagem por tipo de reação. As chaves são parciais: a API só devolve os tipos que existem no
 * post, e o otimismo remove a chave quando o contador chega a zero.
 */
export type ReactionSummary = Partial<Record<ReactionType, number>>;
