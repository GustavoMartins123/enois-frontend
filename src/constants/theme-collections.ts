import type { ThemeCollection } from "@/types/preferences/theme-collection";
import type { PaletteSpec } from "@/types/preferences/theme-collection-palette-spec";
import type { ThemeCollectionTokens } from "@/types/preferences/theme-collection-tokens";

/**
 * Expande a especificação no mapa completo de tokens.
 *
 * Regra de derivar: superfícies alternativas (`surface-1/2/3`) vêm do fundo e do
 * muted; tints (`*-soft`, gradiente suave) saem de `color-mix` com o destaque.
 * Um tema declarou tudo o que a marca tinge quando este mapa sai completo.
 */
function palette(spec: PaletteSpec): ThemeCollectionTokens {
  const { primary, onPrimary, surface, background, muted, border } = spec;
  const soft = spec.soft ?? `color-mix(in srgb, ${primary} 14%, ${background})`;
  const secondary = spec.secondary ?? `color-mix(in oklab, ${primary} 45%, ${background})`;

  return {
    // Destaque
    "--primary": primary,
    "--primary-foreground": onPrimary,
    "--primary-soft": soft,
    "--secondary": secondary,
    "--secondary-foreground": spec.onSecondary ?? onPrimary,
    "--accent": spec.accent ?? muted,
    "--accent-foreground": spec.onAccent ?? spec.text.strong,
    "--ring": spec.ring ?? primary,
    "--gradient-primary":
      spec.gradient ??
      `linear-gradient(135deg, ${primary}, color-mix(in oklab, ${primary} 70%, white))`,
    "--gradient-soft": `linear-gradient(135deg, ${background}, color-mix(in srgb, ${primary} 8%, ${background}))`,
    "--shadow-soft": spec.shadows?.soft ?? "none",
    "--shadow-card": spec.shadows?.card ?? "none",
    "--mentorship-button": primary,
    "--highlight-project": soft,
    "--highlight-project-text": primary,
    "--background-user-project": soft,
    "--project-text": primary,
    // Superfícies
    "--background": background,
    "--card": surface,
    "--popover": surface,
    "--muted": muted,
    "--border": border,
    "--input": spec.input ?? border,
    "--sidebar": surface,
    "--sidebar-border": border,
    "--surface-card": surface,
    "--surface-1": background,
    "--surface-2": muted,
    "--surface-3": surface,
    "--border-soft": border,
    // Leitura (o tema é dono do texto; é isso que o mantém legível nos dois modos)
    "--foreground": spec.text.strong,
    "--card-foreground": spec.text.strong,
    "--popover-foreground": spec.text.strong,
    "--sidebar-foreground": spec.text.strong,
    "--muted-foreground": spec.text.subtle,
    "--text-strong": spec.text.strong,
    "--text-subtle": spec.text.subtle,
    "--text-date": spec.text.date,
    // Estrutura
    "--radius": spec.radius ?? "0.875rem",
    ...(spec.fontSans ? { "--font-sans": spec.fontSans, "--font-display": spec.fontSans } : {}),
    ...spec.extra,
  } satisfies ThemeCollectionTokens;
}

/** Prefixa cada regra com o escopo do tema, nas duas variantes de modo. */
function scopedCss(id: string, rules: string[]): string {
  const base = `html:root[data-theme="${id}"]`;
  const dark = `html:root.dark[data-theme="${id}"]`;
  return rules
    .map((rule) => {
      const at = rule.indexOf(" {");
      const selectors = rule
        .slice(0, at)
        .split(",")
        .map((selector) => `${base} ${selector.trim()}, ${dark} ${selector.trim()}`)
        .join(", ");
      return selectors + rule.slice(at + 1);
    })
    .join("\n");
}

/**
 * Relevos e brilhos que dependem do modo não levam cor literal: o CSS referencia
 * variáveis (`--bevel-*`, `--neu-*`) que cada modo define nos seus tokens — é o
 * que faz o mesmo relevo acertar no claro e no escuro sem duplicar regra.
 */
