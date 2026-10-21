/**
 * Estado de idade do usuário logado (ECA Digital). A data de nascimento em si nunca volta da API —
 * só o estado, para o app decidir se abre a tela de regularização.
 */
export type AgeState = {
  state: "BIRTH_DATE_REQUIRED" | "MINOR_DECLARED" | "ADULT_DECLARED";
  minor: boolean;
  declared: boolean;
};
