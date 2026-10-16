import type { Profile } from "./profile";

export type UpdateProfileRequest = Partial<
  Pick<
    Profile,
    | "username"
    | "name"
    | "headline"
    | "company"
    | "location"
    | "avatar"
    | "banner"
    | "bio"
    | "bioHtml"
    | "skills"
    | "goals"
    | "availability"
    | "portfolio"
    | "externalLinks"
    | "openToWork"
    | "isMentor"
  >
>;
