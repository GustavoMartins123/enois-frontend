/**
 * Avisos globais da politica de idade (ECA Digital). O backend responde 403 com um codigo proprio;
 * o api-client dispara o evento e o AgeGate abre a tela certa em qualquer lugar do app.
 */
export const BIRTH_DATE_REQUIRED_EVENT = "enois:birth-date-required";
export const PARENTAL_CONSENT_REQUIRED_EVENT = "enois:parental-consent-required";

export function notifyBirthDateRequired(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BIRTH_DATE_REQUIRED_EVENT));
}

export function notifyParentalConsentRequired(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PARENTAL_CONSENT_REQUIRED_EVENT));
}
