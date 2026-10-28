// @vitest-environment jsdom
import { act } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { usePreferencesStore } from "@/stores/preferences.store";
import { useThemePreviewStore } from "@/stores/theme-preview.store";
import type { GalleryThemePackage } from "@/types/lib/theme/gallery-theme-package";
import { type Root, createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { THEME_STYLE_ELEMENT_ID } from "@/lib/theme/apply-theme";
import { useThemeSync } from "@/lib/theme/use-theme-sync";

import { SandboxedHtmlFrame } from "@/components/post/sandboxed-html-frame";
import { ThemeToggle } from "@/components/theme-toggle";

import { ThemeProfilePreview } from "./theme-profile-preview";

const api = vi.hoisted(() => ({ getTheme: vi.fn(), setTheme: vi.fn() }));
vi.mock("@/lib/api", () => ({ preferencesApi: api }));

const theme: GalleryThemePackage = {
  id: "tema-previa",
  name: "Tema de teste",
  modeDefault: "dark",
  packageJson: JSON.stringify({
    palette: {
      background: "#282a36",
      surface: "#44475a",
      muted: "#383a4c",
      border: "#6272a4",
      primary: "#bd93f9",
      onPrimary: "#191a21",
      text: { strong: "#f8f8f2", subtle: "#bfbfbf", date: "#8be9fd" },
    },
  }),
};

function Page() {
  useThemeSync();
  return (
    <>
      <ThemeProfilePreview theme={theme} title={theme.name} />
      <ThemeToggle />
      <SandboxedHtmlFrame html="<p>Conteúdo da prévia</p>" title="Bio" autoHeight={false} />
    </>
  );
}

describe("Prévia temporária do tema na aplicação", () => {
  const initialPreferences = usePreferencesStore.getState();
  let root: Root;
  let host: HTMLDivElement;
  let client: QueryClient;

  beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    localStorage.clear();
    api.getTheme.mockReset();
    api.setTheme.mockReset();
    usePreferencesStore.setState({
      ...initialPreferences,
      theme: "light",
      themeCollection: "win95",
    });
    useThemePreviewStore.getState().stopPreview();
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    client = new QueryClient();
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <Page />
        </QueryClientProvider>,
      ),
    );
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    client.clear();
    host.remove();
    useThemePreviewStore.getState().stopPreview();
    usePreferencesStore.setState(initialPreferences, true);
    localStorage.clear();
    document.getElementById(THEME_STYLE_ELEMENT_ID)?.remove();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
    vi.unstubAllGlobals();
  });

  async function start() {
    await act(async () => host.querySelector("button")!.click());
  }

  function css() {
    return document.getElementById(THEME_STYLE_ELEMENT_ID)?.textContent;
  }

  it("aplica o tema no documento inteiro usando o motor de temas existente", async () => {
    await start();
    expect(document.documentElement.dataset.theme).toBe("galeria-tema-previa");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(css()).toContain("--background: #282a36");
    expect(css()).toContain("--surface-card: #44475a");
    expect(css()).toContain("--primary-foreground: #191a21");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("não grava a prévia nas preferências, no registro da galeria nem na conta", async () => {
    const preferences = usePreferencesStore.getState();
    const storage = { ...localStorage };
    await start();
    expect(usePreferencesStore.getState()).toBe(preferences);
    expect({ ...localStorage }).toEqual(storage);
    expect(api.setTheme).not.toHaveBeenCalled();
    expect(localStorage.getItem("connect-grow-gallery-themes")).toBeNull();
  });

  it("restaura exatamente o CSS e o modo originais ao encerrar", async () => {
    const original = css();
    const storage = { ...localStorage };
    await start();
    await act(async () => useThemePreviewStore.getState().stopPreview());
    expect(document.documentElement.dataset.theme).toBe("win95");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(css()).toBe(original);
    expect({ ...localStorage }).toEqual(storage);
  });

  it("o botão claro/escuro altera só a prévia enquanto ela está ativa", async () => {
    const storage = { ...localStorage };
    await start();
    await act(async () => host.querySelector<HTMLButtonElement>("button[title]")!.click());
    expect(useThemePreviewStore.getState().preview?.mode).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(usePreferencesStore.getState().theme).toBe("light");
    expect({ ...localStorage }).toEqual(storage);
    await act(async () => host.querySelector<HTMLButtonElement>("button[title]")!.click());
    expect(useThemePreviewStore.getState().preview?.mode).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(usePreferencesStore.getState().theme).toBe("light");
    expect({ ...localStorage }).toEqual(storage);
  });

  it("sincroniza a prévia nos iframes do design system sem recarregar o conteúdo", async () => {
    const iframe = host.querySelector("iframe")!;
    const srcDoc = iframe.getAttribute("srcdoc");
    const frameDocument = iframe.contentDocument!;
    const originalBackground = frameDocument.documentElement.style.getPropertyValue("--background");
    expect(iframe.style.colorScheme).toBe("light");

    await start();
    expect(host.querySelector("iframe")).toBe(iframe);
    expect(iframe.getAttribute("srcdoc")).toBe(srcDoc);
    expect(iframe.contentDocument).toBe(frameDocument);
    expect(iframe.style.colorScheme).toBe("dark");
    expect(frameDocument.documentElement.style.colorScheme).toBe("dark");
    expect(frameDocument.documentElement.style.getPropertyValue("--background")).toBe("#282a36");

    await act(async () => useThemePreviewStore.getState().stopPreview());
    expect(iframe.getAttribute("srcdoc")).toBe(srcDoc);
    expect(iframe.contentDocument).toBe(frameDocument);
    expect(iframe.style.colorScheme).toBe("light");
    expect(frameDocument.documentElement.style.colorScheme).toBe("light");
    expect(frameDocument.documentElement.style.getPropertyValue("--background")).toBe(
      originalBackground,
    );
  });

  it("sair da página restaura o DOM antes de ele entrar no cache de navegação", async () => {
    const original = css();
    await start();
    await act(async () => window.dispatchEvent(new Event("pagehide")));
    expect(useThemePreviewStore.getState().preview).toBeNull();
    expect(document.documentElement.dataset.theme).toBe("win95");
    expect(css()).toBe(original);
  });

  it("encerra com Escape sem alterar a preferência salva", async () => {
    await start();
    await act(async () => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(useThemePreviewStore.getState().preview).toBeNull();
    expect(usePreferencesStore.getState().themeCollection).toBe("win95");
  });

  it("trocar de prévia não faz o primeiro tema temporário virar o original", async () => {
    const original = css();
    await start();
    await act(async () =>
      useThemePreviewStore
        .getState()
        .startPreview({ ...theme, id: "segundo", modeDefault: "light" }, "Outro tema"),
    );
    expect(document.documentElement.dataset.theme).toBe("galeria-segundo");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    await act(async () => useThemePreviewStore.getState().stopPreview());
    expect(css()).toBe(original);
    expect(document.documentElement.dataset.theme).toBe("win95");
  });

  it("não aplica a prévia durante o render do servidor", () => {
    const original = css();
    renderToString(<ThemeProfilePreview theme={theme} title={theme.name} />);
    expect(css()).toBe(original);
    expect(useThemePreviewStore.getState().preview).toBeNull();
  });
});
