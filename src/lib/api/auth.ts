import type { StatusResponse } from "@/types/application/api/status-response";
import type { AuthResponse } from "@/types/application/auth/auth-response";
import type { AuthUser } from "@/types/application/auth/auth-user";
import type { ChangeEmailInput } from "@/types/application/auth/change-email-input";
import type { ChangePasswordInput } from "@/types/application/auth/change-password-input";
import type { DeleteAccountInput } from "@/types/application/auth/delete-account-input";
import type { LinkedProvider } from "@/types/application/auth/linked-provider";
import type { LoginInput } from "@/types/application/auth/login-input";
import type { OAuthStartResponse } from "@/types/application/auth/oauth-start-response";
import type { SignupInput } from "@/types/application/auth/signup-input";
import type { SignupResult } from "@/types/application/auth/signup-result";

import { api } from "../api-client";

export const authApi = {
  /** Cria a conta pendente de confirmação e envia o link para o e-mail. */
  signup: (data: SignupInput) => api.post<SignupResult>("/auth/signup", data),

  /** Confirma o e-mail pelo token do link e já devolve a sessão. */
  verifyEmail: (token: string) => api.post<AuthResponse>("/auth/email/verify", { token }),

  /** Reenvia o link de confirmação (sempre 202, sem revelar se o e-mail existe). */
  resendVerification: (email: string) => api.post<StatusResponse>("/auth/email/resend", { email }),

  login: (data: LoginInput) => api.post<AuthResponse>("/auth/login", data),

  refresh: (refreshToken: string) => api.post<AuthResponse>("/auth/refresh", { refreshToken }),

  logout: () => api.post<void>("/auth/logout"),

  me: () => api.get<AuthUser>("/auth/me"),

  changeEmail: (data: ChangeEmailInput) => api.post<StatusResponse>("/auth/email/change", data),

  changePassword: (data: ChangePasswordInput) =>
    api.post<StatusResponse>("/auth/password/change", data),

  deleteAccount: (data: DeleteAccountInput) =>
    api.post<StatusResponse>("/auth/account/delete", data),

  forgotPassword: (email: string) => api.post<StatusResponse>("/auth/password/forgot", { email }),

  resetPassword: (token: string, password: string) =>
    api.post<StatusResponse>("/auth/password/reset", { token, password }),

  oauthStart: (provider: OAuthStartResponse["provider"]) =>
    api.get<OAuthStartResponse>(`/auth/oauth/${provider.toLowerCase()}/start`),

  /** Provedores vinculados à conta (para vincular/desvincular). */
  oauthProviders: () => api.get<LinkedProvider[]>("/auth/oauth/providers"),

  /** Inicia a vinculação do provedor à conta logada (o callback conclui). */
  oauthLinkStart: (provider: OAuthStartResponse["provider"]) =>
    api.post<OAuthStartResponse>(`/auth/oauth/${provider.toLowerCase()}/link`),

  oauthUnlink: (provider: string) =>
    api.delete<StatusResponse>(`/auth/oauth/${provider.toLowerCase()}/link`),
};