import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Send, Paperclip, Phone, Video, MoreHorizontal } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { UserAvatar } from "@/components/user-avatar";
import { Input } from "@/components/ui/input";
import { messagesApi, profileApi } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/mensagens")({
  head: () => ({ meta: [{ title: "Mensagens · Conexão" }] }),
  component: Mensagens,
});

function Mensagens() {
  const { user: currentUser } = useAuth();
  const { data: conversationsData } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => messagesApi.listConversations(),
  });

  const conversations = conversationsData?.items ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeConversation = activeId
    ? conversations.find((c) => c.id === activeId)
    : conversations[0];

  const { data: messagesData } = useQuery({
    queryKey: ["messages", activeConversation?.id],
    queryFn: () => messagesApi.listMessages(activeConversation!.id),
    enabled: !!activeConversation,
  });

  const messages = messagesData?.items ?? [];

  return (
    <AppShell>
      <div className="surface-card grid h-[calc(100vh-9rem)] grid-cols-1 overflow-hidden md:grid-cols-[320px_1fr]">
        <div className="flex flex-col border-r border-border">
          <div className="border-b border-border p-4">
            <h1 className="mb-3 text-lg font-semibold">Mensagens</h1>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar conversas" className="h-9 rounded-full bg-muted pl-9" />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {conversations.map((c) => {
              const isActive = c.id === (activeConversation?.id ?? "");
              const title = c.title ?? "Conversa";
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveId(c.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                      isActive ? "bg-primary-soft" : "hover:bg-muted"
                    }`}
                  >
                    <UserAvatar
                      className="h-11 w-11"
                      alt={title}
                      fallback={(title[0] ?? "?").toUpperCase()}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium">{title}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {c.lastMessageAt ? formatTime(c.lastMessageAt) : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-muted-foreground">
                          {c.lastMessage ?? ""}
                        </p>
                        {c.unreadCount > 0 && (
                          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex min-w-0 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-border p-4">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar
                className="h-10 w-10"
                alt={activeConversation?.title}
                fallback={((activeConversation?.title ?? "?")[0] ?? "?").toUpperCase()}
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {activeConversation?.title ?? "Selecione uma conversa"}
                </p>
                {!activeConversation && (
                  <p className="text-xs text-muted-foreground">
                    Nenhuma conversa disponível
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <IconBtn icon={Phone} />
              <IconBtn icon={Video} />
              <IconBtn icon={MoreHorizontal} />
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-5">
            {!activeConversation ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">Nenhuma conversa selecionada</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === currentUser?.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isMe
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md bg-card text-foreground"
                      }`}
                    >
                      <p>{m.text}</p>
                      <p
                        className={`mt-1 text-[10px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <IconBtn icon={Paperclip} />
            <Input placeholder="Escreva uma mensagem..." className="h-10 rounded-full bg-muted" />
            <button
              type="submit"
              className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}

function IconBtn({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <button className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted hover:text-foreground">
      <Icon className="h-4 w-4" />
    </button>
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `há ${diffD} dias`;
  return date.toLocaleDateString("pt-BR");
}
