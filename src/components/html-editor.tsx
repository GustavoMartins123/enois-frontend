import { useState } from "react";

import { texts } from "@/texts";
import type { HtmlEditorProps } from "@/types/components/html-editor/props";
import { Code2, Eye } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

import { SandboxedHtmlFrame } from "@/components/post/sandboxed-html-frame";

/**
 * Campo de HTML/CSS com pré-visualização ao vivo.
 *
 * É o mesmo editor no post de página, na bio do perfil e na edição de um post: um lugar só decide
 * o aviso do limite, o texto de ajuda e como a pré-visualização aparece — e ela usa o MESMO quadro
 * isolado do render final, então o que o autor vê aqui é o que os outros veem depois.
 */
export function HtmlEditor({
  id,
  value,
  onChange,
  label,
  description,
  placeholder,
  emptyPreview,
  frameTitle,
  maxLength,
  previewClassName,
}: HtmlEditorProps) {
  const [preview, setPreview] = useState(true);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="inline-flex items-center gap-1.5 text-[12px] font-light text-text-subtle"
        >
          <Code2 className="h-3.5 w-3.5" />

          <>{label}</>
        </label>

        <button
          type="button"
          onClick={() => setPreview((current) => !current)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border-soft px-3 py-1 text-[12px] font-light text-text-subtle transition hover:border-primary hover:text-primary"
        >
          <Eye className="h-3.5 w-3.5" />

          <>{preview ? texts.feed.composer.pageEditHtml : texts.feed.composer.pagePreview}</>
        </button>
      </div>

      <p className="mt-1 text-[12px] font-light text-text-subtle">{description}</p>

      <Textarea
        id={id}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 min-h-[160px] font-mono text-[12px]"
      />

      {preview &&
        (value.trim() ? (
          <SandboxedHtmlFrame
            html={value}
            title={frameTitle}
            className={previewClassName ?? "mt-3 h-[320px]"}
          />
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-border-soft px-3 py-6 text-center text-[12px] font-light text-text-subtle">
            {emptyPreview}
          </p>
        ))}
    </div>
  );
}
