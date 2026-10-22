import type { WithRequiredChildren } from "@/types/components/with-required-children";

import { useIsAuthenticated } from "@/lib/use-auth";

import { AuthenticatedAppContainer } from "./authenticated-app-container";
import { GuestAppContainer } from "./guest-app-container";

/**
 * Casca do app: cabeçalho de quem entrou ou de quem só está olhando.
 *
 * A decisão vem do `useIsAuthenticated` (leitura pós-montagem), e não do token lido no render: o
 * servidor não enxerga o localStorage e sempre renderiza a casca de visitante — ler o token aqui
 * fazia o HTML do cliente discordar do que veio pronto, com a página remontando inteira.
 */
export function AppContainer({ children }: WithRequiredChildren) {
  const authenticated = useIsAuthenticated();

  return authenticated ? (
    <AuthenticatedAppContainer>{children}</AuthenticatedAppContainer>
  ) : (
    <GuestAppContainer>{children}</GuestAppContainer>
  );
}
