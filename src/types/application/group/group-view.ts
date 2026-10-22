/**
 * A apresentação pública de um grupo — o que a descoberta e a página mostram.
 *
 * `joined`/`viewerRole`/`requestPending` são do leitor (falsos sem sessão). Nada de conteúdo
 * interno (publicações, membros, tópicos) vem aqui: isso exige ser membro.
 */
export type GroupView = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  topic: string | null;
  avatar: string | null;
  banner: string | null;
  bannerHtml: string | null;
  /** OPEN entra na hora; APPROVAL fica pendente até uma decisão. */
  joinMode: "OPEN" | "APPROVAL";
  status: "ACTIVE" | "RESTRICTED" | "SUSPENDED" | "CLOSED";
  members: number;
  /** OWNER | ADMIN | MODERATOR | MEMBER; nulo para quem não é membro. */
  viewerRole: string | null;
  joined: boolean;
  /** O leitor tem pedido de entrada pendente. */
  requestPending: boolean;
  createdAt: string;
};
