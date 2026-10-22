import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { REACTION_EMOJIS } from "@/constants/reaction-emojis";
import { texts } from "@/texts";
import type { ReactionType } from "@/types/application/reaction/reaction-type";
import type { MediaItem } from "@/types/routes/feed/media-item";
import type { ConversationHeaderProps } from "@/types/routes/messages/conversation-header-props";
import type { ConversationItemProps } from "@/types/routes/messages/conversation-item-props";
import type { SendMessageInput } from "@/types/routes/messages/send-message-input";
import { ArrowLeft, Image as ImageIcon, Search, Send, Smile, X } from "lucide-react";

import { messagesApi, networkApi, profileApi } from "@/lib/api";
import { useCurrentUser } from "@/lib/current-user";
import { liteInterval, litePageSize } from "@/lib/lite-mode";
import { requireAuth } from "@/lib/require-auth";
import { insertSnippet } from "@/lib/rich-text/insert-snippet";
import { useLiteMode } from "@/lib/use-lite-mode";
import { useMediaUpload } from "@/lib/use-media-upload";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

import { AppContainer } from "@/components/app-container";
import { MediaGrid } from "@/components/post/media-grid";
import { ReactionPicker } from "@/components/post/reaction-picker";
import { RichText } from "@/components/post/rich-text";
import { ConversationListSkeletons } from "@/components/skeletons/conversation-list-skeletons";
import { MessageSkeletons } from "@/components/skeletons/message-skeletons";
import { UserAvatar } from "@/components/user-avatar";
import { UserBadges } from "@/components/user-badge";

export const Route = createFileRoute("/mensagens")({
  beforeLoad: requireAuth,
  // Permite abrir direto numa conversa (ex.: botao "Mensagem" do perfil passa o id).
  validateSearch: (search: Record<string, unknown>): { conversation?: string } => ({
    conversation: typeof search.conversation === "string" ? search.conversation : undefined,
  }),
  head: () => ({ meta: [{ title: texts.messages.seoTitle }] }),
  component: Mensagens,
});

/** Tamanhos que o app sempre usou; em modo lite cada página vem maior (menos idas ao servidor). */
const CONVERSATIONS_PAGE_SIZE = 20;
const MESSAGES_PAGE_SIZE = 50;

