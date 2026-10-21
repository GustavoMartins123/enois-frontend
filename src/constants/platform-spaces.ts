/**
 * Os espaços novos que a comunidade deve descobrir (usados no popup de desculpas e no painel
 * lateral do feed). São rotas que já existem — nada de link inventado.
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
    label: "Freelances",
    description: "Vagas e trabalhos por projeto, inclusive da comunidade.",
    inSidebar: true,
  },
  {
    to: "/games",
    label: "Projetos da comunidade",
    description: "Jogos e projetos publicados por quem está aqui.",
    inSidebar: true,
  },
] as const;
