/**
 * Aviso global de que a plataforma exige a data de nascimento para escrever (publicar, comentar,
 * mandar mensagem). O api-client dispara o evento ao receber 403 BIRTH_DATE_REQUIRED; o
 * BirthDateGate escuta e abre o diálogo de regularização em qualquer tela.
 */
export const BIRTH_DATE_REQUIRED_EVENT = "enois:birth-date-required";

export function notifyBirthDateRequired(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BIRTH_DATE_REQUIRED_EVENT));
}
