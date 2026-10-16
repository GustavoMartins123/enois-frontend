import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { UserSearchResult } from "@/types/application/user/user-search-result";
import type { Props } from "@/types/components/mention-textarea/props";
import type { RichTextFormat } from "@/types/lib/rich-text/rich-text-format";

import { usersApi } from "@/lib/api";
import { applyFormat } from "@/lib/rich-text/apply-format";

import { CharCounter } from "@/components/ui/char-counter";

import { RichTextToolbar } from "@/components/rich-text-toolbar";
import { UserAvatar } from "@/components/user-avatar";

/** Altura mínima da caixa, em linhas de texto, para dar espaço de revisar o que foi escrito. */
const MIN_ROWS = 4;

/** Atalhos de teclado da formatacao; `mod` e Ctrl no Windows/Linux e Cmd no Mac. */
const SHORTCUTS: Record<string, RichTextFormat> = {
  b: "bold",
  i: "italic",
  e: "code",
  k: "link",
};

export function MentionTextarea({
  value,
  onChange,
  placeholder,
  className = "",
  maxLength,
  rows,
  toolbar = false,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [mentionedIds, setMentionedIds] = useState<string[]>([]);

  const { data: results = [] } = useQuery({
    queryKey: ["users", "search", mentionQuery],
    queryFn: () => usersApi.search(mentionQuery),
    enabled: mentionQuery.length >= 2,
  });

  useEffect(() => {
    setSelectedIdx(0);
  }, [results.length]);

  // Acompanha o texto: cresce conforme você escreve e encolhe ao apagar, nunca
  // ficando menor que MIN_ROWS linhas — assim dá pra reler e editar o que digitou.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const styles = getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight) || 20;
    const verticalPadding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const minHeight = MIN_ROWS * lineHeight + verticalPadding;

    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  }, [value]);

  const updateMention = (text: string, cursor: number) => {
    const before = text.slice(0, cursor);
    const at = before.lastIndexOf("@");
    if (at === -1) {
      setMentionQuery("");
      setMentionIndex(-1);
      return;
    }
    const term = before.slice(at + 1);
    if (term.includes(" ") || term.includes("\n") || term.length === 0) {
      setMentionQuery("");
      setMentionIndex(-1);
      return;
    }
    setMentionQuery(term);
    setMentionIndex(at);
  };

  const handleInput = (e: FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const next = el.value;
    const cursor = el.selectionStart;
    updateMention(next, cursor);
    onChange(next, mentionedIds);
  };

  const pick = (user: UserSearchResult) => {
    if (mentionIndex === -1) return;
    const before = value.slice(0, mentionIndex);
    const after = value.slice(mentionIndex + mentionQuery.length + 1);
    const next = `${before}@${user.username} ${after}`;
    setMentionQuery("");
    setMentionIndex(-1);
    const ids = mentionedIds.includes(user.id) ? mentionedIds : [...mentionedIds, user.id];
    setMentionedIds(ids);
    onChange(next, ids);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const pos = before.length + user.username.length + 2;
        textareaRef.current.setSelectionRange(pos, pos);
        textareaRef.current.focus();
      }
    });
  };

  /** Formata o trecho selecionado e devolve o foco/cursor para dentro do campo. */
  const formatSelection = (format: RichTextFormat) => {
    const element = textareaRef.current;
    if (!element) return;

    const result = applyFormat(value, element.selectionStart, element.selectionEnd, format);
    onChange(result.value, mentionedIds);

    // O valor volta pelo `value` (componente controlado): a selecao so pode ser reposta depois
    // do proximo paint, quando o textarea ja tem o texto novo.
    requestAnimationFrame(() => {
      const node = textareaRef.current;
      if (!node) return;
      node.focus();
      node.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (toolbar && (e.ctrlKey || e.metaKey) && !e.altKey) {
      const shortcut = SHORTCUTS[e.key.toLowerCase()];
      if (shortcut) {
        e.preventDefault();
        formatSelection(shortcut);
        return;
      }
    }

    if (mentionIndex === -1 || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => (i + 1) % results.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => (i - 1 + results.length) % results.length);
      return;
    }
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      pick(results[selectedIdx]);
      return;
    }
    if (e.key === "Escape") {
      setMentionQuery("");
      setMentionIndex(-1);
    }
  };

  return (
    <div className="relative min-w-0 flex-1">
      {toolbar && (
        <RichTextToolbar
          label={texts.posts.formatting.toolbar}
          onFormat={formatSelection}
          className="mb-1.5"
        />
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onInput={handleInput}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className={`w-full resize-none ${className}`}
        maxLength={maxLength}
        rows={rows}
      />

      {/* Mesmo contador de todo campo com limite (Input/Textarea usam o CharCounter via withCounter):
          um so lugar decide o aviso de "perto do limite" e o "limite atingido". */}
      {maxLength !== undefined && <CharCounter length={value.length} max={maxLength} />}

      {mentionQuery.length >= 2 && results.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg">
          {results.map((user, i) => (
            <button
              key={user.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                pick(user);
              }}
              onMouseEnter={() => setSelectedIdx(i)}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition ${
                i === selectedIdx ? "bg-muted" : "hover:bg-muted"
              }`}
            >
              <UserAvatar src={user.avatar} alt={user.name} className="h-8 w-8 shrink-0" />

              <div className="min-w-0">
                <p className="truncate font-medium">{user.name}</p>

                <p className="truncate text-xs text-muted-foreground">
                  {texts.mentions.username(user.username)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
