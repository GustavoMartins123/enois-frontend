import { api } from "@/lib/api-client";

export type WordMark = "CORRECT" | "PRESENT" | "ABSENT";
export type WordState = {
  date: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "WON" | "LOST";
  guesses: { word: string; marks: WordMark[] }[];
  streak: number;
};
export type WordLeaderboard = {
  items: { username: string; name: string; attempts: number; completedAt: string }[];
};

export const dailyWordsApi = {
  today: (date?: string) =>
    api.get<WordState>(
      `/daily-games/words/today${date ? `?date=${encodeURIComponent(date)}` : ""}`,
    ),
  start: () => api.post<WordState>("/daily-games/words/today/start"),
  guess: (guess: string, requestId: string, date?: string) =>
    api.post<WordState>(
      `/daily-games/words/today/guesses${date ? `?date=${encodeURIComponent(date)}` : ""}`,
      { guess, requestId },
    ),
  leaderboard: () => api.get<WordLeaderboard>("/daily-games/words/leaderboard"),
};

export type MazeDirection = "UP" | "RIGHT" | "DOWN" | "LEFT";
export type MazeState = {
  date: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "WON";
  passages: number[] | null;
  position: number;
  moves: number;
  startedAt: string | null;
  completedAt: string | null;
};
export type MazeLeaderboard = {
  items: { username: string; name: string; elapsedMillis: number; moves: number }[];
};
export const dailyMazeApi = {
  today: (date?: string) =>
    api.get<MazeState>(`/daily-games/maze/today${date ? `?date=${encodeURIComponent(date)}` : ""}`),
  start: () => api.post<MazeState>("/daily-games/maze/today/start"),
  move: (direction: MazeDirection, requestId: string, date?: string) =>
    api.post<MazeState>(
      `/daily-games/maze/today/moves${date ? `?date=${encodeURIComponent(date)}` : ""}`,
      { direction, requestId },
    ),
  leaderboard: () => api.get<MazeLeaderboard>("/daily-games/maze/leaderboard"),
};

export type BlocksAction = "LEFT" | "RIGHT" | "ROTATE" | "SOFT_DROP" | "HARD_DROP" | "WAIT";
export type BlocksCell = { x: number; y: number };
export type BlocksState = {
  date: string;
  status: "NOT_STARTED" | "PLAYING" | "WON" | "LOST" | "TIMED_OUT";
  score: number;
  lines: number;
  actions: number;
  board: string[];
  activeCells: BlocksCell[];
  nextCells: BlocksCell[];
  // Sequência oficial de próximas peças (índices de SHAPES, máx. 100) após a peça ativa.
  // Vazia quando status != PLAYING (ou em servidores pré-fix).
  pieces: number[];
  rulesVersion: number;
};
export type BlocksLeaderboard = {
  items: { username: string; name: string; score: number; lines: number; elapsedMillis: number }[];
};
export const dailyBlocksApi = {
  today: (date?: string) =>
    api.get<BlocksState>(
      `/daily-games/blocks/today${date ? `?date=${encodeURIComponent(date)}` : ""}`,
    ),
  start: () => api.post<BlocksState>("/daily-games/blocks/today/start"),
  action: (action: BlocksAction, requestId: string, date?: string) =>
    api.post<BlocksState>(
      `/daily-games/blocks/today/actions${date ? `?date=${encodeURIComponent(date)}` : ""}`,
      { action, requestId },
    ),
  leaderboard: () => api.get<BlocksLeaderboard>("/daily-games/blocks/leaderboard"),
};

export function previousChallengeDate(date: string): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

export type GamePrizeTable = {
  tiers: { label: string; amount: number }[];
};

export const dailyGamesRewardsApi = {
  prizes: () => api.get<GamePrizeTable>("/daily-games/rewards/prizes"),
};
