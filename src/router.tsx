import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import { registerBrowserQueryClient } from "./lib/query-client";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Voltando a aba, o TanStack so refaz a busca se os dados estiverem "velhos". Com staleTime 0
        // (o default) ele considerava tudo velho e recarregava o feed a cada troca de aba — o
        // incomodo relatado. Uma janela curta mantem o frescor sem recarregar sem motivo.
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  });
  registerBrowserQueryClient(queryClient);

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
