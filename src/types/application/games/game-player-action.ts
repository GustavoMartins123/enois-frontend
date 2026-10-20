export type GamePlayerAction =
  | { type: "start" }
  | { type: "frame-loaded" }
  | { type: "slow" }
  | { type: "loading"; progress: number | null }
  | { type: "ready" }
  | { type: "error"; message: string | null };
