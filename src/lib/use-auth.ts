import { useEffect, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import { getSessionToken } from "./api-client";
import { useCurrentUser } from "./current-user";

export function isAuthenticated(): boolean {
  return !!getSessionToken();
}

/**
 * "Estou logado?" para decidir o que desenhar — sem quebrar a hidratação.
 *
 * O token vive no localStorage, então o **servidor sempre acha que ninguém está logado** e manda o
 * HTML da casca de visitante. Ler o token durante o render fazia o cliente discordar do HTML que já
 * veio pronto: erro de hidratação e a página inteira remontando (o cabeçalho piscava em toda página
 * logada). Aqui a resposta é `false` no primeiro paint (igual ao servidor) e o valor real chega
 * logo depois da montagem.
 */
export function useIsAuthenticated(): boolean {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  return authenticated;
}

export function useAuth() {
  const navigate = useNavigate();
  const token = getSessionToken();
  const query = useCurrentUser();

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!token,
    requireAuth: () => {
      if (!token) {
        navigate({ to: "/entrar", search: { tab: "login" } });
        return false;
      }
      return true;
    },
  };
}
