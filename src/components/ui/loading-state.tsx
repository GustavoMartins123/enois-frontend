import type { LoadingStateProps } from "@/types/components/ui/loading-state-props";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/** Carregando padronizado: mesmo ícone, mesmo tamanho e mesma cor em toda tela. */
export function LoadingState({ label, className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground",
        className,
      )}
      role="status"
    >
      <Loader2 className="h-5 w-5 animate-spin text-primary" />

      {label && <p className="text-[13px] font-light">{label}</p>}
    </div>
  );
}
