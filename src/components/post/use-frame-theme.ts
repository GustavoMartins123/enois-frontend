import { type RefObject, useEffect } from "react";

import { usePreferencesStore } from "@/stores/preferences.store";
import type { Theme } from "@/types/preferences/theme";

import { THEME_STYLE_ELEMENT_ID } from "@/lib/theme/apply-theme";

import { syncFrameTheme } from "./sync-frame-theme";

/**
 * O `useThemeSync` do root grava a classe e o CSS do tema num efeito do pai, que roda depois
 * deste. O observador pega essa gravação e copia o resultado já calculado para o quadro.
 */
export function useFrameTheme(frame: RefObject<HTMLIFrameElement | null>): Theme {
  const theme = usePreferencesStore((state) => state.theme);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;

    const apply = () => syncFrameTheme(element, theme);
    element.addEventListener("load", apply);
    apply();
    const stop = watchParentTheme(apply);

    return () => {
      element.removeEventListener("load", apply);
      stop();
    };
  }, [frame, theme]);

  return theme;
}

function watchParentTheme(apply: () => void): () => void {
  const observer = new MutationObserver(apply);
  let themeStyle: Node | null = null;

  const attachThemeStyle = (): boolean => {
    const node = document.getElementById(THEME_STYLE_ELEMENT_ID);
    if (!node || node === themeStyle) return false;
    themeStyle = node;
    observer.observe(node, { childList: true, characterData: true, subtree: true });
    return true;
  };

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style", "data-theme"],
  });
  attachThemeStyle();

  const headObserver = new MutationObserver(() => {
    if (attachThemeStyle()) apply();
  });
  headObserver.observe(document.head, { childList: true });

  return () => {
    observer.disconnect();
    headObserver.disconnect();
  };
}
