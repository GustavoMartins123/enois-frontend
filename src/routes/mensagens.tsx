import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Send, Paperclip, Phone, Video, MoreHorizontal } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { conversations, findUser } from "@/lib/mock-data";

export const Route = createFileRoute("/mensagens")({
  head: () => ({ meta: [{ title: "Mensagens · Conexão" }] }),
  component: Mensagens,
});

const sampleThread = [
  { from: "them", text: "Oi! Vi seu post sobre design systems. Adorei a perspectiva.", time: "12:30" },
  { from: "me", text: "Obrigada! Foi um aprendizado de muitos meses 🙂", time: "12:34" },
  { from: "them", text: "Topa marcar 30 min essa semana pra trocar ideia?", time: "12:42" },
];

function Mensagens() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const active = conversations.find((c) => c.id === activeId)!;
  const activeUser = findUser(active.userId);
  const activeTitle = active.kind === "group" ? active.title! : activeUser.name;
  const activeSubtitle =
    active.kind === "group"
      ? `${active.participantIds?.length ?? 0} participantes · círculo de mentoria`
      : activeUser.headline;

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
              const u = findUser(c.userId);
              const isActive = c.id === activeId;
              const title = c.kind === "group" ? c.title! : u.name;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveId(c.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                      isActive ? "bg-primary-soft" : "hover:bg-muted"
                    }`}
                  >
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={u.avatar} alt={u.name} />
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium">{title}</span>
                        <span className="text-[11px] text-muted-foreground">{c.time}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                        {c.unread > 0 && (
                          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                            {c.unread}
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
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeUser.avatar} alt={activeUser.name} />
                <AvatarFallback>{activeUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold">{activeTitle}</p>
                <p className="truncate text-xs text-muted-foreground">{activeSubtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <IconBtn icon={Phone} />
              <IconBtn icon={Video} />
              <IconBtn icon={MoreHorizontal} />
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-5">
            {sampleThread.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    m.from === "me"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-card text-foreground"
                  }`}
                >
                  <p>{m.text}</p>
                  <p className={`mt-1 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
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
