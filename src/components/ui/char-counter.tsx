import { texts } from "@/texts";

import { cn } from "@/lib/utils";

/**
 * Contador de caracteres restantes de um campo de escrita.
 *
 * Fica colado nos componentes de Input/Textarea (ver `withCounter`), entao TODO campo com `maxLength`
 * mostra quanto falta — sem cada formulario precisar lembrar de renderizar o aviso.
 */
/** A partir daqui o contador chama atencao: ainda cabe, mas esta perto do fim. */
const WARNING_AT = 20;

export function CharCounter({
  length,
  max,
  className,
}: {
  length: number;
  max: number;
  className?: string;
}) {
  const remaining = max - length;
  const nearLimit = remaining > 0 && remaining <= WARNING_AT;

  return (
    <p
      className={cn(
        "mt-1 text-right text-xs font-normal text-text-subtle",
        nearLimit && "text-primary",
        remaining <= 0 && "text-destructive",
        className,
      )}
      aria-live="polite"
    >
      {remaining > 0 ? texts.common.charactersLeft(remaining) : texts.common.charactersLimitReached}
    </p>
  );
}
