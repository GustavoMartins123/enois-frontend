import type { Theme } from "@/types/preferences/theme";

const copiedCustomProperties = new WeakMap<HTMLElement, ReadonlySet<string>>();

/**
 * O tema do app mora no documento pai e não atravessa o iframe. Gravamos o modo no `html` do
 * quadro e copiamos as variáveis já calculadas. Trocar o `srcDoc` recriaria o documento,
 * recarregaria mídia e perderia a rolagem.
 */
export function syncFrameTheme(frame: HTMLIFrameElement, theme: Theme): void {
  const root = frame.contentDocument?.documentElement;
  if (!root) return;
  root.style.colorScheme = theme;
  copyParentCustomProperties(root);
}

function copyParentCustomProperties(root: HTMLElement): void {
  const computed = getComputedStyle(document.documentElement);
  const names = customPropertyNames(computed);
  const applied = new Set<string>();

  for (const name of names) {
    const value = computed.getPropertyValue(name).trim();
    if (!value) continue;
    root.style.setProperty(name, value);
    applied.add(name);
  }

  const previous = copiedCustomProperties.get(root);
  if (previous) removeStaleCustomProperties(root, previous, applied);
  copiedCustomProperties.set(root, applied);
}

function removeStaleCustomProperties(
  root: HTMLElement,
  previous: ReadonlySet<string>,
  applied: ReadonlySet<string>,
): void {
  for (const name of previous) {
    if (!applied.has(name)) root.style.removeProperty(name);
  }
}

function customPropertyNames(computed: CSSStyleDeclaration): ReadonlySet<string> {
  const names = new Set<string>();
  for (let index = 0; index < computed.length; index += 1) {
    const name = computed.item(index);
    if (name.startsWith("--")) names.add(name);
  }
  if (!names.has("--background")) collectDeclaredCustomProperties(names);
  return names;
}

function collectDeclaredCustomProperties(names: Set<string>): void {
  collectStyleProperties(document.documentElement.style, names);
  for (const sheet of document.styleSheets) collectRuleList(safeCssRules(sheet), names);
}

function collectStyleProperties(style: CSSStyleDeclaration, names: Set<string>): void {
  for (let index = 0; index < style.length; index += 1) {
    const name = style.item(index);
    if (name.startsWith("--")) names.add(name);
  }
}

function collectRuleList(rules: CSSRuleList | undefined, names: Set<string>): void {
  if (!rules) return;
  for (let index = 0; index < rules.length; index += 1) collectRule(rules.item(index), names);
}

function collectRule(rule: CSSRule | null, names: Set<string>): void {
  if (!rule) return;
  if (rule instanceof CSSStyleRule) {
    collectStyleProperties(rule.style, names);
    return;
  }
  if (rule instanceof CSSImportRule) {
    collectRuleList(safeCssRules(rule.styleSheet), names);
    return;
  }
  if ("cssRules" in rule && rule.cssRules instanceof CSSRuleList) {
    collectRuleList(rule.cssRules, names);
  }
}

function safeCssRules(sheet: CSSStyleSheet | null): CSSRuleList | undefined {
  if (!sheet) return undefined;
  try {
    return sheet.cssRules;
  } catch {
    return undefined;
  }
}
