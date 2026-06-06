import { api } from "../api-client";

export interface Profile {
  id: string;
  username: string;
  name: string;
  headline: string;
  email: string;
  company: string | null;
  location: string | null;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  skills: string[];
  goals: string[];
  availability: string | null;
  portfolio: string | null;
  externalLinks: string[];
  openToWork: boolean;
  isMentor: boolean;
  connectionsCount: number;
  followersCount: number;
  reputation: number;
}

export interface ProfileUpdate {
  name?: string;
  headline?: string;
  company?: string | null;
  location?: string | null;
  bio?: string | null;
  skills?: string[];
  goals?: string[];
  availability?: string | null;
  portfolio?: string | null;
  externalLinks?: string[];
  avatar?: string | null;
  banner?: string | null;
  openToWork?: boolean;
}

export interface Experience {
  id: string;
  title: string;
  org: string;
  period: string;
  desc: string;
}

export interface Education {
  id: string;
  title: string;
  org: string;
  period: string;
  desc: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: string;
}

export const profileApi = {
  me: () => api.get<Profile>("/me"),

  get: (username: string) => api.get<Profile>(`/users/${username}`),

  update: (data: ProfileUpdate) => api.patch<Profile>("/me/profile", data),

  experiences: {
    list: () => api.get<Experience[]>("/me/experiences"),
    create: (data: Omit<Experience, "id">) => api.post<Experience>("/me/experiences", data),
    delete: (id: string) => api.delete<void>(`/me/experiences/${id}`),
  },

  education: {
    list: () => api.get<Education[]>("/me/education"),
    create: (data: Omit<Education, "id">) => api.post<Education>("/me/education", data),
    delete: (id: string) => api.delete<void>(`/me/education/${id}`),
  },

  certifications: {
    list: () => api.get<Certification[]>("/me/certifications"),
    create: (data: Omit<Certification, "id">) =>
      api.post<Certification>("/me/certifications", data),
    delete: (id: string) => api.delete<void>(`/me/certifications/${id}`),
  },
};
