/**
 * Uma resposta sugerida pelo currículo, ou o motivo de um campo ter ficado sem sugestão.
 * Espelha `ResumeImportService.FieldSuggestion` do backend.
 */
export type ResumePrefillField = {
  fieldId: string;
  label: string;
  /** Sugestão extraída do currículo; nulo quando `reason` explica o motivo. */
  suggestedValue: string | null;
  /**
   * Por que o campo ficou vazio: link/contato/anos não encontrados no currículo, ou campo
   * manual que o currículo não responde. Nulo = tem sugestão.
   */
  reason: "NO_LINK_FOUND" | "NO_CONTACT_FOUND" | "NO_YEARS_FOUND" | "MANUAL_FIELD" | null;
};
