import { useState } from "react";

import { AlertTriangle, ChevronDown, Copy } from "lucide-react";

import { ApiError } from "@/lib/api-client";

function describe(err: unknown): { message: string; details: string[] } {
  if (err instanceof ApiError) {
    const details: string[] = [];
    if (err.status) details.push(`HTTP ${err.status}`);
    if (err.code) details.push(err.code);
    if (err.path) details.push(`POST ${err.path}`);
    return { message: err.message, details };
  }
  if (err instanceof Error) {
    return {
      message: err.message,
      details: import.meta.env.DEV ? [err.stack ?? err.name] : [],
    };
  }
  return { message: "Erro inesperado. Tente novamente.", details: [] };
}

const KNOWN_CODES: Record<string, string> = {
  NETWORK_ERROR:
    "O navegador não conseguiu falar com a API. Se você roda localmente, verifique se o backend está de pé (ex.: `docker compose up` ou o servidor Java na porta 8081) e se o VITE_API_BACKEND no .env aponta para ele.",
  INVALID_CREDENTIALS: "E-mail ou senha incorretos. Confira os dados ou use 'Esqueci minha senha'.",
  SESSION_EXPIRED: "Sua sessão expirou. Entre novamente.",
  IDEMPOTENCY_KEY_REQUIRED:
    "O backend rejeitou a requisição por falta de Idempotency-Key. Recarregue a página; se persistir, é bug do front (src/lib/api-client.ts).",
};

export function ErrorBanner({ error, className }: { error: unknown; className?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!error) return null;
  const { message, details } = describe(error);
  const hint = error instanceof ApiError && error.code ? KNOWN_CODES[error.code] : undefined;

  const copy = () => {
    const text = [
      `Erro: ${message}`,
      ...details.map((d) => `  ${d}`),
      hint ? `Sugestão: ${hint}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`space-y-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive ${className ?? ""}`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 p-0.5 text-destructive/70 transition hover:text-destructive"
          aria-label={open ? "Ocultar detalhes" : "Mostrar detalhes"}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="space-y-2 rounded-lg bg-background/40 p-3 text-xs">
          <ul className="list-inside list-disc space-y-0.5 text-destructive/90">
            {details.map((d) => (
              <li key={d} className="break-all font-mono">
                {d}
              </li>
            ))}
          </ul>
          {hint && <p className="font-light text-destructive/90">{hint}</p>}
          {details.length > 0 && (
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 font-medium text-destructive transition hover:underline"
            >
              <Copy className="h-3 w-3" /> {copied ? "Copiado!" : "Copiar detalhes"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
