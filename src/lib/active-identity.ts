/**
 * Qual identidade a interface está usando AGORA (social ou profissional).
 *
 * É conveniência de interface, não autorização: o backend decide a autoria de cada
 * publicação e valida as permissões sempre. A escolha fica no aparelho (como o tema) e
 * é derrubada para SOCIAL quando o perfil profissional não existe ou não está ativo.
 */
import type { CorporateProfileView } from "@/types/application/corporate/corporate-profile-view";
import type { ActiveIdentity } from "@/types/lib/active-identity";

const STORAGE_KEY = "connect-grow-active-identity";
const CHANGE_EVENT = "connect-grow-active-identity-change";

export function readActiveIdentity(): ActiveIdentity {
  if (typeof window === "undefined") return "SOCIAL";
  return window.localStorage.getItem(STORAGE_KEY) === "CORPORATE" ? "CORPORATE" : "SOCIAL";
}

export function writeActiveIdentity(identity: ActiveIdentity): ActiveIdentity {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, identity);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
  return identity;
}

/**
 * A identidade efetiva: escolher "profissional" só vale com perfil ATIVO. Sem perfil (ou
 * em rascunho/desativado), a interface usa a social — nunca a de outra pessoa.
 */
export function effectiveIdentity(
  chosen: ActiveIdentity,
  profile: CorporateProfileView | null | undefined,
): ActiveIdentity {
  return chosen === "CORPORATE" && profile?.exists && profile.status === "ACTIVE"
    ? "CORPORATE"
    : "SOCIAL";
}

export function subscribeActiveIdentity(listener: () => void): () => void {
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
