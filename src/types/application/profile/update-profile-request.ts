import type { UserProfile } from "./user-profile";

export type UpdateProfileRequest = Partial<
  Pick<
    UserProfile,
    | "username"
    | "name"
    | "headline"
    | "company"
    | "location"
    | "avatar"
    | "banner"
    | "bio"
    | "skills"
    | "goals"
    | "availability"
    | "portfolio"
    | "externalLinks"
    | "openToWork"
    | "isMentor"
  >
>;
