import { api, buildQuery } from "../api-client";

export interface RankingUser {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  reputation: number;
}

export const rankingApi = {
  list: (limit = 20) => api.get<RankingUser[]>(`/profile/ranking${buildQuery({ limit })}`),
};
