/** Janela do lembrete de descanso, no relógio local do dispositivo (nunca UTC do servidor). */
export const NIGHT_REST_START_HOUR = 0;
export const NIGHT_REST_END_HOUR = 5;

/** 00:00 até 04:59:59.999 no fuso do aparelho. */
export function isNightRestTime(date: Date): boolean {
  const hour = date.getHours();
  return hour >= NIGHT_REST_START_HOUR && hour < NIGHT_REST_END_HOUR;
}

/**
 * O popup só aparece com a preferência ligada e dentro da janela. Preferência ainda carregando
 * ou com erro é `undefined` — nesse caso não aparece, para uma falha de rede nunca surpreender
 * quem está usando o feed.
 */
export function shouldShowNightRest(enabled: boolean | undefined, date: Date): boolean {
  return enabled === true && isNightRestTime(date);
}
