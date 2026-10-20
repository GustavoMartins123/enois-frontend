import { useRef } from "react";

import { useQuery } from "@tanstack/react-query";

import { REACTION_EMOJIS } from "@/constants/reaction-emojis";
import { usePostCardStore } from "@/stores/post-card.store";
import { texts } from "@/texts";
import type { ReactionTab } from "@/types/application/reaction/reaction-tab";
import type { PostIdProps } from "@/types/components/post/post-id-props";

import { reactionsQueryOptions } from "@/lib/reactions/query-options";
import { sortReactionTabsStable } from "@/lib/reactions/summary";
import { usePostReaction } from "@/lib/reactions/use-post-reaction";
import { cn } from "@/lib/utils";

/**
 * Resumo compacto (emoji + contagem) das reações de um post — agora clicável.
 *
 * Cada pílula alterna a reação: a minha fica destacada em roxo; clicar nela remove, clicar em
 * outra troca. Sem card no store (o blog monta o card num efeito do PostActions) a pílula vira
 * texto, para não existir alvo de clique que não tem onde gravar.
 */
export function ReactionsSummary({ postId }: PostIdProps) {
  const card = usePostCardStore((state) => state.cards[postId]);
  const reactionStatus = card?.reactionStatus ?? null;
  const { data } = useQuery(reactionsQueryOptions(postId));
  const { toggle, isPending } = usePostReaction(postId);

  // A ordem fica no ref: o resumo é otimista, então reordenar a cada clique moveria a pílula no
  // meio do toque. Só a entrada de um tipo novo (ou o primeiro load) reordena por contagem.
  const tabsRef = useRef<ReactionTab[]>([]);
  const tabs = sortReactionTabsStable(tabsRef.current, data?.summary ?? {});
  tabsRef.current = tabs;

  if (tabs.length === 0) return null;

  const clickable = Boolean(card);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {tabs.map(({ type, count }) => {
        const mine = reactionStatus === type;
        const emoji = REACTION_EMOJIS[type] ?? type;
        const pillClassName = cn(
          "inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs transition-colors",
          mine
            ? "border-[#8b5cf6]/40 bg-[#8b5cf6]/15 text-[#c4b5fd] hover:bg-[#8b5cf6]/25"
            : "border-white/10 bg-white/[0.06] text-text-subtle hover:bg-white/10",
        );
        const content = (
          <>
            <span className={cn("text-base leading-none", !mine && "grayscale-[0.3] opacity-80")}>
              {emoji}
            </span>

            <span className="tabular-nums">{count}</span>
          </>
        );

        if (!clickable) {
          return (
            <span key={type} className={pillClassName}>
              {content}
            </span>
          );
        }

        return (
          <button
            key={type}
            type="button"
            aria-pressed={mine}
            // `isPending` é por instância do hook; o flag do store é compartilhado com o
            // PostActions do mesmo post, então as pílulas também bloqueiam a outra instância.
            disabled={card?.reactionPending ?? isPending}
            onClick={() => toggle(type)}
            title={
              mine
                ? texts.posts.reactions.removeWith(emoji)
                : texts.posts.reactions.reactWith(emoji)
            }
            aria-label={
              mine
                ? texts.posts.reactions.removeWith(emoji)
                : texts.posts.reactions.reactWith(emoji)
            }
            // Área de toque acessível: a pílula tem h-7 (~28px), abaixo dos 44px exigidos; o
            // pseudo-elemento before infla só o alvo de toque, sem alterar o visual.
            className={cn(
              pillClassName,
              "relative before:absolute before:-inset-y-2 before:-inset-x-1 before:content-['']",
            )}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
