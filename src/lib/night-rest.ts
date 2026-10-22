/** Janela do lembrete de descanso, no relógio local do dispositivo (nunca UTC do servidor). */
export const NIGHT_REST_START_HOUR = 0;
export const NIGHT_REST_END_HOUR = 5;

/** 00:00 até 04:59:59.999 no fuso do aparelho. */
export function isNightRestTime(date: Date): boolean {
  const hour = date.getHours();
  return hour >= NIGHT_REST_START_HOUR && hour < NIGHT_REST_END_HOUR;
}

/**
 * A "noite" começa à meia-noite local: guardar a data (e não um booleano) faz o lembrete
 * liberar sozinho na madrugada seguinte, sem nenhum job de reset no servidor.
 */
export function nightKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * O popup só aparece com a preferência ligada, dentro da janela e quando esta noite ainda não
 * foi dispensada. Preferência ainda carregando ou com erro é `undefined` — nesse caso não
 * aparece, para uma falha de rede nunca surpreender quem está usando o feed.
 */
export function shouldShowNightRest(
  enabled: boolean | undefined,
  date: Date,
  dismissedOn?: string | null,
): boolean {
  if (enabled !== true || !isNightRestTime(date)) return false;
  return dismissedOn == null || dismissedOn !== nightKey(date);
}
