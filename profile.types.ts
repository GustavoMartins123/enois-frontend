// ─── Perfil (GET /me, GET /users/:username, GET /users/by-id/:userId) ───

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
  connectionsCount: number;
  followersCount: number;
  reputation: number;
}

// ─── Atualizar Perfil (PATCH /me/profile) ───

export interface UpdateProfileRequest {
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

// ─── Experiências (/me/experiences) ───

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  currentlyHere: boolean;
  startDate: string | null; // LocalDate: "2023-01-01"
  endDate: string | null; // LocalDate: "2024-12-31" ou null se current
}

export interface ExperienceRequest {
  title: string;
  company: string;
  location?: string | null;
  description?: string | null;
  startDate?: string | null; // "YYYY-MM-DD"
  endDate?: string | null; // "YYYY-MM-DD"
}

// ─── Educação (/me/education) ───

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

// ─── Certificações (/me/certifications) ───

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  description: string | null;
  issueDate: string | null; // "YYYY-MM-DD"
  expirationDate: string | null; // "YYYY-MM-DD"
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
