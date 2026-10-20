// @vitest-environment jsdom
import { act } from "react";

import { usePreferencesStore } from "@/stores/preferences.store";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { SandboxedHtmlFrame } from "./sandboxed-html-frame";
import { syncFrameTheme } from "./sync-frame-theme";

const HTML = "<p>Oi</p>";

const OPT_IN_HTML = [
  "<style>",
  "@media (prefers-color-scheme: dark) { #scheme { color: rgb(10, 200, 10); } }",
  "@media (prefers-color-scheme: light) { #scheme { color: rgb(200, 10, 10); } }",
  "</style>",
  '<p id="token" style="background:var(--background);color:var(--foreground)">token</p>',
  '<p id="scheme">esquema</p>',
].join("");

function paintTheme(background: string, foreground: string): void {
  document.documentElement.style.setProperty("--background", background);
  document.documentElement.style.setProperty("--foreground", foreground);
}

function frameTokens(frame: HTMLIFrameElement): {
  colorScheme: string;
  background: string;
  foreground: string;
} {
  const root = frame.contentDocument?.documentElement;
  return {
    colorScheme: root?.style.colorScheme ?? "",
    background: root?.style.getPropertyValue("--background").trim() ?? "",
    foreground: root?.style.getPropertyValue("--foreground").trim() ?? "",
  };
}

function mountFrame(body = "<p>Oi</p>"): HTMLIFrameElement {
  const frame = document.createElement("iframe");
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) throw new Error("iframe document unavailable");
  doc.open();
  doc.write(`<!doctype html><html><head></head><body>${body}</body></html>`);
  doc.close();
  return frame;
}

describe("syncFrameTheme", () => {
  let root: Root | null = null;

  afterEach(() => {
    root?.unmount();
    root = null;
    document.body.replaceChildren();
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("class");
    usePreferencesStore.setState({ theme: "light" });
  });

  it("writes the app color scheme into the frame document", () => {
    const frame = mountFrame();
    const frameRoot = frame.contentDocument?.documentElement;
    if (!frameRoot) throw new Error("frame root unavailable");

    syncFrameTheme(frame, "dark");

    expect(frameRoot.style.colorScheme).toBe("dark");
  });

  it("copies parent custom properties and drops the ones that left", () => {
    document.documentElement.style.setProperty("--background", "#faf9ff");
    document.documentElement.style.setProperty("--foreground", "#21173a");
    const frame = mountFrame();
    const frameRoot = frame.contentDocument?.documentElement;
    if (!frameRoot) throw new Error("frame root unavailable");

    syncFrameTheme(frame, "light");
    expect(frameRoot.style.getPropertyValue("--background").trim()).toBe("#faf9ff");
    expect(frameRoot.style.getPropertyValue("--foreground").trim()).toBe("#21173a");

    document.documentElement.style.removeProperty("--foreground");
    syncFrameTheme(frame, "dark");

    expect(frameRoot.style.colorScheme).toBe("dark");
    expect(frameRoot.style.getPropertyValue("--background").trim()).toBe("#faf9ff");
    expect(frameRoot.style.getPropertyValue("--foreground").trim()).toBe("");
  });

  it("keeps the same srcDoc when the theme changes and stays without scripts", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);

    await act(async () => {
      root?.render(<SandboxedHtmlFrame html={HTML} title="Bio" />);
    });

    const iframe = host.querySelector("iframe");
    const srcDoc = iframe?.getAttribute("srcdoc");
    expect(srcDoc).toContain("light-dark(#f5f5f5,#221f33)");
    expect(srcDoc).toContain("light-dark(#555,#c8c6dc)");
    expect(srcDoc).toContain("light-dark(#e3e3e3,#3f3d55)");
    expect(srcDoc).not.toContain("background:#f5f5f5");
    expect(iframe?.getAttribute("sandbox")).not.toContain("allow-scripts");
    expect(iframe?.getAttribute("sandbox")).toBe(
      "allow-same-origin allow-popups allow-popups-to-escape-sandbox",
    );

    await act(async () => {
      usePreferencesStore.setState({ theme: "dark" });
    });

    const updated = host.querySelector("iframe");
    expect(updated).toBe(iframe);
    expect(updated?.getAttribute("srcdoc")).toBe(srcDoc);
    expect(updated?.style.colorScheme).toBe("dark");
    expect(updated?.contentDocument?.documentElement.style.colorScheme).toBe("dark");
  });

  it("updates opt-in colors when the theme changes without rewriting the HTML", () => {
    paintTheme("#faf9ff", "#21173a");
    const frame = mountFrame(OPT_IN_HTML);
    syncFrameTheme(frame, "light");
    const authorHtml = frame.contentDocument?.body.innerHTML ?? "";

    expect(frameTokens(frame)).toEqual({
      colorScheme: "light",
      background: "#faf9ff",
      foreground: "#21173a",
    });
    expect(authorHtml).toContain("var(--background)");
    expect(authorHtml).toContain("prefers-color-scheme: dark");

    paintTheme("#0d0d18", "#e8e6ff");
    syncFrameTheme(frame, "dark");

    expect(frameTokens(frame)).toEqual({
      colorScheme: "dark",
      background: "#0d0d18",
      foreground: "#e8e6ff",
    });
    expect(frame.contentDocument?.body.innerHTML).toBe(authorHtml);
  });

  it("keeps the opt-in srcDoc when the theme changes and stays without scripts", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);

    await act(async () => {
      root?.render(<SandboxedHtmlFrame html={OPT_IN_HTML} title="Bio" />);
    });

    const iframe = host.querySelector("iframe");
    const srcDoc = iframe?.getAttribute("srcdoc");
    expect(srcDoc).toContain("var(--background)");
    expect(srcDoc).toContain("prefers-color-scheme: dark");
    expect(iframe?.getAttribute("sandbox")).not.toContain("allow-scripts");

    await act(async () => {
      usePreferencesStore.setState({ theme: "dark" });
    });

    const updated = host.querySelector("iframe");
    expect(updated).toBe(iframe);
    expect(updated?.getAttribute("srcdoc")).toBe(srcDoc);
    expect(updated?.getAttribute("sandbox")).not.toContain("allow-scripts");
  });
});
