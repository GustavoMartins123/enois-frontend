/** Um perfil menor supervisionado por quem está logado (nunca de outro responsável). */
export type SupervisedMinorView = {
  minorUserId: string;
  username: string;
  name: string;
  since: string;
};
