/**
 * Lembrete de uso saudável.
 *
 * A configuração fica no aparelho (localStorage): quem ativou continua ativado ao reabrir o app.
 * O TEMPO decorrido é da sessão atual — começa quando a página carrega e zera ao recarregar.
 */
import type { HealthyUsageConfig } from "@/types/lib/healthy-usage-config";

const STORAGE_KEY = "connect-grow-healthy-usage";
const CHANGE_EVENT = "connect-grow-healthy-usage-change";
export const HEALTHY_USAGE_DEFAULT: HealthyUsageConfig = { enabled: false, minutes: 30 };
export const HEALTHY_USAGE_MIN_MINUTES = 1;
export const HEALTHY_USAGE_MAX_MINUTES = 240;

export function clampMinutes(value: number): number {
  if (!Number.isFinite(value)) return HEALTHY_USAGE_DEFAULT.minutes;
  return Math.min(
    HEALTHY_USAGE_MAX_MINUTES,
    Math.max(HEALTHY_USAGE_MIN_MINUTES, Math.round(value)),
  );
}

export function readHealthyUsage(): HealthyUsageConfig {
  if (typeof window === "undefined") return HEALTHY_USAGE_DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return HEALTHY_USAGE_DEFAULT;
    const parsed = JSON.parse(raw) as Partial<HealthyUsageConfig>;
    return {
      enabled: parsed.enabled === true,
      minutes: clampMinutes(Number(parsed.minutes ?? HEALTHY_USAGE_DEFAULT.minutes)),
    };
  } catch {
    return HEALTHY_USAGE_DEFAULT;
  }
}

export function writeHealthyUsage(config: HealthyUsageConfig): HealthyUsageConfig {
  const normalized = {
    enabled: config.enabled === true,
    minutes: clampMinutes(config.minutes),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
  return normalized;
}

/** Avisa quando a configuração muda (nesta aba ou em outra). */
export function subscribeHealthyUsage(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
