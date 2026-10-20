/** O que a criação/edição de grupo manda. Campo ausente no PATCH mantém o atual. */
export type CreateGroupInput = {
  name?: string;
  description?: string | null;
  topic?: string | null;
  avatar?: string | null;
  banner?: string | null;
  bannerHtml?: string | null;
  joinMode?: "OPEN" | "APPROVAL";
};
