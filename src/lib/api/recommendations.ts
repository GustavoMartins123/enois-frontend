import { api } from "../api-client";

export interface Recommendation {
  id: string;
  recommenderId: string;
  recommendedId: string;
  comment: string;
  createdAt: string;
}

export interface CreateRecommendationInput {
  comment: string;
}

export const recommendationsApi = {
  create: (targetId: string, data: CreateRecommendationInput) =>
    api.post<Recommendation>(`/recommendations/${targetId}`, data),

  listReceived: (userId: string) =>
    api.get<Recommendation[]>(`/recommendations/received/${userId}`),
};
