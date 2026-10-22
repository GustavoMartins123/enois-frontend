/**
 * Estado de idade do usuário logado (ECA Digital). A data de nascimento em si nunca volta da API —
 * só o estado, para o app decidir se abre a regularização ou a supervisão parental.
 *
 * A idade é DECLARADA (não verificada por mecanismo oficial) e quem decide é o backend.
 */
export type AgeState = {
  state: "BIRTH_DATE_REQUIRED" | "ADULT_DECLARED" | "MINOR_CONSENT_PENDING" | "MINOR_SUPERVISED";
  minor: boolean;
  declared: boolean;
  /** Menor com autorização ativa de um responsável. */
  supervised: boolean;
};
