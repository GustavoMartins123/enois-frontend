// @vitest-environment jsdom
import { act } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { usePreferencesStore } from "@/stores/preferences.store";
import { texts } from "@/texts";
import type { Profile } from "@/types/application/profile/profile";
import type { GalleryThemePackage } from "@/types/lib/theme/gallery-theme-package";
import { type Root, createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildCollectionCss, resolveThemeCollection } from "@/lib/theme/build-collection-css";

import { ThemeProfilePreview } from "./theme-profile-preview";

const mocks = vi.hoisted(() => ({ authenticated: true, me: vi.fn() }));
vi.mock("@/lib/api", () => ({ profileApi: { me: mocks.me } }));
vi.mock("@/lib/use-auth", () => ({ useIsAuthenticated: () => mocks.authenticated }));

const user: Profile = {
  id: "perfil-previa",
  name: "Pessoa de Teste",
  username: "perfil-previa",
  email: "",
  avatar: null,
  avatarFrame: "moldura-violeta",
  banner: null,
  badge: null,
  headline: "Construindo com a comunidade",
  company: "Projeto de teste",
  location: "Local de teste",
  bio: null,
  skills: ["React", "TypeScript"],
  goals: [],
  availability: null,
  portfolio: null,
  externalLinks: [],
  openToWork: true,
  isMentor: false,
};

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
      gradient: "linear-gradient(135deg, #bd93f9, #8be9fd)",
      text: { strong: "#f8f8f2", subtle: "#bfbfbf", date: "#8be9fd" },
    },
  }),
};

