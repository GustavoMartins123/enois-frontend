/** Estado do perfil profissional da conta (GET /me/business-profile). */
export type CorporateProfileView = {
  exists: boolean;
  username: string;
  name: string;
  headline: string;
  bio: string;
  avatar: string;
  banner: string;
  location: string;
  industry: string;
  externalLinks: string;
  status: "DRAFT" | "ACTIVE" | "DISABLED";
};