function Mensagens() {
  const { conversation } = Route.useSearch();
  const lite = useLiteMode();
  // Inscrito na query do /me: quando a resposta chega, a tela redesenha com o id certo (sem
  // isso, a busca de "outro participante" ficava com o id de quem esta olhando).
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id ?? null;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const upload = useMediaUpload();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [text, setText] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [inboxTab, setInboxTab] = useState<"all" | "jobs" | "people" | "archived">("all");
  const [selecting, setSelecting] = useState(false);
  const [selectingMessages, setSelectingMessages] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  // Veio de um link/perfil com uma conversa: abre ela direto.
  useEffect(() => {
    if (conversation) setActiveId(conversation);
  }, [conversation]);

  // Paginado por cursor: a primeira pagina so traz as mais recentes — sem carregar as anteriores
  // (muitas vindas de vaga) as conversas/mensagens antigas ficavam inalcancaveis.
  const {
    data: conversationsData,
    fetchNextPage: fetchMoreConversations,
    hasNextPage: hasMoreConversations,
    isFetchingNextPage: isLoadingMoreConversations,
    isLoading: isLoadingConversations,
  } = useInfiniteQuery({
    queryKey: ["conversations", inboxTab === "archived" ? "archived" : "inbox"],
    queryFn: ({ pageParam }) =>
      inboxTab === "archived"
        ? messagesApi.archivedConversations(pageParam, litePageSize(CONVERSATIONS_PAGE_SIZE, lite))
        : messagesApi.listConversations(pageParam, litePageSize(CONVERSATIONS_PAGE_SIZE, lite)),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    refetchInterval: liteInterval(15_000, lite),
  });

  // O servidor ordena por updatedAt; reforçamos no cliente pelo horário da última mensagem —
  // é isso que a pessoa enxerga na lista ("quem falou por último fica no topo").
  const conversations = [...(conversationsData?.pages.flatMap((page) => page.items) ?? [])].sort(
    (a, b) => (b.time ? Date.parse(b.time) : 0) - (a.time ? Date.parse(a.time) : 0),
  );
  // Separa a caixa de entrada: conversas de vaga (candidatura) x conversas com pessoas.
  // Arquivadas não separa por tipo: é a lista de quem foi apagado "para mim", e ali a pessoa quer
  // reencontrar o que sumiu, não filtrar.
  const visibleConversations = conversations.filter((c) =>
    inboxTab === "archived" || inboxTab === "all"
      ? true
      : inboxTab === "jobs"
        ? c.kind === "JOB"
        : c.kind !== "JOB",
  );
  const activeConversation = activeId ? conversations.find((c) => c.id === activeId) : null;

  const {
    data: messagesData,
    fetchNextPage: fetchOlderMessages,
    hasNextPage: hasOlderMessages,
    isFetchingNextPage: isLoadingOlder,
    isLoading: isLoadingMessages,
    isPlaceholderData: showingPreviousThread,
  } = useInfiniteQuery({
    queryKey: ["messages", activeConversation?.id],
    queryFn: ({ pageParam }) =>
      messagesApi.listMessages(
        activeConversation!.id,
        pageParam,
        litePageSize(MESSAGES_PAGE_SIZE, lite),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!activeConversation,
    // Trocando de conversa, o filao anterior fica na tela ate o novo chegar: sem isso a area de
    // mensagens esvaziava e o skeleton piscava a cada clique da lista. Enquanto e o filao antigo
    // (placeholder) os botoes por mensagem estao inertes — aqueles ids nao sao da conversa aberta.
    placeholderData: keepPreviousData,
    refetchInterval: liteInterval(10_000, lite),
  });

  const messages = (messagesData?.pages.flatMap((page) => page.items) ?? []).sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );

  const { data: searchResults } = useQuery({
    queryKey: ["network", "users", searchQuery],
    queryFn: () => networkApi.list(searchQuery),
    enabled: searchQuery.length > 0,
  });

  const filteredUsers = (searchResults?.items ?? []).filter((u) => u.id !== currentUserId);

  const sendMessage = useMutation({
    mutationFn: ({ conversationId, text, mediaIds }: SendMessageInput) =>
      messagesApi.sendMessage(conversationId, text, mediaIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const reactToMessage = useMutation({
    mutationFn: ({ messageId, type }: { messageId: string; type: string }) =>
      messagesApi.react(activeConversation!.id, messageId, type),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["messages", activeConversation?.id] }),
  });

  const createConversation = useMutation({
    mutationFn: (participantId: string) =>
      messagesApi.createConversation({ kind: "DIRECT", participantIds: [participantId] }),
    onSuccess: (conv) => {
      setActiveId(conv.id);
      setShowSearch(false);
      setSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Apagar MENSAGEM para mim: some só para quem apagou (o outro continua vendo na conversa dele).
  const hideMessages = useMutation({
    mutationFn: () =>
      messagesApi.hideMessages(activeConversation!.id, Array.from(selectedMessages)),
    onSuccess: () => {
      setSelectedMessages(new Set());
      setSelectingMessages(false);
      queryClient.invalidateQueries({ queryKey: ["messages", activeConversation?.id] });
      toast(texts.messages.messagesDeleted);
    },
    onError: () => toast(texts.messages.messagesDeleteError, "error"),
  });

  const restoreSelected = useMutation({
    mutationFn: () => messagesApi.unhideConversations(Array.from(selected)),
    onSuccess: () => {
      setSelected(new Set());
      setSelecting(false);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast(texts.messages.restored);
    },
    onError: () => toast(texts.messages.restoreError, "error"),
  });

  const hideSelected = useMutation({
    mutationFn: () => messagesApi.hideConversations(Array.from(selected)),
    onSuccess: () => {
      setConfirmDelete(false);
      setSelecting(false);
      setSelected(new Set());
      toast(texts.messages.deleted);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => toast(texts.communities.actionError, "error"),
  });

  const toggleSelected = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const markAsRead = useMutation({
    mutationFn: (conversationId: string) => messagesApi.markAsRead(conversationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeConversation || sendMessage.isPending) return;
    const content = text.trim();
    if (!content && media.length === 0) return;
    // Limpa na hora para evitar reenvio se Enter disparar duas vezes antes do onSuccess.
    setText("");
    setMedia([]);
    setUploadError(null);
    try {
      let mediaIds: string[] = [];
      if (media.length > 0) {
        const results = await upload.uploadAll(media.map((item) => ({ file: item.file })));
        mediaIds = results.map((result) => result.mediaId);
      }
      sendMessage.mutate({ conversationId: activeConversation.id, text: content, mediaIds });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : texts.messages.mediaError);
    }
  };

  const addMediaFiles = (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) return;
    setMedia((current) => {
      const room = 4 - current.length;
      if (room <= 0) {
        setUploadError(texts.messages.mediaLimit);
        return current;
      }
      setUploadError(null);
      return [
        ...current,
        ...images.slice(0, room).map((file) => ({
          type: "image" as const,
          file,
          preview: URL.createObjectURL(file),
        })),
      ];
    });
  };

  const handleMediaSelect = (event: ChangeEvent<HTMLInputElement>) => {
    addMediaFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const removeMediaItem = (index: number) => {
    setMedia((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, i) => i !== index);
    });
  };

  // Campo de mensagem cresce com o texto (teto 128px) e volta a 1 linha ao enviar.
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = messageInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [text]);

  /** Emoji do seletor: entra na posição do cursor (o campo é o mesmo, então vale para o chat). */
  const insertEmoji = (emoji: string) => {
    const el = messageInputRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? start;
    const result = insertSnippet(text, start, end, emoji);
    setText(result.value);

    requestAnimationFrame(() => {
      const node = messageInputRef.current;
      if (!node) return;
      node.focus();
      node.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const activeMessages = activeConversation ? messages : [];

  const otherParticipantId = activeConversation?.participantIds.find((id) => id !== currentUserId);
  const { data: otherUser } = useQuery({
    queryKey: ["profile", "by-id", otherParticipantId],
    queryFn: () => profileApi.getById(otherParticipantId ?? ""),
    enabled: !!otherParticipantId,
  });

  // Rola para o fim quando chega mensagem nova — mas NAO quando o usuario carrega mensagens
  // antigas (senao a lista salta para o fim e ele perde o ponto em que estava lendo).
  const newestMessageId =
    activeMessages.length > 0 ? activeMessages[activeMessages.length - 1].id : null;
  const lastScrolledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!newestMessageId || lastScrolledRef.current === newestMessageId) return;
    lastScrolledRef.current = newestMessageId;
    // Rola DENTRO do quadro de mensagens: `scrollIntoView` fazia o navegador rolar a página
    // inteira quando o teclado abria no mobile.
    const el = messagesScrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [newestMessageId]);

  return (
    <AppContainer>
      {/* `dvh` nos dois tamanhos: `100vh` no desktop é o valor que não encolhe quando a barra
          do navegador aparece no celular, e aí o compositor ficava escondido atrás do teclado. */}
      <div className="-my-4 grid h-[calc(100dvh-3.5rem)] grid-cols-1 overflow-hidden overscroll-none sm:-my-6 sm:h-[calc(100dvh-4rem)] md:my-0 md:h-[calc(100dvh-7rem)] md:grid-cols-[320px_minmax(0,1fr)] md:rounded-2xl md:border md:border-border-soft md:bg-surface-card md:shadow-card">
        <div
          className={`flex min-h-0 flex-col border-r border-border ${activeConversation ? "hidden md:flex" : "flex"}`}
        >
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-semibold">{texts.messages.title}</h1>

              <div className="flex gap-2">
                {!selecting && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setSelecting(true)}
                  >
                    {texts.messages.selectMode}
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  {showSearch ? texts.messages.back : texts.messages.new}
                </Button>
              </div>
            </div>
            {showSearch ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={texts.messages.searchContacts}
                    className="h-9 rounded-full bg-muted pl-9"
                    autoFocus
                  />
                </div>
                {searchQuery && (
                  <div className="space-y-1">
                    {filteredUsers.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        {texts.messages.noContact}
                      </p>
                    ) : (
                      filteredUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => createConversation.mutate(u.id)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-muted"
                        >
                          <UserAvatar src={u.avatar} alt={u.name} className="h-10 w-10" />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{u.name}</p>

                            <p className="truncate text-xs text-muted-foreground">{u.headline}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={texts.messages.searchConversations}
                  className="h-9 rounded-full bg-muted pl-9"
                />
              </div>
            )}
          </div>

          <div className="flex gap-1 border-b border-border px-3 pb-2">
            {(["all", "jobs", "people", "archived"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setInboxTab(tab)}
                className={`rounded-full px-3 py-1 text-xs font-normal transition ${
                  inboxTab === tab
                    ? "bg-primary-soft text-primary"
                    : "text-text-subtle hover:bg-surface-2"
                }`}
              >
                {texts.messages.tabs[tab]}
              </button>
            ))}
          </div>

          {selecting && (
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-2 px-3 py-2">
              <button
                type="button"
                className="text-xs font-normal text-primary hover:underline"
                onClick={() =>
                  setSelected(
                    selected.size === visibleConversations.length
                      ? new Set()
                      : new Set(visibleConversations.map((c) => c.id)),
                  )
                }
              >
                {selected.size === visibleConversations.length
                  ? texts.messages.clearSelection
                  : texts.messages.selectAll}
              </button>

              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setSelecting(false);
                    setSelected(new Set());
                  }}
                >
                  {texts.messages.cancelSelection}
                </Button>

                {inboxTab === "archived" ? (
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={selected.size === 0 || restoreSelected.isPending}
                    onClick={() => restoreSelected.mutate()}
                  >
                    {texts.messages.restoreSelected(selected.size)}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-full"
                    disabled={selected.size === 0 || hideSelected.isPending}
                    onClick={() => setConfirmDelete(true)}
                  >
                    {texts.messages.deleteSelected(selected.size)}
                  </Button>
                )}
              </div>
            </div>
          )}

          <ul className="flex-1 overflow-y-auto overscroll-contain">
            {isLoadingConversations ? (
              <li>
                <ConversationListSkeletons />
              </li>
            ) : visibleConversations.length === 0 ? (
              <li className="p-4 text-center text-sm text-muted-foreground">
                {inboxTab === "archived"
                  ? texts.messages.noArchived
                  : texts.messages.noConversations}
              </li>
            ) : (
              visibleConversations.map((c) => (
                <ConversationItem
                  key={c.id}
                  conversation={c}
                  isActive={c.id === (activeConversation?.id ?? "")}
                  selecting={selecting}
                  selected={selected.has(c.id)}
                  onToggle={() => toggleSelected(c.id)}
                  onSelect={() => {
                    if (selecting) {
                      toggleSelected(c.id);
                      return;
                    }
                    setActiveId(c.id);
                    if (c.unread > 0) markAsRead.mutate(c.id);
                  }}
                />
              ))
            )}

            {hasMoreConversations && (
              <li className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full rounded-full text-xs"
                  disabled={isLoadingMoreConversations}
                  onClick={() => fetchMoreConversations()}
                >
                  {isLoadingMoreConversations
                    ? texts.messages.loadingOlder
                    : texts.messages.loadMoreConversations}
                </Button>
              </li>
            )}
          </ul>
        </div>

        <div
          className={`flex min-h-0 min-w-0 flex-col ${!activeConversation ? "hidden md:flex" : "flex"}`}
        >
          {!activeConversation ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">{texts.messages.selectConversation}</p>
            </div>
          ) : (
            <>
              <ConversationHeader
                action={
                  selectingMessages ? undefined : (
                    <button
                      type="button"
                      onClick={() => setSelectingMessages(true)}
                      className="rounded-full px-3 py-1 text-xs font-normal text-text-subtle transition hover:bg-surface-2 hover:text-primary"
                    >
                      {texts.messages.selectMessages}
                    </button>
                  )
                }
                conversation={activeConversation}
                onBack={() => setActiveId(null)}
              />

              <div
                ref={messagesScrollRef}
                className="flex-1 overflow-y-auto overscroll-contain bg-muted/30 p-5"
              >
                {hasOlderMessages && (
                  <div className="mb-4 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs"
                      disabled={isLoadingOlder}
                      onClick={() => fetchOlderMessages()}
                    >
                      {isLoadingOlder
                        ? texts.messages.loadingOlder
                        : texts.messages.loadOlderMessages}
                    </Button>
                  </div>
                )}
                <div className="space-y-3">
                  {isLoadingMessages ? (
                    <MessageSkeletons />
                  ) : activeMessages.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                      {texts.messages.noMessages}
                    </p>
                  ) : (
                    activeMessages.map((m) => {
                      const isMe = m.from === currentUserId;
                      return (
                        <div
                          key={m.id}
                          onClick={() => {
                            if (!selectingMessages || showingPreviousThread) return;
                            setSelectedMessages((current) => {
                              const next = new Set(current);
                              if (next.has(m.id)) next.delete(m.id);
                              else next.add(m.id);
                              return next;
                            });
                          }}
                          className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"} ${
                            selectingMessages ? "cursor-pointer" : ""
                          }`}
                        >
                          {!isMe && (
                            <Link
                              to="/perfil/$username"
                              params={{ username: otherUser?.username ?? otherParticipantId ?? "" }}
                            >
                              <span className="relative mb-1 inline-block">
                                <UserAvatar
                                  src={otherUser?.avatar}
                                  alt={otherUser?.name}
                                  className="h-7 w-7 shrink-0"
                                />
                                {/* No avatar, só o primeiro emblema: é enfeite da foto, não a
                                    linha do nome — empilhar cinco ali viraria borrão. */}
                                <UserBadges
                                  badge={otherUser?.badge}
                                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 ring-1 ring-card"
                                />
                              </span>
                            </Link>
                          )}
                          <div
                            className={`min-w-0 max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                              isMe
                                ? "rounded-br-md bg-primary text-primary-foreground"
                                : "rounded-bl-md bg-card text-foreground"
                            } ${selectedMessages.has(m.id) ? "ring-2 ring-destructive/70" : ""}`}
                          >
                            {m.text.trim().length > 0 && (
                              <RichText
                                content={m.text}
                                className="break-words"
                                linkClassName="break-all underline underline-offset-2"
                              />
                            )}

                            {m.mediaIds && m.mediaIds.length > 0 && (
                              <div className="mt-1">
                                <MediaGrid mediaIds={m.mediaIds} compact />
                              </div>
                            )}

                            <p
                              className={`mt-1 text-xs ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                            >
                              {formatTime(m.time)}
                            </p>

                            {/* Reações: mesmos emojis dos comentários. A pílula alterna a reação e
                                o botão abre o seletor completo. */}
                            <div
                              className={`mt-1 flex flex-wrap items-center gap-1 ${
                                isMe ? "justify-end" : "justify-start"
                              }`}
                              onClick={(event) => event.stopPropagation()}
                            >
                              {Object.entries(m.reactions ?? {}).map(([type, count]) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() =>
                                    !showingPreviousThread &&
                                    reactToMessage.mutate({ messageId: m.id, type })
                                  }
                                  className={`inline-flex h-6 items-center gap-1 rounded-full px-1.5 text-xs leading-none transition ${
                                    m.myReaction === type
                                      ? "bg-primary/20 text-primary-text ring-1 ring-primary/40"
                                      : isMe
                                        ? "bg-primary-foreground/15 text-primary-foreground"
                                        : "bg-muted text-text-subtle hover:bg-muted/80"
                                  }`}
                                  title={type.toLowerCase()}
                                >
                                  <span className="inline-flex h-4 items-center justify-center text-sm leading-none">
                                    {REACTION_EMOJIS[type as ReactionType] ?? type}
                                  </span>

                                  <span className="tabular-nums leading-none">{count}</span>
                                </button>
                              ))}

                              <ReactionPicker
                                activeType={(m.myReaction as ReactionType) ?? null}
                                onReact={(type) =>
                                  !showingPreviousThread &&
                                  reactToMessage.mutate({ messageId: m.id, type })
                                }
                                buttonClassName={`inline-flex h-6 w-6 items-center justify-center rounded-full transition ${
                                  isMe
                                    ? "text-primary-foreground/70 hover:bg-primary-foreground/15"
                                    : "text-text-subtle hover:bg-muted"
                                }`}
                                buttonTitle={texts.posts.reactions.react}
                              >
                                <Smile className="h-3.5 w-3.5" />
                              </ReactionPicker>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div />
                </div>
              </div>

              {selectingMessages ? (
                <div className="flex flex-wrap items-center gap-2 border-t border-border bg-surface-2 p-3">
                  <span className="text-xs font-normal text-text-subtle">
                    {texts.messages.selectedMessages(selectedMessages.size)}
                  </span>

                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        setSelectingMessages(false);
                        setSelectedMessages(new Set());
                      }}
                    >
                      {texts.messages.cancelSelection}
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-full"
                      disabled={selectedMessages.size === 0 || hideMessages.isPending}
                      onClick={() => hideMessages.mutate()}
                    >
                      {texts.messages.deleteSelectedMessages(selectedMessages.size)}
                    </Button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="border-t border-border px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
                >
                  {media.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {media.map((item, index) => (
                        <div key={item.preview} className="relative">
                          <img
                            src={item.preview}
                            alt=""
                            className="h-16 w-16 rounded-lg border border-border-soft object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => removeMediaItem(index)}
                            className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-foreground text-background shadow"
                            aria-label={texts.messages.removeMedia}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadError && <p className="mb-2 text-xs text-destructive">{uploadError}</p>}

                  <div className="flex items-end gap-2">
                    <input
                      ref={mediaInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleMediaSelect}
                    />

                    <button
                      type="button"
                      onClick={() => mediaInputRef.current?.click()}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-text-subtle transition hover:bg-muted hover:text-foreground"
                      aria-label={texts.messages.attachMedia}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>

                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        // Enter envia; Shift+Enter quebra linha (padrao de chat).
                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          void handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
                        }
                      }}
                      onPaste={(event) => {
                        const files = Array.from(event.clipboardData?.files ?? []);
                        if (files.some((file) => file.type.startsWith("image/"))) {
                          event.preventDefault();
                          addMediaFiles(files);
                        }
                      }}
                      ref={messageInputRef}
                      rows={1}
                      placeholder={texts.messages.inputPlaceholder}
                      className="max-h-32 min-h-[40px] w-full resize-none rounded-2xl bg-muted px-4 py-2.5 text-sm outline-none"
                    />
                    <EmojiPicker
                      onPick={insertEmoji}
                      buttonTitle={texts.posts.formatting.emoji}
                      buttonClassName="grid h-10 w-10 shrink-0 place-items-center rounded-full text-text-subtle transition hover:bg-muted hover:text-foreground"
                    />

                    <button
                      type="submit"
                      disabled={(!text.trim() && media.length === 0) || sendMessage.isPending}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={texts.messages.deleteTitle}
        description={texts.messages.deleteDescription}
        confirmLabel={texts.messages.deleteConfirm}
        destructive
        pending={hideSelected.isPending}
        onConfirm={() => hideSelected.mutate()}
      />
    </AppContainer>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  selecting,
  selected,
  onToggle,
}: ConversationItemProps) {
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id ?? null;
  const otherId = conversation.participantIds.find((id) => id !== currentUserId);
  const { data: otherUser } = useQuery({
    queryKey: ["profile", "by-id", otherId],
    queryFn: () => profileApi.getById(otherId ?? ""),
    enabled: !!otherId,
  });

  const title = conversation.title ?? otherUser?.name ?? texts.messages.conversationFallback;

  return (
    <li>
      <button
        onClick={onSelect}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
          selected ? "bg-primary-soft" : isActive ? "bg-primary-soft" : "hover:bg-muted"
        }`}
      >
        {selecting && (
          <span
            aria-hidden
            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
              selected ? "border-primary bg-primary text-primary-foreground" : "border-border-soft"
            }`}
          >
            {selected ? "✓" : ""}
          </span>
        )}
        <Link to="/perfil/$username" params={{ username: otherUser?.username ?? otherId ?? "" }}>
          <UserAvatar src={otherUser?.avatar} alt={title} className="h-11 w-11 shrink-0" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-sm font-medium">{title}</span>

              <UserBadges badges={otherUser?.badges} badge={otherUser?.badge} />
            </span>

            <span className="text-xs text-muted-foreground shrink-0 ml-2">
              {conversation.time ? formatTime(conversation.time) : ""}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs text-muted-foreground">
              {conversation.lastMessage ?? ""}
            </p>
            {conversation.unread > 0 && (
              <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {conversation.unread}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

function ConversationHeader({ conversation, onBack, action }: ConversationHeaderProps) {
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id ?? null;
  const otherId = conversation.participantIds.find((id) => id !== currentUserId);
  const { data: otherUser } = useQuery({
    queryKey: ["profile", "by-id", otherId],
    queryFn: () => profileApi.getById(otherId ?? ""),
    enabled: !!otherId,
  });

  const title = conversation.title ?? otherUser?.name ?? texts.messages.conversationFallback;

  return (
    <header className="flex items-center gap-3 border-b border-border p-4">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-muted md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <Link to="/perfil/$username" params={{ username: otherUser?.username ?? otherId ?? "" }}>
          <UserAvatar src={otherUser?.avatar} alt={title} className="h-10 w-10 shrink-0" />
        </Link>

        <div className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-semibold">{title}</span>

            <UserBadges badges={otherUser?.badges} badge={otherUser?.badge} />
          </span>
          {otherUser?.headline && (
            <p className="truncate text-xs text-muted-foreground">{otherUser.headline}</p>
          )}
        </div>
      </div>

      {action && <div className="ml-auto shrink-0">{action}</div>}
    </header>
  );
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return texts.time.now;
  if (diffMin < 60) return texts.time.minutesAgo(diffMin);
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return texts.time.hoursAgo(diffH);
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return texts.time.daysAgo(diffD);
  return date.toLocaleDateString("pt-BR");
}
