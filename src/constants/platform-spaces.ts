/**
 * Os espaços novos que a comunidade deve descobrir (painel lateral do feed). São rotas que já
 * existem — nada de link inventado.
 */
export const PLATFORM_SPACES = [
  {
    to: "/carteira",
    label: "Loja",
    description: "Molduras de avatar e itens comprados com faíscas.",
    inSidebar: true,
  },
  {
    to: "/marketplace",
    label: "Marketplace",
    description: "Temas e aparências criados pela própria comunidade.",
    /** Já está no menu da esquerda: não repetir no card da direita. */
    inSidebar: false,
  },
  {
    to: "/vagas",
    label: "Vagas",
    description: "Vagas de empresas e da comunidade, com filtros e candidatura.",
    inSidebar: true,
  },
  {
    to: "/freelances",
    label: "Freelances",
    description: "Trabalhos pontuais publicados por qualquer pessoa da comunidade.",
    inSidebar: true,
  },
  {
    to: "/games",
    label: "Jogos da comunidade",
    description: "Jogos publicados por quem está aqui.",
    inSidebar: true,
  },
  {
    to: "/projetos",
    label: "Projetos da comunidade",
    description: "Apps, sites, pesquisas e experimentos de quem está aqui.",
    inSidebar: true,
  },
] as const;
