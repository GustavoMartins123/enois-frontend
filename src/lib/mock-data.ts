// Mocked data — replace with API calls when backend is ready.
// All shapes mirror what a future REST/GraphQL endpoint should return.

export type User = {
  id: string;
  username: string;
  name: string;
  headline: string;
  company: string;
  location: string;
  avatar: string;
  bio: string;
  skills: string[];
  reputation: { label: string; level: number }[];
  openToWork: boolean;
  isMentor: boolean;
  connections: number;
  followers: number;
};

export type Post = {
  id: string;
  authorId: string;
  createdAt: string;
  type: "insight" | "question" | "project" | "opportunity" | "article";
  content: string;
  tags: string[];
  reactions: number;
  comments: number;
  saves: number;
  image?: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  type: "Remoto" | "Híbrido" | "Presencial";
  level: string;
  salary?: string;
  skills: string[];
  postedAt: string;
  matchScore: number;
};

export type Community = {
  id: string;
  name: string;
  description: string;
  members: number;
  topic: string;
  cover: string;
  joined?: boolean;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  format: "Online" | "Presencial" | "Híbrido";
  host: string;
  attendees: number;
  cover: string;
};

export type Mentor = {
  id: string;
  userId: string;
  expertise: string[];
  rating: number;
  sessions: number;
  price: string;
  nextSlot: string;
};

