import type { SupportRequestInput } from "@/types/application/support/support-request-input";
import type { SupportRequestView } from "@/types/application/support/support-request-view";

import { api } from "../api-client";

export const supportApi = {
  /** Abre um pedido de ajuda para ser atendido por uma pessoa do time. */
  open: (data: SupportRequestInput) => api.post<SupportRequestView>("/support/requests", data),
};
