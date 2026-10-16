import { type ReactNode, useMemo } from "react";

import { Link } from "@tanstack/react-router";

import type { RichTextProps } from "@/types/components/post/rich-text-props";
import type { RichNode } from "@/types/lib/rich-text/rich-node";

import { parseRichText } from "@/lib/rich-text/parse";
import { cn } from "@/lib/utils";

/**
 * Renderiza a formatacao leve do post/comentario.
 *
 * Sai como elementos React (nao ha `dangerouslySetInnerHTML` em lugar nenhum): o pior caso de um
 * texto malicioso aqui e aparecer como texto. Posts sem formatacao passam pelo mesmo caminho e
 * saem identicos ao que saiam antes — paragrafos usam `whitespace-pre-line`, entao quebras e
 * linhas vazias continuam valendo.
 */
export function RichText({ content, className }: RichTextProps) {
  const blocks = useMemo(() => parseRichText(content), [content]);

  return <div className={className}>{blocks.map(renderBlock)}</div>;
}

function renderBlock(block: RichNode, key: number): ReactNode {
  switch (block.kind) {
    case "heading":
      return (
        <p key={key} className={cn("mt-2 font-medium", HEADING_SIZE[block.level ?? 1])}>
          {renderInline(block.children ?? [])}
        </p>
      );

    case "quote":
      return (
        <blockquote key={key} className="my-2 border-l-2 border-border-soft pl-3 text-text-subtle">
          {renderInline(block.children ?? [])}
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre
          key={key}
          className="my-2 overflow-x-auto rounded-xl bg-surface-1 p-3 text-[13px] leading-relaxed"
        >
          <code>{block.text}</code>
        </pre>
      );

    case "divider":
      return <hr key={key} className="my-3 border-border-soft" />;

    case "list":
      return block.ordered ? (
        <ol key={key} className="my-2 list-decimal space-y-1 pl-5">
          {block.children?.map(renderBlock)}
        </ol>
      ) : (
        <ul key={key} className="my-2 list-disc space-y-1 pl-5">
          {block.children?.map(renderBlock)}
        </ul>
      );

    case "listItem":
      return (
        <li key={key} className="whitespace-pre-line break-words">
          {renderInline(block.children ?? [])}
        </li>
      );

    default:
      return (
        <p key={key} className="whitespace-pre-line break-words">
          {renderInline(block.children ?? [])}
        </p>
      );
  }
}

function renderInline(nodes: RichNode[]): ReactNode {
  return nodes.map((node, index) => {
    switch (node.kind) {
      case "bold":
        return (
          <strong key={index} className="font-medium">
            {node.text}
          </strong>
        );

      case "italic":
        return <em key={index}>{node.text}</em>;

      case "strike":
        return <s key={index}>{node.text}</s>;

      case "code":
        return (
          <code key={index} className="rounded bg-surface-1 px-1.5 py-0.5 text-[13px]">
            {node.text}
          </code>
        );

      case "mention":
        return (
          <Link
            key={index}
            to="/perfil/$username"
            params={{ username: (node.text ?? "").replace("@", "") }}
            className="font-medium text-primary hover:underline"
          >
            {node.text}
          </Link>
        );

      case "link":
        return (
          <a
            key={index}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-words text-primary hover:underline"
          >
            {node.text}
          </a>
        );

      default:
        return node.text;
    }
  });
}

const HEADING_SIZE: Record<number, string> = {
  1: "text-[18px]",
  2: "text-[16px]",
  3: "text-[15px]",
};
