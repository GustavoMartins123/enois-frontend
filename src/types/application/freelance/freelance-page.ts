import type { FreelanceView } from "./freelance-view";

export type FreelancePage = {
  items: FreelanceView[];
  nextCursor: string | null;
};
