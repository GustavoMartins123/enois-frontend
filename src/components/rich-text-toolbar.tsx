import { texts } from "@/texts";
import type { RichTextToolbarProps } from "@/types/components/rich-text-toolbar/props";
import type { RichTextFormat } from "@/types/lib/rich-text/rich-text-format";
import {
  Bold,
  Code,
  EyeOff,
  Heading2,
  Italic,
  Link2,
  List,
  Quote,
  Strikethrough,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ACTIONS: { format: RichTextFormat; label: string; icon: typeof Bold }[] = [
  { format: "bold", label: texts.posts.formatting.bold, icon: Bold },
  { format: "italic", label: texts.posts.formatting.italic, icon: Italic },
  { format: "strike", label: texts.posts.formatting.strike, icon: Strikethrough },
  { format: "heading", label: texts.posts.formatting.heading, icon: Heading2 },
  { format: "bulletList", label: texts.posts.formatting.bulletList, icon: List },
  { format: "quote", label: texts.posts.formatting.quote, icon: Quote },
  { format: "code", label: texts.posts.formatting.code, icon: Code },
  { format: "link", label: texts.posts.formatting.link, icon: Link2 },
  { format: "spoiler", label: texts.posts.formatting.spoiler, icon: EyeOff },
];

/**
 * Barra de formatacao do campo de escrita.
 *
 * `onMouseDown` com `preventDefault` mantem o foco (e a selecao) no textarea: sem isso o clique
 * no botao levaria o cursor embora e a formatacao cairia no lugar errado — ou em nada.
 */
export function RichTextToolbar({ onFormat, label, className }: RichTextToolbarProps) {
  return (
    <div role="toolbar" aria-label={label} className={cn("flex flex-wrap gap-0.5", className)}>
      {ACTIONS.map(({ format, label: actionLabel, icon: Icon }) => (
        <button
          key={format}
          type="button"
          title={actionLabel}
          aria-label={actionLabel}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onFormat(format)}
          className="grid h-7 w-7 place-items-center rounded-lg text-text-subtle transition hover:bg-surface-2 hover:text-primary"
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
