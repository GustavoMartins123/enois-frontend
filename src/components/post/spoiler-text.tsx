import { useState } from "react";

import { texts } from "@/texts";
import type { SpoilerTextProps } from "@/types/components/post/spoiler-text-props";

import { cn } from "@/lib/utils";

/**
 * Trecho com spoiler: o texto fica ofuscado até a pessoa tocar para exibir.
 *
 * É a forma de esconder **só uma frase** no meio de um post — quem está num grupo de filmes conta a
 * cena sem estragar para quem ainda não viu, e quem quiser lê toca.
 *
 * Limite honesto: o texto está no documento (borrado, não ausente), então quem abrir o código-fonte
 * consegue ler. Isso vale para todo spoiler de rede social — aqui o objetivo é evitar o esbarrão,
 * não esconder de quem procura.
 */
export function SpoilerText({ text }: SpoilerTextProps) {
  const [shown, setShown] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setShown((current) => !current)}
      aria-expanded={shown}
      title={shown ? texts.posts.formatting.spoilerHide : texts.posts.formatting.spoilerShow}
      className={cn(
        "cursor-pointer rounded-md px-1 text-left transition",
        shown
          ? "bg-surface-2 text-text-strong"
          : "bg-text-strong/90 text-transparent blur-[5px] select-none hover:blur-[3px]",
      )}
    >
      {text}
    </button>
  );
}