describe("Prévia do tema no perfil", () => {
  let host: HTMLDivElement;
  let root: Root;
  let client: QueryClient;
  const initialPreferences = usePreferencesStore.getState();

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    localStorage.clear();
    localStorage.setItem("session_active", "1");
    mocks.authenticated = true;
    mocks.me.mockReset().mockResolvedValue(user);
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    client = new QueryClient();
    client.setQueryData(["me"], user);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    client.clear();
    host.remove();
    usePreferencesStore.setState(initialPreferences, true);
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("style");
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  async function render(value = theme) {
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <ThemeProfilePreview theme={value} title={value.name} />
        </QueryClientProvider>,
      ),
    );
  }

  async function open() {
    await act(async () => host.querySelector("button")!.click());
  }

  function preview() {
    return document.querySelector<HTMLElement>(
      `section[aria-label="${texts.marketplace.profilePreview}"]`,
    )!;
  }

  it("abre com os dados reais do perfil e reaproveita a consulta da sessão", async () => {
    await render();
    expect(preview()).toBeNull();
    await open();
    const card = preview();
    for (const value of [
      user.name,
      `@${user.username}`,
      user.headline,
      user.company,
      user.location,
      ...user.skills,
    ]) {
      expect(card.textContent).toContain(value);
    }
    expect(card.querySelector('[data-avatar-frame="moldura-violeta"]')).not.toBeNull();
    expect(card.textContent).toContain(texts.profile.openToWork);
    expect(card.textContent).not.toContain(texts.marketplace.previewGuest);
    expect(mocks.me).not.toHaveBeenCalled();
  });

  it("reproduz a paleta completa sem alterar o tema ativo ou persistir a prévia", async () => {
    document.documentElement.dataset.theme = "win95";
    document.documentElement.style.setProperty("--primary", "#123456");
    const preferences = usePreferencesStore.getState();
    const storage = { ...localStorage };
    const documentStyle = document.documentElement.getAttribute("style");
    const write = vi.spyOn(Storage.prototype, "setItem");
    await render();
    await open();
    const style = preview().style;
    expect(style.getPropertyValue("--background")).toBe("#282a36");
    expect(style.getPropertyValue("--surface-card")).toBe("#44475a");
    expect(style.getPropertyValue("--surface-2")).toBe("#383a4c");
    expect(style.getPropertyValue("--primary-foreground")).toBe("#191a21");
    expect(style.getPropertyValue("--gradient-primary")).toBe(
      "linear-gradient(135deg, #bd93f9, #8be9fd)",
    );
    expect(style.colorScheme).toBe("dark");
    await act(async () =>
      document.querySelector<HTMLButtonElement>("button:has(.sr-only)")!.click(),
    );
    expect(preview()).toBeNull();
    expect(usePreferencesStore.getState()).toBe(preferences);
    expect(document.documentElement.dataset.theme).toBe("win95");
    expect(document.documentElement.getAttribute("style")).toBe(documentStyle);
    expect({ ...localStorage }).toEqual(storage);
    expect(write).not.toHaveBeenCalled();
  });

  it("respeita a personalização do nome já usada pelo perfil", async () => {
    usePreferencesStore.setState({
      displayNameFont: "MONO",
      displayNameColor: "#112233",
      displayNameTheme: "DEFAULT",
    });
    await render();
    await open();
    const heading = preview().querySelector("h3")!;
    expect(heading.style.fontFamily).toContain("Courier New");
    expect(heading.style.color).toBe("rgb(17, 34, 51)");
  });

  it("não recebe os relevos do tema ativo na página", async () => {
    document.documentElement.dataset.theme = "win95";
    await render();
    const style = document.createElement("style");
    style.textContent = buildCollectionCss(resolveThemeCollection("win95")!, "light");
    const outside = document.createElement("div");
    outside.className = "bg-surface-card";
    host.append(style, outside);
    expect(getComputedStyle(outside).boxShadow).toContain("inset");
    await open();
    for (const card of preview().querySelectorAll(":scope > div")) {
      expect(getComputedStyle(card).boxShadow).not.toContain("inset");
    }
  });

  it("mostra um exemplo identificado para visitantes sem expor dados em cache ou consultar /me", async () => {
    mocks.authenticated = false;
    localStorage.removeItem("session_active");
    await render();
    await open();
    expect(preview().textContent).toContain(texts.marketplace.previewGuest);
    expect(preview().textContent).toContain(texts.appearance.previewAvatarName);
    expect(preview().textContent).not.toContain(user.name);
    expect(mocks.me).not.toHaveBeenCalled();
  });

  it("mostra carregamento enquanto o perfil é buscado ao abrir", async () => {
    client.clear();
    mocks.me.mockReturnValue(new Promise(() => {}));
    await render();
    expect(mocks.me).not.toHaveBeenCalled();
    await open();
    expect(document.querySelector('[role="status"]')?.textContent).toContain(texts.common.loading);
    expect(preview()).toBeNull();
    expect(mocks.me).toHaveBeenCalledTimes(1);
  });

  it("oferece nova tentativa quando o perfil falha sem fingir ser um perfil de exemplo", async () => {
    client.clear();
    mocks.me.mockRejectedValue(new Error("Falha de teste"));
    await render();
    await open();
    await vi.waitFor(
      async () => {
        await act(async () => {});
        expect(document.querySelector('[role="alert"]')?.textContent).toContain(
          texts.profile.loadError,
        );
      },
      { timeout: 3000 },
    );
    expect(preview()).toBeNull();
    mocks.me.mockResolvedValue(user);
    await act(async () =>
      document.querySelector<HTMLButtonElement>('[role="alert"] button')!.click(),
    );
    await vi.waitFor(async () => {
      await act(async () => {});
      expect(preview()?.textContent).toContain(user.name);
    });
  });

  it("atualiza a prévia ao trocar de tema e aceita perfil com campos opcionais vazios", async () => {
    client.setQueryData(["me"], {
      ...user,
      headline: null,
      company: null,
      location: null,
      skills: [],
      openToWork: false,
    });
    await render();
    await open();
    expect(preview().querySelector("ul")).toBeNull();
    await render({
      ...theme,
      modeDefault: "light",
      packageJson: JSON.stringify({ palette: { background: "#ffffff", primary: "#123456" } }),
    });
    expect(preview().style.getPropertyValue("--background")).toBe("#ffffff");
    expect(preview().style.getPropertyValue("--primary")).toBe("#123456");
    expect(preview().style.colorScheme).toBe("light");
    expect(preview().textContent).toContain(user.name);
  });

  it("mantém o HTML inicial do servidor sem dados privados nem consultas de perfil", () => {
    const html = renderToString(<ThemeProfilePreview theme={theme} title={theme.name} />);
    expect(html).toContain(texts.marketplace.previewAction);
    expect(html).not.toContain(user.name);
    expect(mocks.me).not.toHaveBeenCalled();
  });
});
