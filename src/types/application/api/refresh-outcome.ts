/**
 * Resultado de tentar renovar a sessão.
 *
 * `refused` é o único caso em que a sessão ACABOU (o servidor recusou o refresh token). `unavailable`
 * é falha passageira — 429 do limitador, 502 de deploy, queda de rede: nada disso prova que a sessão
 * morreu, e tratar como morte era o que deslogava a pessoa sem motivo.
 */
export type RefreshOutcome = "renewed" | "refused" | "unavailable";
