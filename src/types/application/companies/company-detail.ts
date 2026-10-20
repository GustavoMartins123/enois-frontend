/** Pagina empresarial (GET /empresa/{slug}). myRole so vem com sessao de membro. */
export type CompanyDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sector: string | null;
  size: string | null;
  location: string | null;
  website: string | null;
  logo: string | null;
  cover: string | null;
  myRole: "OWNER" | "ADMIN" | "EDITOR" | "RECRUITER" | null;
  projects: MicroProjectView[];
};

export type CompanyMember = {
  userId: string;
  role: "OWNER" | "ADMIN" | "EDITOR" | "RECRUITER";
  createdAt: string;
};

export type MicroProjectView = {
  id: string;
  companyId: string;
  title: string;
  problem: string;
  scope: string | null;
  deliverables: string | null;
  acceptanceCriteria: string | null;
  budget: string | null;
  deadline: string | null;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
};

export type ProposalView = {
  id: string;
  userId: string;
  message: string;
  status: "SENT" | "SELECTED" | "DECLINED";
  proposedAt: string;
};

export type CompanySummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sector: string | null;
  location: string | null;
  logo: string | null;
  cover: string | null;
};
