import type { SuspiciousUserView } from "./suspicious-user-view";

export type SuspiciousUsersView = {
  items: SuspiciousUserView[];
  total: number;
  since: string;
  days: number;
};
