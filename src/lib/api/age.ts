import type { ParentalInviteView } from "@/types/application/age/parental-invite-view";
import type { SupervisedMinorView } from "@/types/application/age/supervised-minor-view";

import { api } from "../api-client";

/** Supervisão parental (ECA Digital): convite do menor, aceite/recusa/revogação do responsável. */
export const parentalApi = {
  invite: (email: string) => api.post<ParentalInviteView>("/age/parental/invite", { email }),

  accept: (token: string) =>
    api.post<{ id: string; status: string }>("/age/parental/accept", { token }),

  reject: (token: string) =>
    api.post<{ id: string; status: string }>("/age/parental/reject", { token }),

  revoke: (minorUserId: string) =>
    api.post<{ id: string; status: string }>("/age/parental/revoke", { minorUserId }),

  /** Perfis que ESTE responsável supervisiona. */
  mine: () => api.get<SupervisedMinorView[]>("/age/parental/mine"),
};
