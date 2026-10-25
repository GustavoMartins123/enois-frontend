import { useMutation, useQueryClient } from "@tanstack/react-query";

import { usePostCardStore } from "@/stores/post-card.store";
import { texts } from "@/texts";
import type { PostView } from "@/types/application/feed/post-view";
import type { ReactionType } from "@/types/application/reaction/reaction-type";
import type { ReactionsListResponse } from "@/types/application/reaction/reactions-list-response";
import type { ReactionVariables } from "@/types/lib/reactions/reaction-variables";
import type { UsePostReactionResult } from "@/types/lib/reactions/use-post-reaction-result";

import { ApiError, reactionsApi } from "@/lib/api";
import { updatePostInQueryCache } from "@/lib/feed/post-query-cache";
import { useAuth } from "@/lib/use-auth";

import { useToast } from "@/components/ui/toast";

import { reactionsQueryOptions } from "./query-options";
import { applyReactionToSummary, removeReactionFromSummary } from "./summary";

const RAPID_CLICK_WINDOW_MS = 400;

/**
 * Alterna a reação do post de forma otimista.
 *
 * O backend guarda no máximo UMA reação por pessoa: clicar num tipo diferente troca; clicar no
 * mesmo remove. O clique pinta na hora (cache do React Query + store do card) e só depois
 * fala com o servidor; a falha devolve o que estava antes e avisa.
 */
export function usePostReaction(postId: string, post: PostView): UsePostReactionResult {
  const queryClient = useQueryClient();
  const { requireAuth, user } = useAuth();
  const { toast } = useToast();
  const setReactionPending = usePostCardStore((state) => state.setReactionPending);

  const reactionStatus = post.currentUserReaction ?? null;
  const queryKey = reactionsQueryOptions(postId).queryKey;
  const mutationKey = ["post-reaction", postId] as const;

  const mutation = useMutation({
    mutationKey,
    mutationFn: ({ type, remove }: ReactionVariables) =>
      remove ? reactionsApi.removeReaction(postId) : reactionsApi.react(postId, type),
    onMutate: async ({ type, remove }) => {
      // Cancela leituras em andamento para uma resposta antiga não sobrescrever o otimismo.
      await queryClient.cancelQueries({ queryKey });

      const previousSummary = queryClient.getQueryData<ReactionsListResponse>(queryKey);
      const previousReaction = reactionStatus;
      const previousCounters = post.counters;

      setReactionPending(postId, true);
      const delta = remove ? -1 : previousReaction && previousReaction !== type ? 0 : 1;
      updatePostInQueryCache(queryClient, postId, (current) => {
        const baseSummary = current.reactionSummary ?? {};
        const withoutMine =
          previousReaction && previousReaction !== type
            ? removeReactionFromSummary(baseSummary, previousReaction)
            : baseSummary;
        return {
          ...current,
          currentUserReaction: remove ? null : type,
          counters: {
            ...current.counters,
            reactions: Math.max(0, current.counters.reactions + delta),
          },
          reactionSummary: remove
            ? removeReactionFromSummary(baseSummary, previousReaction ?? type)
            : applyReactionToSummary(withoutMine, type),
        };
      });

      // A lista do diálogo recebe a minha entrada na hora; o refetch do fim troca pela do servidor.
      queryClient.setQueryData<ReactionsListResponse>(queryKey, (current) => {
        // Sem cache (o card leu o resumo do próprio post), parte das contagens do feed, não de zero.
        const base = current ?? {
          summary: post.reactionSummary ?? {},
          reactions: [],
          partial: true,
        };
        const myId = user?.id;
        const others = myId ? base.reactions.filter((r) => r.userId !== myId) : base.reactions;
        const withoutMine =
          previousReaction && previousReaction !== type
            ? removeReactionFromSummary(base.summary, previousReaction)
            : base.summary;
        const summary = remove
          ? removeReactionFromSummary(base.summary, previousReaction ?? type)
          : applyReactionToSummary(withoutMine, type);
        const reactions =
          myId && !remove
            ? [{ userId: myId, type, createdAt: new Date().toISOString() }, ...others]
            : others;

        return { ...base, summary, reactions };
      });

      return { previousSummary, previousReaction, previousCounters };
    },
    onError: (error, _variables, context) => {
      // Desfaz o otimismo e explica. 403 é PERMISSÃO (não derruba a sessão); 401 já é tratado
      // pelo api-client (renova o token ou manda para o login).
      if (context) {
        if (context.previousSummary !== undefined) {
          queryClient.setQueryData(queryKey, context.previousSummary);
        } else {
          // Sem cache anterior não há o que restaurar: remove para a reação otimista não ficar
          // "fantasma" no resumo até o próximo refetch.
          queryClient.removeQueries({ queryKey });
        }

        updatePostInQueryCache(queryClient, postId, (current) => ({
          ...current,
          currentUserReaction: context.previousReaction,
          counters: context.previousCounters ?? current.counters,
        }));
      }

      if (error instanceof ApiError && error.status === 403) {
        toast(texts.posts.reactions.restrictedError, "error");
      } else if (error instanceof ApiError && error.status === 429) {
        toast(texts.posts.reactions.rateLimitError, "error");
      } else if (error instanceof ApiError && error.status === 401) {
        // Sessão morta mesmo após o refresh: o api-client já limpou e mandou para o login.
        toast(texts.posts.reactions.sessionError, "error");
      } else if (error instanceof ApiError && error.status === 0) {
        // Nenhuma resposta chegou (rede caiu, proxy bloqueou o preflight): dizer "não foi
        // possível reagir" sem isso faz a pessoa achar que o botão está quebrado.
        toast(texts.posts.reactions.networkError, "error");
      } else {
        toast(texts.posts.reactions.error, "error");
      }
    },
    onSuccess: (result) => {
      // A resposta traz as contagens exatas do servidor — melhor que o palpite otimista.
      if (result && "counters" in result && result.counters) {
        updatePostInQueryCache(queryClient, postId, (current) => ({
          ...current,
          counters: result.counters ?? current.counters,
        }));
      }
    },
    onSettled: () => {
      // Uma única revalidação no fim: o cache volta a refletir o servidor (some a entrada otimista).
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      setReactionPending(postId, false);
    },
  });

  const toggle = (type: ReactionType) => {
    if (!requireAuth()) return;
    const currentCard = usePostCardStore.getState().cards[postId];
    // O cache marca a mutação como pendente antes do await em onMutate, inclusive entre
    // as instâncias de PostActions e ReactionsSummary. A janela curta também absorve
    // o segundo clique quando a resposta chega antes de um duplo clique terminar.
    const now = Date.now();
    const hasRecentMutation = queryClient
      .getMutationCache()
      .findAll({ mutationKey, exact: true })
      .some(
        ({ state }) =>
          state.status === "pending" || now - state.submittedAt < RAPID_CLICK_WINDOW_MS,
      );
    if (hasRecentMutation || currentCard?.reactionPending) return;
    // Sem sessão não há o que alternar: o requireAuth já mandou para o login.
    const current = queryClient.getQueryData<PostView>(["post", postId]) ?? post;
    const mine = current.currentUserReaction ?? null;
    // Reagir de novo no MESMO emoji remove; trocar de emoji troca. Sem estado anterior, reage.
    mutation.mutate({ type, remove: mine !== null && mine === type });
  };

  return { toggle, isPending: mutation.isPending, reactionStatus };
}
