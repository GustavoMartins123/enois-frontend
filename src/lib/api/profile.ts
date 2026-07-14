import { api } from "../api-client";

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  headline: string | null;
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
  connectionsCount?: number;
  followersCount?: number;
  reputation?: number;
}

export type Profile = UserProfile;

export interface UpdateProfileRequest {
  username?: string;
  name?: string;
  headline?: string | null;
  company?: string | null;
  location?: string | null;
  avatar?: string | null;
  banner?: string | null;
  bio?: string | null;
  skills?: string[];
  goals?: string[];
  availability?: string | null;
  portfolio?: string | null;
  externalLinks?: string[];
  openToWork?: boolean;
  isMentor?: boolean;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  currentlyHere: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface ExperienceRequest {
  title: string;
  company: string;
  location?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  description: string | null;
  currentlyHere: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface EducationRequest {
  school: string;
  degree: string;
  field: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  description: string | null;
  issueDate: string | null;
  expirationDate: string | null;
  credentialUrl: string | null;
}

export interface CertificationRequest {
  name: string;
  issuer: string;
  description?: string | null;
  issueDate?: string | null;
  expirationDate?: string | null;
  credentialUrl?: string | null;
}

export const profileApi = {
  me: () => api.get<Profile>("/me"),

  get: (username: string) => api.get<Profile>(`/users/${username}`),

  getById: (id: string) => api.get<Profile>(`/users/by-id/${id}`),

  update: (data: UpdateProfileRequest) => api.patch<Profile>("/me/profile", data),

  experiences: {
    list: () => api.get<Experience[]>("/me/experiences"),
    create: (data: ExperienceRequest) => api.post<Experience>("/me/experiences", data),
    update: (id: string, data: ExperienceRequest) =>
      api.put<Experience>(`/me/experiences/${id}`, data),
    delete: (id: string) => api.delete<void>(`/me/experiences/${id}`),
  },

  education: {
    list: () => api.get<Education[]>("/me/education"),
    create: (data: EducationRequest) => api.post<Education>("/me/education", data),
    update: (id: string, data: EducationRequest) => api.put<Education>(`/me/education/${id}`, data),
    delete: (id: string) => api.delete<void>(`/me/education/${id}`),
  },

  certifications: {
    list: () => api.get<Certification[]>("/me/certifications"),
    create: (data: CertificationRequest) => api.post<Certification>("/me/certifications", data),
    update: (id: string, data: CertificationRequest) =>
      api.put<Certification>(`/me/certifications/${id}`, data),
    delete: (id: string) => api.delete<void>(`/me/certifications/${id}`),
  },
};
