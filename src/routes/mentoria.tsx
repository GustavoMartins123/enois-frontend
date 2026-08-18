import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Calendar, Pencil, Sparkles, Star, Trash2 } from "lucide-react";

import { mentorsApi, profileApi } from "@/lib/api";
import type { UpdateMentorInput } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";
import { useAuth } from "@/lib/use-auth";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AppShell } from "@/components/app-shell";
import { UserAvatar } from "@/components/user-avatar";

export const Route = createFileRoute("/mentoria")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Mentoria · Énóis" }] }),
  component: Mentoria,
});

function Mentoria() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: mentorsData } = useQuery({
    queryKey: ["mentors"],
    queryFn: () => mentorsApi.list(),
  });

  const mentors = mentorsData?.items ?? [];

  const createMentor = useMutation({
    mutationFn: (data: { expertise: string[]; price: string }) => mentorsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      setOpen(false);
    },
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div
          className="surface-card relative overflow-hidden p-5 sm:p-8"
          style={{ background: "var(--gradient-soft)" }}
        >
          <div className="relative">
            <Badge className="rounded-full bg-primary-soft text-primary hover:bg-primary-soft">
              <Sparkles className="mr-1 h-3 w-3" /> Mentoria nativa
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Aprenda com quem já passou por onde você quer chegar.
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sessões reais com mentores verificados — sem performance, sem ruído. Avaliações
              honestas, trilhas de aprendizado e agendamento em um clique.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                className="rounded-full"
                onClick={() => {
                  const el = document.getElementById("mentores-lista");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Encontrar mentor
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    Tornar-me mentor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tornar-se mentor</DialogTitle>
                  </DialogHeader>
                  <RegisterMentorForm
                    onSave={(data) => createMentor.mutate(data)}
                    isPending={createMentor.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div id="mentores-lista">
          <h2 className="text-lg font-semibold">Mentores em destaque</h2>
          <p className="text-sm text-muted-foreground">
            Avaliados pela comunidade nas últimas 8 semanas.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {mentors.map((m) => (
              <MentorCard key={m.id} mentor={m} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function RegisterMentorForm({
  onSave,
  isPending,
}: {
  onSave: (data: { expertise: string[]; price: string }) => void;
  isPending: boolean;
}) {
  const [skillsText, setSkillsText] = useState("");
  const [price, setPrice] = useState("Gratuito");

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          Especialidades (separadas por vírgula)
        </Label>
        <Input
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          placeholder="Java, Spring, React"
          className="h-10 border-transparent bg-muted"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Investimento</Label>
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Gratuito"
          className="h-10 border-transparent bg-muted"
        />
      </div>
      <Button
        className="w-full rounded-full"
        disabled={!skillsText.trim() || isPending}
        onClick={() => {
          const expertise = skillsText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          onSave({ expertise, price: price || "Gratuito" });
        }}
      >
        {isPending ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}

function MentorCard({
  mentor,
}: {
  mentor: {
    id: string;
    userId: string;
    expertise: string[];
    rating: number;
    sessions: number;
    price: string;
    nextSlot: string;
  };
}) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isOwner = currentUser?.id === mentor.userId;

  const { data: user } = useQuery({
    queryKey: ["profile", mentor.userId],
    queryFn: () => profileApi.getById(mentor.userId),
  });

  const updateMentor = useMutation({
    mutationFn: (data: UpdateMentorInput) => mentorsApi.update(mentor.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      setEditOpen(false);
    },
  });

  const deleteMentor = useMutation({
    mutationFn: () => mentorsApi.remove(mentor.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      setDeleteOpen(false);
    },
  });

  return (
    <article className="surface-card mx-auto w-full max-w-5xl space-y-4 p-5">
      {/* Seção superior */}
      <header className="flex flex-wrap">
        {/* Avatar / imagem de destaque */}
        <div className="md:col-span-3">
          <div className="flex h-full items-start justify-center overflow-hidden">
            <UserAvatar
              src={user?.avatar}
              alt={user?.name ?? "Mentor"}
              className="h-14 w-14 shrink-0"
            />
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="space-y-4 px-4 md:col-span-6 flex-1 overflow-hidden">
          <Link
            to="/perfil/$username"
            params={{ username: user?.username ?? mentor.userId }}
            className="block truncate font-semibold hover:underline m-0"
          >
            {user?.name ?? "Mentor"}
          </Link>
          <p className="line-clamp-2 text-xs text-muted-foreground ">{user?.headline ?? ""}</p>
        </div>

        {/* Sidebar de estatísticas */}
        <div className="flex flex-col gap-4 md:col-span-3 text-[13px]">
          {!isOwner && (
            // <div className="flex flex-col gap-2 shrink-0 self-center">
            //   <Dialog open={editOpen} onOpenChange={setEditOpen}>
            //     <DialogTrigger asChild>
            //       <Button className="flex-1 rounded-full gap-1.5 mentoria bg-mentorship-button">
            //         <Pencil className="h-4 w-4" />
            //       </Button>
            //     </DialogTrigger>
            //     <DialogContent>
            //       <DialogHeader>
            //         <DialogTitle>Editar mentoria</DialogTitle>
            //       </DialogHeader>
            //       <EditMentorForm
            //         mentor={mentor}
            //         onSave={(data) => updateMentor.mutate(data)}
            //         isPending={updateMentor.isPending}
            //       />
            //     </DialogContent>
            //   </Dialog>
            //   <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            //     <DialogTrigger asChild>
            //       <Button variant="destructive" className="rounded-full gap-1.5">
            //         <Trash2 className="h-4 w-4" />
            //       </Button>
            //     </DialogTrigger>
            //     <DialogContent>
            //       <DialogHeader>
            //         <DialogTitle>Excluir mentoria</DialogTitle>
            //       </DialogHeader>
            //       <p className="text-sm text-muted-foreground">
            //         Tem certeza que deseja excluir sua mentoria? Esta ação não pode ser desfeita.
            //       </p>
            //       <div className="flex gap-2 pt-2">
            //         <Button
            //           variant="outline"
            //           className="flex-1 rounded-full"
            //           onClick={() => setDeleteOpen(false)}
            //         >
            //           Cancelar
            //         </Button>
            //         <Button
            //           variant="destructive"
            //           className="flex-1 rounded-full"
            //           disabled={deleteMentor.isPending}
            //           onClick={() => deleteMentor.mutate()}
            //         >
            //           {deleteMentor.isPending ? "Excluindo..." : "Excluir"}
            //         </Button>
            //       </div>
            //     </DialogContent>
            //   </Dialog>
            // </div>
            <Button className="shrink-0 self-center rounded-lg bg-mentorship-button py-2 px-[14px]">
              Agendar
            </Button>
          )}
        </div>
      </header>

      <section>
        {mentor.expertise.map((e) => (
          <Badge
            key={e}
            variant="secondary"
            className="rounded-full bg-accent font-normal text-accent-foreground"
          >
            {e}
          </Badge>
        ))}
      </section>
      {/* Seção inferior */}
      <footer className="grid grid-cols-1 gap-8 rounded-2xl">
        <dl className=" grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-3 text-xs">
          <div>
            <dt className="text-muted-foreground">Avaliação</dt>
            <dd className="mt-0.5 inline-flex items-center gap-1 font-semibold">
              <Star className="h-3.5 w-3.5 fill-opportunity text-opportunity" /> {mentor.rating}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Sessões</dt>
            <dd className="mt-0.5 font-semibold">{mentor.sessions}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Investimento</dt>
            <dd className="mt-0.5 font-medium">{mentor.price}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Próxima vaga</dt>
            <dd className="mt-0.5 inline-flex items-center gap-1 font-medium">
              <Calendar className="h-3.5 w-3.5" /> {mentor.nextSlot}
            </dd>
          </div>
        </dl>
      </footer>
    </article>
  );
}

function EditMentorForm({
  mentor,
  onSave,
  isPending,
}: {
  mentor: {
    expertise: string[];
    price: string;
  };
  onSave: (data: UpdateMentorInput) => void;
  isPending: boolean;
}) {
  const [skillsText, setSkillsText] = useState(mentor.expertise.join(", "));
  const [price, setPrice] = useState(mentor.price);

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          Especialidades (separadas por vírgula)
        </Label>
        <Input
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          placeholder="Java, Spring, React"
          className="h-10 border-transparent bg-muted"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Investimento</Label>
        <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Gratuito" className="h-10 border-transparent bg-muted" />
      </div>
      <Button
        className="w-full rounded-full"
        disabled={!skillsText.trim() || isPending}
        onClick={() => {
          const expertise = skillsText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          onSave({ expertise, price: price || "Gratuito" });
        }}
      >
        {isPending ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}
