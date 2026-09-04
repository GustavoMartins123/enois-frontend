import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const MINUTE_IN_MS = 60_000;
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1_000;

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";

  const date = parseISO(iso);
  if (!isValid(date)) return "";

  const distance = Math.abs(Date.now() - date.getTime());

  if (distance < MINUTE_IN_MS) return "agora";

  return distance < WEEK_IN_MS
    ? formatDistanceToNowStrict(date, { addSuffix: true, locale: ptBR })
    : format(date, "dd/MM/yyyy");
}
