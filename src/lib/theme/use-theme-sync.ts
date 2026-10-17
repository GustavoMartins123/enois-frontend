import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import { hydratePreferences, usePreferencesStore } from "@/stores/preferences.store";

import { preferencesApi } from "@/lib/api";
import { getSessionToken } from "@/lib/api-client";

import { applyThemeSettings } from "./apply-theme";
import { resolveThemeCollection } from "./build-collection-css";

/**
 * Único ponto que leva modo (claro/escuro), coleção temática e personalização para o DOM.
 *
 * Fica no root para valer em qualquer rota — inclusive nas telas públicas, que
 * não renderizam o botão de tema.
 */
export function useThemeSync(): void {
  const theme = usePreferencesStore((state) => state.theme);
  const themeSettings = usePreferencesStore((state) => state.themeSettings);
  const themeCollection = usePreferencesStore((state) => state.themeCollection);
  const backgroundStyle = usePreferencesStore((state) => state.backgroundStyle);

  useEffect(() => {
    hydratePreferences();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    applyThemeSettings(themeSettings, theme, themeCollection, backgroundStyle);
  }, [theme, themeSettings, themeCollection, backgroundStyle]);

  useThemeAccountSync();
}

/**
 * Recupera o tema salvo na conta ao entrar.
 *
 * Regra de conflito explícita e sempre igual: **a conta ganha**. Se o backend
 * guarda um tema válido, ele passa a valer; se a conta não tem preferência (ou o
 * identificador não existe mais), o que estava no dispositivo segue valendo.
 * Convidado não chega aqui: sem sessão, a preferência é só local mesmo.
 */
function useThemeAccountSync(): void {
  const token = getSessionToken();
  const themeCollection = usePreferencesStore((state) => state.themeCollection);
  const setThemeCollection = usePreferencesStore((state) => state.setThemeCollection);

  const { data } = useQuery({
    queryKey: ["me", "theme"],
    queryFn: () => preferencesApi.getTheme(),
    enabled: Boolean(token),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!token || data === undefined) return;

    const fromAccount = resolveThemeCollection(data.theme)?.id ?? null;
    if (fromAccount && fromAccount !== themeCollection) {
      setThemeCollection(fromAccount);
    }
  }, [token, data, themeCollection, setThemeCollection]);
}
