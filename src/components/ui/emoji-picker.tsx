import { useMemo, useState } from "react";

import { EMOJI_CATEGORIES } from "@/constants/emoji-catalog";
import { texts } from "@/texts";
import type { EmojiPickerProps } from "@/types/components/ui/emoji-picker-props";
import { Smile } from "lucide-react";

import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** Sem acento e em minúsculas: "coração" e "coracao" acham o mesmo emoji. */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Seletor de emojis: a lista na tela para quem escreve no computador (sem teclado de emoji) e para
 * aparelho que não renderiza emoji nenhum.
 *
 * O emoji entra como CARACTERE no texto, então vale em qualquer campo e sobrevive a copiar e colar.
 * Os botões usam `onMouseDown` com `preventDefault` (mesma regra da barra de formatação): o campo
 * de escrita não perde o foco, e é dele que sai a posição do cursor na hora de inserir. O seletor
 * fica aberto depois de escolher — quem quer três emojis seguidos não precisa reabrir.
 */
export function EmojiPicker({ onPick, buttonClassName, buttonTitle }: EmojiPickerProps) {
  const first = EMOJI_CATEGORIES[0]?.id ?? "";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState(first);

  const term = normalize(query.trim());
  const results = useMemo(() => {
    if (term === "") {
      return EMOJI_CATEGORIES.find((category) => category.id === categoryId)?.emojis ?? [];
    }
    const literal = query.trim();
    return EMOJI_CATEGORIES.flatMap((category) => category.emojis).filter(
      (entry) => normalize(entry.name).includes(term) || entry.emoji === literal,
    );
  }, [categoryId, query, term]);

  const keepFocus = (event: { preventDefault: () => void }) => event.preventDefault();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={buttonTitle}
          aria-label={buttonTitle}
          onMouseDown={keepFocus}
          className={buttonClassName}
        >
          <Smile className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" side="top" className="w-72 p-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={texts.posts.formatting.emojiSearch}
          aria-label={texts.posts.formatting.emojiSearch}
          className="h-8 text-xs"
        />

        {term === "" && (
          <div className="mt-2 flex flex-wrap gap-1">
            {EMOJI_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onMouseDown={keepFocus}
                onClick={() => setCategoryId(category.id)}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium transition",
                  category.id === categoryId
                    ? "bg-primary-soft text-primary"
                    : "text-text-subtle hover:bg-surface-2",
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}

        {results.length === 0 ? (
          <p className="py-6 text-center text-xs font-normal text-text-subtle">
            {texts.posts.formatting.emojiEmpty}
          </p>
        ) : (
          <div className="mt-2 grid max-h-56 grid-cols-8 gap-0.5 overflow-y-auto overscroll-contain">
            {results.map((entry, index) => (
              <button
                key={`${entry.emoji}-${index}`}
                type="button"
                title={entry.name}
                aria-label={entry.name}
                onMouseDown={keepFocus}
                onClick={() => onPick(entry.emoji)}
                className="grid h-8 w-8 place-items-center rounded-lg text-lg leading-none transition hover:bg-surface-2"
              >
                {entry.emoji}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