export type Conversation = {
  id: string;
  userId: string;
  lastMessage: string;
  time: string;
  unread: number;
};

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ede9fe,ddd6fe,c4b5fd`;

const cover = (seed: string, w = 800, h = 400) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

export const currentUser: User = {
  id: "u-me",
  username: "voce",
  name: "Você",
  headline: "Product Designer · Construindo experiências humanas",
  company: "Atlas Studio",
  location: "São Paulo, Brasil",
  avatar: avatar("voce-user"),
  bio: "Designer de produto focada em sistemas, acessibilidade e colaboração. Acredito que boas ideias nascem de boas conversas.",
  skills: ["Design Systems", "UX Research", "Figma", "Acessibilidade", "Estratégia de Produto"],
  reputation: [
    { label: "Colaboradora Ativa", level: 3 },
    { label: "Especialista Reconhecida", level: 2 },
  ],
  openToWork: false,
  isMentor: true,
  connections: 482,
  followers: 1240,
};

export const users: User[] = [
  {
    id: "u-1",
    username: "marina.rocha",
    name: "Marina Rocha",
    headline: "Engenheira de Software Sênior · Foco em sistemas distribuídos",
    company: "Nubank",
    location: "São Paulo, BR",
    avatar: avatar("marina"),
    bio: "Aprendo escrevendo. Compartilho o que aprendo.",
    skills: ["Go", "Kubernetes", "Arquitetura", "Observabilidade"],
    reputation: [{ label: "Mentora Confiável", level: 4 }],
    openToWork: false,
    isMentor: true,
    connections: 1822,
    followers: 8400,
  },
  {
    id: "u-2",
    username: "diego.alves",
    name: "Diego Alves",
    headline: "Product Manager · Fintech & Marketplaces",
    company: "Mercado Livre",
    location: "Florianópolis, BR",
    avatar: avatar("diego"),
    bio: "Construindo produtos que respeitam o tempo das pessoas.",
    skills: ["Discovery", "Estratégia", "Métricas", "Liderança"],
    reputation: [{ label: "Líder de Comunidade", level: 3 }],
    openToWork: false,
    isMentor: true,
    connections: 920,
    followers: 3100,
  },
  {
    id: "u-3",
    username: "ana.figueiredo",
    name: "Ana Figueiredo",
    headline: "Head de People · Cultura, diversidade e desenvolvimento",
    company: "Stone",
    location: "Rio de Janeiro, BR",
    avatar: avatar("ana"),
    bio: "Pessoas primeiro. Sempre.",
    skills: ["Cultura", "Recrutamento", "D&I", "Coaching"],
    reputation: [{ label: "Mentora Confiável", level: 5 }],
    openToWork: false,
    isMentor: true,
    connections: 2100,
    followers: 5400,
  },
  {
    id: "u-4",
    username: "lucas.tanaka",
    name: "Lucas Tanaka",
    headline: "Estudante de Ciência da Computação · Buscando primeiro estágio",
    company: "USP",
    location: "São Paulo, BR",
    avatar: avatar("lucas"),
    bio: "Aprendendo em público. Curioso sobre tudo.",
    skills: ["Python", "Algoritmos", "Open Source"],
    reputation: [{ label: "Colaborador Ativo", level: 1 }],
    openToWork: true,
    isMentor: false,
    connections: 142,
    followers: 230,
  },
  {
    id: "u-5",
    username: "bea.costa",
    name: "Beatriz Costa",
    headline: "Designer Freelancer · Marca e produto para early-stage",
    company: "Independente",
    location: "Porto, PT",
    avatar: avatar("bea"),
    bio: "Trabalho com fundadoras que querem comunicar com clareza.",
    skills: ["Branding", "Webflow", "UI", "Direção de Arte"],
    reputation: [{ label: "Especialista Reconhecida", level: 3 }],
    openToWork: true,
    isMentor: false,
    connections: 612,
    followers: 1800,
  },
  {
    id: "u-6",
    username: "rafael.menezes",
    name: "Rafael Menezes",
    headline: "Tech Recruiter · Conectando engenharia e oportunidades",
    company: "Talent Bridge",
    location: "Remoto · Brasil",
    avatar: avatar("rafael"),
    bio: "Recrutamento sem ruído. Conversas honestas.",
    skills: ["Recrutamento Técnico", "Hiring", "Sourcing"],
    reputation: [{ label: "Colaborador Ativo", level: 2 }],
    openToWork: false,
    isMentor: false,
    connections: 3400,
    followers: 980,
  },
];

export const findUser = (id: string) =>
  [currentUser, ...users].find((u) => u.id === id) ?? users[0];

export const findUserByUsername = (username: string) =>
  [currentUser, ...users].find((u) => u.username === username);

export const posts: Post[] = [
  {
    id: "p-1",
    authorId: "u-1",
    createdAt: "há 2h",
    type: "insight",
    content:
      "Documentar decisões de arquitetura economizou mais tempo do que qualquer ferramenta nova que adotamos no último ano. ADRs curtos, com contexto e trade-offs — qualquer pessoa nova no time entende o porquê em minutos, não em semanas.",
    tags: ["Arquitetura", "Boas Práticas"],
    reactions: 184,
    comments: 32,
    saves: 96,
  },
  {
    id: "p-2",
    authorId: "u-3",
    createdAt: "há 5h",
    type: "question",
    content:
      "Pergunta para quem lidera times remotos: como vocês mantêm o senso de pertencimento sem cair no excesso de reuniões? Estamos experimentando rituais assíncronos e gostaria de ouvir o que funcionou aí.",
    tags: ["Liderança", "Cultura", "Remote"],
    reactions: 96,
    comments: 71,
    saves: 22,
  },
  {
    id: "p-3",
    authorId: "u-2",
    createdAt: "ontem",
    type: "project",
    content:
      "Lançamos a primeira versão do nosso programa interno de mentoria cruzada entre times de produto e engenharia. 6 semanas, 1h por semana, pares formados por afinidade de objetivos — não por hierarquia. Resultado: NPS interno de 89.",
    tags: ["Mentoria", "Produto"],
    reactions: 312,
    comments: 44,
    saves: 140,
    image: cover("mentoria-projeto", 1200, 600),
  },
  {
    id: "p-4",
    authorId: "u-5",
    createdAt: "há 2 dias",
    type: "article",
    content:
      "Escrevi sobre como decidir entre construir um design system do zero ou adotar um existente. Spoiler: a resposta quase nunca é técnica — é sobre o tamanho e a maturidade do time.",
    tags: ["Design Systems", "Decisões"],
    reactions: 240,
    comments: 28,
    saves: 188,
  },
];

export const jobs: Job[] = [
  {
    id: "j-1",
    title: "Engenheira de Software Pleno",
    company: "Nubank",
    logo: avatar("nubank-logo"),
    location: "São Paulo · Híbrido",
    type: "Híbrido",
    level: "Pleno",
    salary: "R$ 14k – 18k",
    skills: ["Go", "Kotlin", "AWS"],
    postedAt: "há 3 dias",
    matchScore: 92,
  },
  {
    id: "j-2",
    title: "Senior Product Designer",
    company: "Loft",
    logo: avatar("loft-logo"),
    location: "Remoto · Brasil",
    type: "Remoto",
    level: "Sênior",
    salary: "R$ 18k – 24k",
    skills: ["Design Systems", "Pesquisa", "Figma"],
    postedAt: "há 1 dia",
    matchScore: 88,
  },
  {
    id: "j-3",
    title: "Tech Lead Frontend",
    company: "Quinto Andar",
    logo: avatar("qa-logo"),
    location: "São Paulo · Híbrido",
    type: "Híbrido",
    level: "Especialista",
    salary: "R$ 22k – 28k",
    skills: ["React", "TypeScript", "Liderança"],
    postedAt: "há 5 dias",
    matchScore: 81,
  },
  {
    id: "j-4",
    title: "Estágio em Engenharia de Dados",
    company: "iFood",
    logo: avatar("ifood-logo"),
    location: "Remoto",
    type: "Remoto",
    level: "Estágio",
    skills: ["Python", "SQL", "Curiosidade"],
    postedAt: "hoje",
    matchScore: 74,
  },
];

export const communities: Community[] = [
  {
    id: "c-1",
    name: "Frontend Brasil",
    description: "Discussões técnicas, novidades de ecossistema e mentoria coletiva.",
    members: 18420,
    topic: "Engenharia",
    cover: cover("front-brasil"),
    joined: true,
  },
  {
    id: "c-2",
    name: "Design Centrado em Pessoas",
    description: "Pesquisa, acessibilidade e ética no design de produto.",
    members: 9210,
    topic: "Design",
    cover: cover("design-pessoas"),
    joined: true,
  },
  {
    id: "c-3",
    name: "Lideranças Femininas em Tech",
    description: "Espaço seguro de troca para mulheres em posições de liderança.",
    members: 4820,
    topic: "Liderança",
    cover: cover("lid-fem"),
  },
  {
    id: "c-4",
    name: "Primeira Vez em Produto",
    description: "Para quem está fazendo a transição para Product Management.",
    members: 6710,
    topic: "Produto",
    cover: cover("pm-primeira"),
  },
  {
    id: "c-5",
    name: "Carreira Internacional",
    description: "Visto, processos seletivos e adaptação cultural.",
    members: 12200,
    topic: "Carreira",
    cover: cover("carreira-intl"),
  },
  {
    id: "c-6",
    name: "Freelancers do Brasil",
    description: "Precificação, contratos, clientes e bem-estar.",
    members: 7800,
    topic: "Freelance",
    cover: cover("freela-br"),
  },
];

export const events: Event[] = [
  {
    id: "e-1",
    title: "Painel: O futuro da mentoria em tecnologia",
    date: "12 de Junho",
    time: "19h00",
    format: "Online",
    host: "Conexão · Comunidade",
    attendees: 412,
    cover: cover("evento-mentoria"),
  },
  {
    id: "e-2",
    title: "Meetup de Design Systems · São Paulo",
    date: "20 de Junho",
    time: "18h30",
    format: "Presencial",
    host: "Atlas Studio",
    attendees: 86,
    cover: cover("evento-ds"),
  },
  {
    id: "e-3",
    title: "Workshop: ADRs na prática",
    date: "28 de Junho",
    time: "10h00",
    format: "Híbrido",
    host: "Frontend Brasil",
    attendees: 240,
    cover: cover("evento-adr"),
  },
];

export const mentors: Mentor[] = [
  {
    id: "m-1",
    userId: "u-1",
    expertise: ["Arquitetura", "Carreira em Eng.", "Liderança técnica"],
    rating: 4.9,
    sessions: 142,
    price: "Gratuito · 30 min",
    nextSlot: "Quinta · 19h",
  },
  {
    id: "m-2",
    userId: "u-3",
    expertise: ["Transição de carreira", "Entrevistas", "Cultura"],
    rating: 5.0,
    sessions: 98,
    price: "R$ 180 · 45 min",
    nextSlot: "Terça · 09h",
  },
  {
    id: "m-3",
    userId: "u-2",
    expertise: ["Product Discovery", "Estratégia", "Primeiro PM"],
    rating: 4.8,
    sessions: 76,
    price: "Gratuito · 30 min",
    nextSlot: "Sexta · 17h",
  },
];

export const conversations: Conversation[] = [
  { id: "conv-1", userId: "u-1", lastMessage: "Topa marcar 30 min essa semana?", time: "12:42", unread: 2 },
  { id: "conv-2", userId: "u-3", lastMessage: "Mandei o material que comentei.", time: "10:08", unread: 0 },
  { id: "conv-2b", userId: "u-2", lastMessage: "Concordo. Vamos seguir por aí.", time: "ontem", unread: 0 },
  { id: "conv-3", userId: "u-5", lastMessage: "Adorei a ideia. Posso contribuir?", time: "ontem", unread: 1 },
  { id: "conv-4", userId: "u-6", lastMessage: "Tem disponibilidade pra conversar?", time: "seg", unread: 0 },
];

export const suggestedConnections = users.slice(0, 4);