const BEVEL_RULE_CARD =
  ".bg-surface-card, .bg-card, .bg-popover { box-shadow: inset -1px -1px var(--bevel-dark), inset 1px 1px var(--bevel-light), inset -2px -2px var(--bevel-dark-2), inset 2px 2px var(--bevel-light-2) }";
const BEVEL_RULE_BUTTON =
  ".bg-primary { box-shadow: inset -1px -1px var(--bevel-dark), inset 1px 1px var(--bevel-light) }";
const BEVEL_RULE_SOFT =
  ".bg-surface-card, .bg-card, .bg-popover { box-shadow: inset -1px -1px var(--bevel-dark), inset 1px 1px var(--bevel-light) }";

/**
 * Coleção temática: identidades visuais completas, uma por entrada.
 *
 * Cada tema é dados — tokens por modo e, quando precisa, CSS estrutural próprio.
 * Nenhum componente da aplicação conhece tema: quem respeita os tokens respeita
 * todos os temas, e um tema novo entra aqui sem tocar em mais nada. Temas com
 * identidade presa a um só modo (Terminal, Vaporwave e Synthwave são escuros por
 * natureza) repetem os mesmos tokens nos dois modos — o botão claro/escuro não
 * muda a cara deles de propósito, e a descrição da galeria avisa.
 */
