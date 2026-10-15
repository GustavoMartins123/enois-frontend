export type PreferencesStorageState = {
  theme?: string;
  sidebarCollapsed?: boolean;
  /** Sem tipo de propósito: vem do storage, que pode ter sido editado à mão. */
  themeSettings?: unknown;
};
