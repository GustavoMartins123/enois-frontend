/**
 * Os filtros do catálogo de jogos.
 *
 * Listas FECHADAS de propósito: o backend só aceita estes valores (o filtro vira `LIKE` no banco, e
 * texto livre ali seria convite a consulta caríssima). Gênero é a lista curta que o criador escolhe
 * no painel; se um dia crescer, cresce aqui e nos dois lados.
 */
export const GAME_STAGES: { id: string; label: string }[] = [
  { id: "IN_DEVELOPMENT", label: "Em desenvolvimento" },
  { id: "DEMO", label: "Demo" },
  { id: "EARLY_ACCESS", label: "Acesso antecipado" },
  { id: "RELEASED", label: "Lançado" },
  { id: "PAUSED", label: "Pausado" },
];

export const GAME_GENRES: string[] = [
  "ACAO",
  "AVENTURA",
  "ARCADE",
  "PLATAFORMA",
  "PUZZLE",
  "RPG",
  "ESTRATEGIA",
  "SIMULACAO",
  "ESPORTE",
  "CORRIDA",
  "TERROR",
  "RITMO",
  "EDUCATIVO",
  "EXPERIMENTAL",
];
