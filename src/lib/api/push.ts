import { api, buildQuery } from "../api-client";

export type PushConfig = {
  enabled: boolean;
  /** Chave publica VAPID (null quando o backend esta sem VAPID configurado). */
  publicKey: string | null;
};

export type PushSubscriptionPayload = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export const pushApi = {
  config: () => api.get<PushConfig>("/push/config"),

  subscribe: (subscription: PushSubscriptionPayload) =>
    api.post<{ id: string }>("/push/subscriptions", subscription),

  unsubscribe: (endpoint: string) =>
    api.delete<void>(`/push/subscriptions${buildQuery({ endpoint })}`),
};
