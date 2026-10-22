import { useEffect, useState } from "react";

import { readLiteMode, subscribeLiteFlags } from "./lite-mode";

/**
 * Modo lite ligado neste aparelho?
 *
 * Lê o espelho local (que o LiteModeEffects mantém sincronizado com a conta) e reage quando a
 * chave muda — assim o mesmo valor vale no servidor e no cliente sem piscar: o primeiro render é
 * sempre `false`, como no HTML do servidor, e o valor real entra logo depois da montagem.
 */
export function useLiteMode(): boolean {
  const [lite, setLite] = useState(false);

  useEffect(() => {
    const read = () => setLite(readLiteMode());
    read();
    return subscribeLiteFlags(read);
  }, []);

  return lite;
}
