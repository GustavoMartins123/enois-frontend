import type { Experience } from "./experience";

export type ExperienceRequest = Pick<Experience, "title" | "company"> &
  Partial<Pick<Experience, "location" | "description" | "startDate" | "endDate">>;