export const THEME_COLLECTIONS: ThemeCollection[] = [
  {
    id: "win95",
    name: "Chicago 95",
    description: "Cinza de face, relevo rígido e o azul-marinho do básico que funcionava.",
    metaColor: "#000080",
    tokens: {
      light: palette({
        background: "#c0c0c0",
        surface: "#c0c0c0",
        muted: "#d4d0c8",
        border: "#808080",
        primary: "#000080",
        onPrimary: "#ffffff",
        soft: "#c7cde0",
        secondary: "#008080",
        onSecondary: "#ffffff",
        gradient: "linear-gradient(90deg, #000080, #1084d0)",
        radius: "0px",
        fontSans: "Tahoma, 'Segoe UI', sans-serif",
        text: { strong: "#0a0a0a", subtle: "#3a3a3a", date: "#5a5a5a" },
        extra: {
          "--bevel-light": "#ffffff",
          "--bevel-light-2": "#dfdfdf",
          "--bevel-dark": "#808080",
          "--bevel-dark-2": "#0a0a0a",
        },
      }),
      dark: palette({
        background: "#2b2b2e",
        surface: "#2b2b2e",
        muted: "#3a3a3e",
        border: "#5a5a60",
        primary: "#2b52c4",
        onPrimary: "#ffffff",
        soft: "#33364a",
        secondary: "#0f7c7c",
        onSecondary: "#ffffff",
        gradient: "linear-gradient(90deg, #000080, #1084d0)",
        radius: "0px",
        fontSans: "Tahoma, 'Segoe UI', sans-serif",
        text: { strong: "#e8e8e8", subtle: "#b0b0b8", date: "#808088" },
        extra: {
          "--bevel-light": "#6a6a70",
          "--bevel-light-2": "#54545a",
          "--bevel-dark": "#1c1c1f",
          "--bevel-dark-2": "#0d0d0f",
        },
      }),
    },
    css: scopedCss("win95", [BEVEL_RULE_CARD, BEVEL_RULE_BUTTON]),
    preview: {
      background: "#c0c0c0",
      surface: "#c0c0c0",
      primary: "#000080",
      onPrimary: "#ffffff",
      border: "#808080",
      effect: "bevel",
    },
  },
  {
    id: "win98",
    name: "Memphis 98",
    description: "O 95 com o título em degradê — a última infância do século XX.",
    metaColor: "#0a246a",
    tokens: {
      light: palette({
        background: "#c3c3c3",
        surface: "#c3c3c3",
        muted: "#d6d6d6",
        border: "#868686",
        primary: "#0a246a",
        onPrimary: "#ffffff",
        soft: "#c9d2e8",
        secondary: "#1084d0",
        onSecondary: "#ffffff",
        gradient: "linear-gradient(90deg, #0a246a, #a6caf0)",
        radius: "0px",
        fontSans: "Tahoma, 'Segoe UI', sans-serif",
        text: { strong: "#0a0a0a", subtle: "#3a3a3a", date: "#5a5a5a" },
        extra: {
          "--bevel-light": "#ffffff",
          "--bevel-light-2": "#dfdfdf",
          "--bevel-dark": "#808080",
          "--bevel-dark-2": "#0a0a0a",
        },
      }),
      dark: palette({
        background: "#2c2d33",
        surface: "#2c2d33",
        muted: "#3b3d45",
        border: "#5c5e6a",
        primary: "#3a5fc8",
        onPrimary: "#ffffff",
        soft: "#343a52",
        secondary: "#1c78c8",
        onSecondary: "#ffffff",
        gradient: "linear-gradient(90deg, #0a246a, #a6caf0)",
        radius: "0px",
        fontSans: "Tahoma, 'Segoe UI', sans-serif",
        text: { strong: "#e8e8ec", subtle: "#b0b2bc", date: "#80828e" },
        extra: {
          "--bevel-light": "#707080",
          "--bevel-light-2": "#58586a",
          "--bevel-dark": "#1e1e28",
          "--bevel-dark-2": "#0e0e14",
        },
      }),
    },
    css: scopedCss("win98", [BEVEL_RULE_CARD, BEVEL_RULE_BUTTON]),
    preview: {
      background: "#c3c3c3",
      surface: "#c3c3c3",
      primary: "#0a246a",
      onPrimary: "#ffffff",
      border: "#868686",
      effect: "bevel",
    },
  },
  {
    id: "win2000",
    name: "Prata 2000",
    description: "Prata profissional, relevo suave e o azul corporativo sério.",
    metaColor: "#3a6ea5",
    tokens: {
      light: palette({
        background: "#d4d0c8",
        surface: "#d4d0c8",
        muted: "#e3e0d8",
        border: "#a0a0a0",
        primary: "#3a6ea5",
        onPrimary: "#ffffff",
        soft: "#d8e0ec",
        secondary: "#3a6ea5",
        onSecondary: "#ffffff",
        gradient: "linear-gradient(90deg, #0a246a, #3a6ea5)",
        radius: "0px",
        fontSans: "Tahoma, 'Segoe UI', sans-serif",
        text: { strong: "#0a0a0a", subtle: "#3f3f3f", date: "#606060" },
        extra: { "--bevel-light": "#ffffff", "--bevel-dark": "#9a9a94" },
      }),
      dark: palette({
        background: "#33343a",
        surface: "#33343a",
        muted: "#40424a",
        border: "#5c5e66",
        primary: "#5b8fc9",
        onPrimary: "#0d1620",
        soft: "#38424e",
        secondary: "#5b8fc9",
        onSecondary: "#0d1620",
        gradient: "linear-gradient(90deg, #0a246a, #3a6ea5)",
        radius: "0px",
        fontSans: "Tahoma, 'Segoe UI', sans-serif",
        text: { strong: "#e9eaee", subtle: "#b2b4bc", date: "#82848e" },
        extra: { "--bevel-light": "#5c5e66", "--bevel-dark": "#232428" },
      }),
    },
    css: scopedCss("win2000", [BEVEL_RULE_SOFT]),
    preview: {
      background: "#d4d0c8",
      surface: "#d4d0c8",
      primary: "#3a6ea5",
      onPrimary: "#ffffff",
      border: "#a0a0a0",
      effect: "bevel",
    },
  },
  {
    id: "luna",
    name: "Luna",
    description: "Azuis arredondados, brilho de botão e o verde do campo. Otimista e brilhante.",
    metaColor: "#245edb",
    tokens: {
      light: palette({
        background: "#d6e5f5",
        surface: "#f4f7fc",
        muted: "#e4ecf6",
        border: "#7f9db9",
        primary: "#245edb",
        onPrimary: "#ffffff",
        soft: "#dbe8fa",
        secondary: "#5aab5a",
        onSecondary: "#ffffff",
        accent: "#fff4d9",
        onAccent: "#5a3200",
        gradient: "linear-gradient(180deg, #3f8cf3, #245edb)",
        shadows: {
          soft: "0 1px 2px rgb(10 40 90 / 0.18)",
          card: "0 1px 3px rgb(10 40 90 / 0.22)",
        },
        radius: "6px",
        fontSans: "Tahoma, 'Segoe UI', sans-serif",
        text: { strong: "#1a1a1a", subtle: "#5a6472", date: "#8a94a2" },
      }),
      dark: palette({
        background: "#16273c",
        surface: "#1f3249",
        muted: "#243850",
        border: "#3d5674",
        primary: "#4c8bf5",
        onPrimary: "#0a1930",
        soft: "#243a58",
        secondary: "#3f8a4f",
        onSecondary: "#ffffff",
        accent: "#2a3f5c",
        onAccent: "#cfe2ff",
        gradient: "linear-gradient(180deg, #5b97f5, #245edb)",
        shadows: {
          soft: "0 1px 2px rgb(0 0 0 / 0.4)",
          card: "0 1px 3px rgb(0 0 0 / 0.5)",
        },
        radius: "6px",
        fontSans: "Tahoma, 'Segoe UI', sans-serif",
        text: { strong: "#e8f0fa", subtle: "#a8bcd4", date: "#6f86a2" },
      }),
    },
    css: scopedCss("luna", [
      ".bg-primary { background-image: linear-gradient(180deg, rgb(255 255 255 / 0.28), rgb(255 255 255 / 0) 45%), linear-gradient(180deg, var(--primary), color-mix(in oklab, var(--primary) 70%, #10264a)) }",
    ]),
    preview: {
      background: "#d6e5f5",
      surface: "#f4f7fc",
      primary: "#245edb",
      onPrimary: "#ffffff",
      border: "#7f9db9",
      effect: "glossy",
    },
  },
  {
    id: "aero-glass",
    name: "Aero Glass",
    description: "Vidro fosco, luz atravessando os painéis e bordas que brilham.",
    metaColor: "#1e6bb8",
    tokens: {
      light: palette({
        background: "linear-gradient(160deg, #cfe4f7, #9cc2e8)",
        surface: "rgb(255 255 255 / 0.55)",
        muted: "rgb(255 255 255 / 0.38)",
        border: "rgb(255 255 255 / 0.65)",
        input: "rgb(255 255 255 / 0.5)",
        primary: "#1e6bb8",
        onPrimary: "#ffffff",
        soft: "rgb(30 107 184 / 0.14)",
        secondary: "#4f8bcc",
        onSecondary: "#ffffff",
        gradient: "linear-gradient(180deg, rgb(255 255 255 / 0.75), rgb(255 255 255 / 0.2))",
        shadows: {
          soft: "0 1px 2px rgb(20 50 90 / 0.2)",
          card: "0 8px 24px rgb(20 50 90 / 0.18), inset 0 1px 0 rgb(255 255 255 / 0.7)",
        },
        radius: "6px",
        text: { strong: "#10243a", subtle: "#35506b", date: "#6b84a0" },
      }),
      dark: palette({
        background: "linear-gradient(160deg, #14243a, #0b1524)",
        surface: "rgb(22 34 52 / 0.55)",
        muted: "rgb(22 34 52 / 0.4)",
        border: "rgb(120 170 220 / 0.35)",
        input: "rgb(120 170 220 / 0.25)",
        primary: "#5aa7e8",
        onPrimary: "#06121f",
        soft: "rgb(90 167 232 / 0.16)",
        secondary: "#3f7bb5",
        onSecondary: "#ffffff",
        gradient: "linear-gradient(180deg, rgb(120 170 220 / 0.28), rgb(120 170 220 / 0.06))",
        shadows: {
          soft: "0 1px 2px rgb(0 0 0 / 0.4)",
          card: "0 8px 24px rgb(0 0 0 / 0.45), inset 0 1px 0 rgb(255 255 255 / 0.12)",
        },
        radius: "6px",
        text: { strong: "#e8f1fa", subtle: "#9db4cc", date: "#6b84a0" },
      }),
    },
    css:
      scopedCss("aero-glass", [
        ".bg-surface-card, .bg-card, .bg-popover { box-shadow: var(--shadow-card) }",
      ]) +
      "\n" +
      `@supports (backdrop-filter: blur(1px)) {
html:root[data-theme="aero-glass"] .bg-surface-card, html:root[data-theme="aero-glass"] .bg-card, html:root[data-theme="aero-glass"] .bg-popover { backdrop-filter: blur(10px) saturate(1.15) }
html:root.dark[data-theme="aero-glass"] .bg-surface-card, html:root.dark[data-theme="aero-glass"] .bg-card, html:root.dark[data-theme="aero-glass"] .bg-popover { backdrop-filter: blur(10px) saturate(1.15) }
}
@media (prefers-reduced-transparency: reduce) {
html:root[data-theme="aero-glass"] .bg-surface-card, html:root[data-theme="aero-glass"] .bg-card, html:root[data-theme="aero-glass"] .bg-popover { backdrop-filter: none }
html:root.dark[data-theme="aero-glass"] .bg-surface-card, html:root.dark[data-theme="aero-glass"] .bg-card, html:root.dark[data-theme="aero-glass"] .bg-popover { backdrop-filter: none }
}`,
    preview: {
      background: "#b7d4ee",
      surface: "rgb(255 255 255 / 0.55)",
      primary: "#1e6bb8",
      onPrimary: "#ffffff",
      border: "rgb(255 255 255 / 0.65)",
      effect: "glass",
    },
  },
  {
    id: "frutiger-aero",
    name: "Frutiger Aero",
    description: "Água, céu e folha: glossy translúcido do otimismo tecnológico dos anos 2000.",
    metaColor: "#0aa1a8",
    tokens: {
      light: palette({
        background: "linear-gradient(180deg, #e5f6fd, #c9ecd2)",
        surface: "rgb(255 255 255 / 0.72)",
        muted: "rgb(255 255 255 / 0.5)",
        border: "rgb(10 161 168 / 0.28)",
        primary: "#0aa1a8",
        onPrimary: "#ffffff",
        soft: "rgb(10 161 168 / 0.14)",
        secondary: "#7ac142",
        onSecondary: "#ffffff",
        accent: "#e0f7fa",
        onAccent: "#045a66",
        gradient: "linear-gradient(135deg, #0aa1a8, #7ac142)",
        shadows: {
          soft: "0 1px 2px rgb(4 60 66 / 0.14)",
          card: "0 6px 18px rgb(4 60 66 / 0.16), inset 0 1px 0 rgb(255 255 255 / 0.8)",
        },
        radius: "14px",
        text: { strong: "#0c3340", subtle: "#416a75", date: "#7fa0a8" },
      }),
      dark: palette({
        background: "linear-gradient(180deg, #0b2028, #123c33)",
        surface: "rgb(14 44 52 / 0.72)",
        muted: "rgb(14 44 52 / 0.5)",
        border: "rgb(34 211 238 / 0.3)",
        primary: "#22d3ee",
        onPrimary: "#04222a",
        soft: "rgb(34 211 238 / 0.16)",
        secondary: "#84cc16",
        onSecondary: "#16240a",
        gradient: "linear-gradient(135deg, #22d3ee, #84cc16)",
        shadows: {
          soft: "0 1px 2px rgb(0 0 0 / 0.4)",
          card: "0 6px 18px rgb(0 0 0 / 0.45), inset 0 1px 0 rgb(255 255 255 / 0.1)",
        },
        radius: "14px",
        text: { strong: "#d7f2f7", subtle: "#8fb9c2", date: "#5f8a94" },
      }),
    },
    css: scopedCss("frutiger-aero", [
      ".bg-primary { background-image: linear-gradient(180deg, rgb(255 255 255 / 0.35), rgb(255 255 255 / 0) 45%), linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary) 65%, #7ac142)) }",
    ]),
    preview: {
      background: "linear-gradient(180deg, #e5f6fd, #c9ecd2)",
      surface: "rgb(255 255 255 / 0.72)",
      primary: "#0aa1a8",
      onPrimary: "#ffffff",
      border: "rgb(10 161 168 / 0.28)",
      effect: "glossy",
    },
  },
  {
    id: "metro",
    name: "Metro",
    description: "Blocos sólidos, tipografia na frente e zero enfeite. Conteúdo é interface.",
    metaColor: "#6b21c8",
    tokens: {
      light: palette({
        background: "#ffffff",
        surface: "#f2f2f2",
        muted: "#e6e6e6",
        border: "#d0d0d0",
        primary: "#6b21c8",
        onPrimary: "#ffffff",
        soft: "#efe6fb",
        gradient: "none",
        radius: "0px",
        fontSans: "'Segoe UI', system-ui, sans-serif",
        text: { strong: "#171717", subtle: "#525252", date: "#a3a3a3" },
      }),
      dark: palette({
        background: "#171717",
        surface: "#262626",
        muted: "#333333",
        border: "#404040",
        primary: "#a78bfa",
        onPrimary: "#1a1a1a",
        soft: "#2e2545",
        gradient: "none",
        radius: "0px",
        fontSans: "'Segoe UI', system-ui, sans-serif",
        text: { strong: "#fafafa", subtle: "#a3a3a3", date: "#737373" },
      }),
    },
    preview: {
      background: "#ffffff",
      surface: "#f2f2f2",
      primary: "#6b21c8",
      onPrimary: "#ffffff",
      border: "#d0d0d0",
      effect: "flat",
    },
  },
  {
    id: "terminal",
    name: "Terminal",
    description:
      "Fósforo verde sobre preto, fonte de máquina. Escuro por natureza — o brilho do tubo não tem modo claro.",
    metaColor: "#050805",
    tokens: {
      light: palette({
        background: "#050805",
        surface: "#0a120a",
        muted: "#0e1a0e",
        border: "#1d3320",
        primary: "#33ff66",
        onPrimary: "#02180a",
        soft: "#0e2412",
        secondary: "#1d3320",
        onSecondary: "#8affb0",
        accent: "#0e2412",
        onAccent: "#7dffa8",
        gradient: "linear-gradient(90deg, #33ff66, #1d9d4a)",
        radius: "0px",
        fontSans: "ui-monospace, 'Cascadia Mono', 'Courier New', monospace",
        text: { strong: "#b8ffc8", subtle: "#6fbf85", date: "#3f7f52" },
      }),
    },
    css: scopedCss("terminal", [
      ".text-text-strong { text-shadow: 0 0 8px rgb(51 255 102 / 0.3) }",
    ]),
    preview: {
      background: "#050805",
      surface: "#0a120a",
      primary: "#33ff66",
      onPrimary: "#02180a",
      border: "#1d3320",
      effect: "terminal",
    },
  },
  {
    id: "vaporwave",
    name: "Vaporwave",
    description:
      "Roxo profundo, rosa e ciano neon. Escuro por natureza — a noite é o ponto do tema.",
    metaColor: "#2b1055",
    tokens: {
      light: palette({
        background: "linear-gradient(180deg, #2b1055, #5b2a9e)",
        surface: "rgb(43 16 85 / 0.75)",
        muted: "rgb(43 16 85 / 0.55)",
        border: "rgb(255 113 206 / 0.35)",
        primary: "#ff71ce",
        onPrimary: "#2b0a2a",
        soft: "rgb(255 113 206 / 0.16)",
        secondary: "#01cdfe",
        onSecondary: "#052a3a",
        accent: "rgb(1 205 254 / 0.14)",
        onAccent: "#9ae8ff",
        ring: "#01cdfe",
        gradient: "linear-gradient(135deg, #ff71ce, #01cdfe)",
        shadows: {
          soft: "0 0 10px rgb(255 113 206 / 0.2)",
          card: "0 0 18px rgb(255 113 206 / 0.25)",
        },
        radius: "4px",
        text: { strong: "#f5e9ff", subtle: "#c0aade", date: "#8a79b0" },
      }),
    },
    preview: {
      background: "linear-gradient(180deg, #2b1055, #5b2a9e)",
      surface: "rgb(43 16 85 / 0.75)",
      primary: "#ff71ce",
      onPrimary: "#2b0a2a",
      border: "rgb(255 113 206 / 0.35)",
      effect: "gradient",
    },
  },
  {
    id: "synthwave",
    name: "Synthwave",
    description:
      "Noite de neon: rosa quente, laranja de pôr do sol e contorno luminoso. Escuro por natureza.",
    metaColor: "#1a1030",
    tokens: {
      light: palette({
        background: "linear-gradient(180deg, #1a1030, #241543)",
        surface: "rgb(26 16 48 / 0.85)",
        muted: "rgb(26 16 48 / 0.65)",
        border: "rgb(247 154 62 / 0.3)",
        primary: "#ff2975",
        onPrimary: "#ffffff",
        soft: "rgb(255 41 117 / 0.16)",
        secondary: "#f79a3e",
        onSecondary: "#2a1503",
        accent: "rgb(247 154 62 / 0.12)",
        onAccent: "#ffd9a8",
        gradient: "linear-gradient(135deg, #ff2975, #f79a3e)",
        shadows: {
          soft: "0 0 8px rgb(255 41 117 / 0.25)",
          card: "0 0 16px rgb(255 41 117 / 0.22)",
        },
        radius: "8px",
        text: { strong: "#ffe8f1", subtle: "#c99ab4", date: "#8f6a84" },
      }),
    },
    preview: {
      background: "linear-gradient(180deg, #1a1030, #241543)",
      surface: "rgb(26 16 48 / 0.85)",
      primary: "#ff2975",
      onPrimary: "#ffffff",
      border: "rgb(247 154 62 / 0.3)",
      effect: "gradient",
    },
  },
  {
    id: "y2k",
    name: "Y2K",
    description: "Cromado, perolado e otimista: a internet acreditando no ano 2000.",
    metaColor: "#6f7cff",
    tokens: {
      light: palette({
        background: "linear-gradient(180deg, #eef2fa, #e2e8f4)",
        surface: "#f7f9fd",
        muted: "#e8edf7",
        border: "#b8c4d8",
        primary: "#6f7cff",
        onPrimary: "#ffffff",
        soft: "#e6e9ff",
        secondary: "#c0c8e8",
        onSecondary: "#2a3160",
        accent: "#e6ebff",
        onAccent: "#3a4290",
        gradient: "linear-gradient(135deg, #a8b4ff, #6f7cff)",
        shadows: {
          soft: "0 1px 2px rgb(40 50 90 / 0.15)",
          card: "0 2px 6px rgb(40 50 90 / 0.18), inset 0 1px 0 #ffffff",
        },
        radius: "10px",
        text: { strong: "#16182b", subtle: "#4d5570", date: "#8b93ad" },
        extra: { "--bevel-light": "#ffffff", "--bevel-dark": "#c8d2e4" },
      }),
      dark: palette({
        background: "linear-gradient(180deg, #14161f, #101220)",
        surface: "#1c1f2c",
        muted: "#232636",
        border: "#3a4158",
        primary: "#8a94ff",
        onPrimary: "#12142a",
        soft: "#262b45",
        secondary: "#3a4266",
        onSecondary: "#dfe4ff",
        accent: "#232946",
        onAccent: "#cdd5ff",
        gradient: "linear-gradient(135deg, #a8b4ff, #6f7cff)",
        shadows: {
          soft: "0 1px 2px rgb(0 0 0 / 0.45)",
          card: "0 2px 6px rgb(0 0 0 / 0.5), inset 0 1px 0 #3a4158",
        },
        radius: "10px",
        text: { strong: "#eef0fa", subtle: "#a8b0cc", date: "#6b7394" },
        extra: { "--bevel-light": "#3a4158", "--bevel-dark": "#10121c" },
      }),
    },
    css: scopedCss("y2k", [
      ".bg-surface-card, .bg-card, .bg-popover { box-shadow: inset 0 1px 0 var(--bevel-light), inset 0 -1px 0 var(--bevel-dark) }",
    ]),
    preview: {
      background: "linear-gradient(180deg, #eef2fa, #e2e8f4)",
      surface: "#f7f9fd",
      primary: "#6f7cff",
      onPrimary: "#ffffff",
      border: "#b8c4d8",
      effect: "glossy",
    },
  },
  {
    id: "neumorfismo",
    name: "Neumorfismo",
    description: "Superfícies da mesma cor do fundo, esculpidas por luz e sombra suave.",
    metaColor: "#6d5dfc",
    tokens: {
      light: palette({
        background: "#e0e5ec",
        surface: "#e0e5ec",
        muted: "#d6dbe4",
        border: "#d1d6df",
        primary: "#6d5dfc",
        onPrimary: "#ffffff",
        soft: "#d8dcfa",
        secondary: "#8d9bd8",
        onSecondary: "#ffffff",
        ring: "#6d5dfc",
        gradient: "linear-gradient(135deg, #6d5dfc, #9fa8ff)",
        shadows: {
          soft: "6px 6px 12px #c5cad3, -6px -6px 12px #ffffff",
          card: "9px 9px 18px #c5cad3, -9px -9px 18px #ffffff",
        },
        radius: "16px",
        text: { strong: "#2d3345", subtle: "#5d6579", date: "#9aa1b2" },
        extra: { "--neu-dark": "#c5cad3", "--neu-light": "#ffffff" },
      }),
      dark: palette({
        background: "#2c3038",
        surface: "#2c3038",
        muted: "#262a31",
        border: "#262a31",
        primary: "#7c6cff",
        onPrimary: "#ffffff",
        soft: "#343a49",
        secondary: "#4a5570",
        onSecondary: "#e6ebff",
        ring: "#7c6cff",
        gradient: "linear-gradient(135deg, #7c6cff, #a5aeff)",
        shadows: {
          soft: "6px 6px 12px #23262d, -6px -6px 12px #363b44",
          card: "9px 9px 18px #23262d, -9px -9px 18px #363b44",
        },
        radius: "16px",
        text: { strong: "#e6e9f2", subtle: "#a8b0c0", date: "#6d7688" },
        extra: { "--neu-dark": "#23262d", "--neu-light": "#363b44" },
      }),
    },
    css: scopedCss("neumorfismo", [
      ".bg-surface-card, .bg-card, .bg-popover { border-color: transparent }",
      ".bg-muted { box-shadow: inset 4px 4px 8px var(--neu-dark), inset -4px -4px 8px var(--neu-light) }",
    ]),
    preview: {
      background: "#e0e5ec",
      surface: "#e0e5ec",
      primary: "#6d5dfc",
      onPrimary: "#ffffff",
      border: "#d1d6df",
      effect: "neumorph",
    },
  },
];

/** Os identificadores estáveis da coleção — o espelho do que o backend valida. */
export const THEME_COLLECTION_IDS = THEME_COLLECTIONS.map((collection) => collection.id);
