export type ListJobsParams = {
  query?: string;
  type?: string;
  level?: string;
  location?: string;
  skills?: string;
  /** A aba: INTERNAL (Énóis) ou EXTERNAL (agregadores) — sem o campo, mistura na 1a página. */
  source?: "INTERNAL" | "EXTERNAL";
  /** O filtro de agregador da aba externas. */
  platform?: string;
  cursor?: string | null;
  limit?: number;
};
