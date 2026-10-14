import type { StatusResponse } from "@/types/application/api/status-response";
import type { AuthResponse } from "@/types/application/auth/auth-response";
import type { AuthUser } from "@/types/application/auth/auth-user";
import type { ChangeEmailInput } from "@/types/application/auth/change-email-input";
import type { LoginInput } from "@/types/application/auth/login-input";
import type { OAuthStartResponse } from "@/types/application/auth/oauth-start-response";
import type { SignupInput } from "@/types/application/auth/signup-input";

import { api } from "../api-client";

export const authApi = {
  signup: (data: SignupInput) => api.post<AuthResponse>("/auth/signup", data),

  login: (data: LoginInput) => api.post<AuthResponse>("/auth/login", data),

  refresh: (refreshToken: string) => api.post<AuthResponse>("/auth/refresh", { refreshToken }),

  logout: () => api.post<void>("/auth/logout"),

  me: () => api.get<AuthUser>("/auth/me"),

  changeEmail: (data: ChangeEmailInput) => api.post<StatusResponse>("/auth/email/change", data),

  forgotPassword: (email: string) => api.post<StatusResponse>("/auth/password/forgot", { email }),

  resetPassword: (token: string, password: string) =>
    api.post<StatusResponse>("/auth/password/reset", { token, password }),

  oauthStart: (provider: OAuthStartResponse["provider"]) =>
    api.get<OAuthStartResponse>(`/auth/oauth/${provider.toLowerCase()}/start`),

  oauthCallback: (provider: string, code: string, state: string) =>
    api.get<AuthResponse>(
      `/auth/oauth/${provider}/callback${new URLSearchParams({ code, state }).toString()}`,
    ),
};
