import type { CreateRecommendationInput } from "@/types/application/recommendation/create-recommendation-input";
import type { Recommendation } from "@/types/application/recommendation/recommendation";

import { api } from "../api-client";

export const recommendationsApi = {
  create: (targetId: string, data: CreateRecommendationInput) =>
    api.post<Recommendation>(`/recommendations/${targetId}`, data),

  listReceived: (userId: string) =>
    api.get<Recommendation[]>(`/recommendations/received/${userId}`),
};
