import { api } from "../api-client";

export interface SignupInput {
  name: string;
  role: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  headline: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface OAuthStartResponse {
  provider: "GOOGLE" | "APPLE";
  state: string;
  authorizationUrl: string;
}

export const authApi = {
  signup: (data: SignupInput) => api.post<AuthResponse>("/auth/signup", data),

  login: (data: LoginInput) => api.post<AuthResponse>("/auth/login", data),

  logout: () => api.post<void>("/auth/logout"),

  me: () => api.get<AuthUser>("/auth/me"),

  forgotPassword: (email: string) =>
    api.post<{ status: string }>("/auth/password/forgot", { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ status: string }>("/auth/password/reset", { token, password }),

  oauthStart: (provider: "GOOGLE" | "APPLE") =>
    api.get<OAuthStartResponse>(`/auth/oauth/${provider.toLowerCase()}/start`),
};
