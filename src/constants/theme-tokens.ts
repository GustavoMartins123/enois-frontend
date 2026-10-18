/**
 * Tokens CSS que a personalização de tema sobrescreve.
 *
 * São exatamente os que a marca tinge: destaque (botões, links, badges, gradiente,
 * anel de foco) e as superfícies. Texto e cores semânticas (verde/laranja/vermelho)
 * ficam de fora de propósito — mantêm o significado e garantem o contraste.
 */
export const THEME_TOKEN_NAMES = [
  // Destaque
  "--primary",
  "--primary-foreground",
  "--primary-text",
  "--primary-soft",
  "--secondary",
  "--secondary-foreground",
  "--accent",
  "--accent-foreground",
  "--ring",
  "--gradient-primary",
  "--shadow-soft",
  "--shadow-card",
  "--mentorship-button",
  "--highlight-project",
  "--highlight-project-text",
  "--background-user-project",
  "--project-text",
  // Superfícies
  "--background",
  "--card",
  "--popover",
  "--muted",
  "--border",
  "--input",
  "--sidebar",
  "--sidebar-border",
  "--surface-card",
  "--surface-1",
  "--surface-2",
  "--surface-3",
  "--border-soft",
] as const;
