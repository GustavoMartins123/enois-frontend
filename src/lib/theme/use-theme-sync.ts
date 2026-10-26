import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import { hydratePreferences, usePreferencesStore } from "@/stores/preferences.store";
import { useThemePreviewStore } from "@/stores/theme-preview.store";

import { preferencesApi } from "@/lib/api";
import { hasSessionFlag } from "@/lib/session";

import { applyThemePreview, applyThemeSettings } from "./apply-theme";
import { resolveThemeCollection } from "./build-collection-css";
import { isGalleryCollectionId } from "./gallery-collections";
import { syncThemeCollection } from "./sync-theme-collection";
import { useGalleryThemeOwnership } from "./use-gallery-theme-ownership";

/**
 * Único ponto que leva modo (claro/escuro), coleção temática e personalização para o DOM.
 *
 * Fica no root para valer em qualquer rota — inclusive nas telas públicas, que
 * não renderizam o botão de tema.
 */
export function useThemeSync(): void {
  const preview = useThemePreviewStore((state) => state.preview);
  const theme = usePreferencesStore((state) => state.theme);
  const themeSettings = usePreferencesStore((state) => state.themeSettings);
  const themeCollection = usePreferencesStore((state) => state.themeCollection);
  const widgetBackground = usePreferencesStore((state) => state.widgetBackground);
  const pageBackground = usePreferencesStore((state) => state.pageBackground);
  const accentAlpha = usePreferencesStore((state) => state.accentAlpha);
  const widgetAlpha = usePreferencesStore((state) => state.widgetAlpha);
  const pageAlpha = usePreferencesStore((state) => state.pageAlpha);

  useEffect(() => {
    hydratePreferences();
  }, []);

  useEffect(() => {
    if (preview) {
      document.documentElement.classList.toggle("dark", preview.mode === "dark");
      applyThemePreview(preview);
    } else {
      restoreSavedTheme();
    }
  }, [
    preview,
    theme,
    themeSettings,
    themeCollection,
    widgetBackground,
    pageBackground,
    accentAlpha,
    widgetAlpha,
    pageAlpha,
  ]);

  useEffect(() => {
    if (!preview) return;
    const stop = () => {
      useThemePreviewStore.getState().stopPreview();
      // pagehide também cobre o cache de navegação: o DOM guardado volta com o tema salvo.
      restoreSavedTheme();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) stop();
    };
    window.addEventListener("pagehide", stop);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pagehide", stop);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [preview]);

  useThemeAccountSync();
  useGalleryThemeOwnership();
}

function restoreSavedTheme(): void {
  const state = usePreferencesStore.getState();
  document.documentElement.classList.toggle("dark", state.theme === "dark");
  applyThemeSettings(
    state.themeSettings,
    state.theme,
    state.themeCollection,
    state.widgetBackground,
    state.pageBackground,
    state.accentAlpha,
    state.widgetAlpha,
    state.pageAlpha,
  );
}

/**
 * Recupera o tema salvo na conta ao entrar.
 *
 * A regra é **quem escreveu por último ganha**, comparando a data das duas escolhas. Antes era
 * "a conta ganha" sempre, e isso engolia a escolha do dispositivo quando o envio para a conta
 * falhava (foi o que aconteceu enquanto a API estava fora: o tema voltava ao antigo a cada
 * recarga, mesmo tendo sido trocado aqui). Sem data na conta (nunca escolheu) ou com um
 * identificador que o front não conhece, o local vale e sobe.
 *
 * Convidado não chega aqui: sem sessão, a preferência é só local mesmo.
 */
function useThemeAccountSync(): void {
  const token = hasSessionFlag();
  const themeCollection = usePreferencesStore((state) => state.themeCollection);
  const themeCollectionUpdatedAt = usePreferencesStore((state) => state.themeCollectionUpdatedAt);
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
    if (fromAccount === themeCollection) return;

    const accountAt = data.updatedAt ? Date.parse(data.updatedAt) : 0;
    const localAt = themeCollectionUpdatedAt ?? 0;

    if (fromAccount && accountAt > localAt) {
      setThemeCollection(fromAccount);
      return;
    }
    if (themeCollection && !isGalleryCollectionId(themeCollection)) {
      // O daqui é mais novo (ou a conta não tem nada): sobe, em vez de aceitar o valor antigo.
      // Tema da COMUNIDADE não sobe: o pacote mora neste navegador (o backend só conhece os
      // temas da casa e recusaria o id) — a escolha vale localmente, e o próximo tema da casa
      // que a pessoa escolher volta a sincronizar.
      void syncThemeCollection(themeCollection);
    }
  }, [token, data, themeCollection, themeCollectionUpdatedAt, setThemeCollection]);
}
