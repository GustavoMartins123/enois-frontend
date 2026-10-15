import * as React from "react";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastVariant = "success" | "error";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  /** Mostra um aviso curto no rodapé. `variant` padrão é "success". */
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;

/**
 * Avisos curtos de operação (publicou, salvou, excluiu, falhou). Centraliza o feedback para as
 * telas não inventarem cada uma a sua forma de avisar — ou de não avisar nada.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const nextId = React.useRef(0);

  const remove = React.useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, variant }]);
      setTimeout(() => remove(id), AUTO_DISMISS_MS);
    },
    [remove],
  );

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4"
        role="region"
        aria-live="polite"
        aria-label="Avisos"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg",
              item.variant === "success"
                ? "border-border-soft bg-surface-card text-text-strong"
                : "border-destructive/40 bg-destructive text-white",
            )}
          >
            {item.variant === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}

            <p className="flex-1 leading-snug">{item.message}</p>

            <button
              type="button"
              onClick={() => remove(item.id)}
              className="shrink-0 opacity-60 transition hover:opacity-100"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  // Sem provider (ex.: teste isolado) devolve um no-op em vez de quebrar a tela.
  return context ?? { toast: () => {} };
}
