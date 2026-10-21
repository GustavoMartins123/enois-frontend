/**
 * Os espaços novos que a comunidade deve descobrir (usados no popup de desculpas e no painel
 * lateral do feed). São rotas que já existem — nada de link inventado.
 */
export const PLATFORM_SPACES = [
  {
    to: "/carteira",
    label: "Loja",
    description: "Molduras de avatar e itens comprados com faíscas.",
  },
  {
    to: "/marketplace",
    label: "Marketplace",
    description: "Temas e aparências criados pela própria comunidade.",
  },
  {
    to: "/vagas",
    label: "Freelances",
    description: "Vagas e trabalhos por projeto, inclusive da comunidade.",
  },
  {
    to: "/games",
    label: "Projetos da comunidade",
    description: "Jogos e projetos publicados por quem está aqui.",
  },
] as const;
