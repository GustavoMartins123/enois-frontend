import type { SupportCategory } from "./support-category";
import type { SupportStatus } from "./support-status";

export type SupportRequestView = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  contactEmail: string;
  imageUrl: string | null;
  category: SupportCategory;
  status: SupportStatus;
  createdAt: string;
};
