import type { HttpMethod } from "./http-method";

export type ApiEndpoint = {
  method: HttpMethod;
  path: string;
  /** public = nao pede sessao; auth = sessao do Énóis; admin = sessao de administrador. */
  access: "public" | "auth" | "admin";
  description: string;
  request?: string;
  response?: string;
};
