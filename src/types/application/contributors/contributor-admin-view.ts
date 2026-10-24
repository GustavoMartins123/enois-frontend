import type { ContributorApplicationStatus } from "./contributor-application-status";

export type ContributorAdminView = {
  id: string;
  name: string;
  github: string;
  email: string;
  area: string | null;
  experience: string | null;
  message: string | null;
  status: ContributorApplicationStatus;
  acceptedTermsAt: string;
  createdAt: string;
};
