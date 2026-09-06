import type { Education } from "./education";

export type EducationRequest = Pick<Education, "school" | "degree" | "field"> &
  Partial<Pick<Education, "description" | "startDate" | "endDate">>;
