import type { Recommendation } from "./recommendation";

export type CreateRecommendationInput = Pick<Recommendation, "comment">;
