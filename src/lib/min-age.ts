/**
 * A idade mínima da plataforma (18) — cadastro e edição de perfil validam na mesma régua.
 * Data ISO `aaaa-mm-dd`; o cálculo considera o dia, não só o ano.
 */
export const MIN_AGE = 18;

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function hasMinAge(birthDate: string): boolean {
  if (!ISO_DATE.test(birthDate)) return false;
  const dob = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return false;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const months = now.getMonth() - dob.getMonth();
  if (months < 0 || (months === 0 && now.getDate() < dob.getDate())) age--;
  return age >= MIN_AGE && age <= 120;
}
