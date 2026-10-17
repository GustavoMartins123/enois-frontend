export type Profile = {
  id: string;
  username: string;
  name: string;
  headline: string | null;
  email: string;
  company: string | null;
  location: string | null;
  avatar: string | null;
  banner: string | null;
  /** Emblema (PNG pequeno) exibido ao lado do nome; URL de mídia, como avatar e banner. */
  badge: string | null;
  bio: string | null;
  /** Bio em HTML/CSS já sanitizada; quando presente, o perfil mostra ela no lugar do texto. */
  bioHtml?: string | null;
  /** Capa em HTML/CSS já sanitizada; quando presente, ocupa o lugar da imagem da capa. */
  bannerHtml?: string | null;
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
};
