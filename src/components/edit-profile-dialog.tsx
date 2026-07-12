import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { profileApi, ApiError } from "@/lib/api";
import type { Profile, Experience, Education, Certification } from "@/lib/api";

interface Props {
  profile: Profile;
  children: React.ReactNode;
}

export function EditProfileDialog({ profile, children }: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"info" | "experiences" | "education" | "certifications">("info");

  const [username, setUsername] = useState(profile.username);
  const [name, setName] = useState(profile.name);
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [company, setCompany] = useState(profile.company ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [availability, setAvailability] = useState(profile.availability ?? "");
  const [portfolio, setPortfolio] = useState(profile.portfolio ?? "");
  const [linksText, setLinksText] = useState(profile.externalLinks.join("\n"));
  const [skillsText, setSkillsText] = useState(profile.skills.join(", "));
  const [goalsText, setGoalsText] = useState(profile.goals.join(", "));
  const [openToWork, setOpenToWork] = useState(profile.openToWork);
  const [isMentor, setIsMentor] = useState(profile.isMentor);
  const [usernameError, setUsernameError] = useState("");

  const updateProfile = useMutation({
    mutationFn: (data: Parameters<typeof profileApi.update>[0]) => profileApi.update(data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["profile", profile.username] });
      if (updated.username && updated.username !== profile.username) {
        queryClient.invalidateQueries({ queryKey: ["profile", updated.username] });
        router.navigate({ to: "/perfil/$username", params: { username: updated.username }, replace: true });
      }
      setOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        setUsernameError("Este username já está em uso");
      }
    },
  });

  const { data: experiences = [] } = useQuery({
    queryKey: ["me", "experiences"],
    queryFn: () => profileApi.experiences.list(),
    enabled: open && tab === "experiences",
  });

  const { data: education = [] } = useQuery({
    queryKey: ["me", "education"],
    queryFn: () => profileApi.education.list(),
    enabled: open && tab === "education",
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ["me", "certifications"],
    queryFn: () => profileApi.certifications.list(),
    enabled: open && tab === "certifications",
  });

  const handleSave = async () => {
    setUsernameError("");
    await updateProfile.mutateAsync({
      username: username !== profile.username ? username : undefined,
      name: name !== profile.name ? name : undefined,
      headline: headline || null,
      bio: bio || null,
      company: company || null,
      location: location || null,
      availability: availability || null,
      portfolio: portfolio || null,
      externalLinks: linksText ? linksText.split("\n").map((s) => s.trim()).filter(Boolean) : [],
      skills: skillsText ? skillsText.split(",").map((s) => s.trim()).filter(Boolean) : [],
      goals: goalsText ? goalsText.split(",").map((s) => s.trim()).filter(Boolean) : [],
      openToWork,
      isMentor,
    });
  };

  const tabs = [
    { key: "info" as const, label: "Informações" },
    { key: "experiences" as const, label: "Experiências" },
    { key: "education" as const, label: "Educação" },
    { key: "certifications" as const, label: "Certificações" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-card px-6 pb-4 pt-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Editar perfil</DialogTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
          <div className="mt-4 flex gap-1 rounded-full border border-border bg-muted p-1 text-sm">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-4 py-1.5 font-medium transition ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-6 pt-4">
          {tab === "info" && (
            <div className="space-y-5">
              <Field label="Nome">
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 border-transparent bg-muted" />
              </Field>
              <Field label="Username (URL do perfil)" error={usernameError}>
                <Input value={username} onChange={(e) => { setUsername(e.target.value); setUsernameError(""); }} placeholder="seu-username" className="h-10 border-transparent bg-muted" />
              </Field>
              <Field label="Headline">
                <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Cargo ou frase de destaque" className="h-10 border-transparent bg-muted" />
              </Field>
              <Field label="Bio">
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="h-10 border-transparent bg-muted pl-9" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Empresa">
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} className="h-10 border-transparent bg-muted" />
                </Field>
                <Field label="Localização">
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-10 border-transparent bg-muted" />
                </Field>
              </div>
              <Field label="Disponibilidade">
                <Input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="Ex: Disponível para freelas" className="h-10 border-transparent bg-muted" />
              </Field>
              <Field label="Portfólio">
                <Input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://..." className="h-10 border-transparent bg-muted" />
              </Field>
              <Field label="Links externos (um por linha)">
                <Textarea value={linksText} onChange={(e) => setLinksText(e.target.value)} rows={3} className="h-10 border-transparent bg-muted" />
              </Field>
              <Field label="Habilidades (separadas por vírgula)">
                <Input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} className="h-10 border-transparent bg-muted" />
              </Field>
              <Field label="Objetivos (separados por vírgula)">
                <Input value={goalsText} onChange={(e) => setGoalsText(e.target.value)} className="h-10 border-transparent bg-muted" />
              </Field>
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-3 text-sm">
                  <Switch checked={openToWork} onCheckedChange={setOpenToWork} />
                  Aberto a oportunidades
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <Switch checked={isMentor} onCheckedChange={setIsMentor} />
                  Mentor disponível
                </label>
              </div>
            </div>
          )}

          {tab === "experiences" && (
            <SubList
              items={experiences}
              fields={[
                { key: "title", label: "Cargo", required: true },
                { key: "company", label: "Empresa", required: true },
                { key: "location", label: "Local" },
                { key: "description", label: "Descrição", multiline: true },
                { key: "startDate", label: "Início", type: "date" },
                { key: "endDate", label: "Fim", type: "date" },
              ]}
              currentlyHereKey="currentlyHere"
              createApi={(data) => profileApi.experiences.create(data as any)}
              updateApi={(id, data) => profileApi.experiences.update(id, data as any)}
              deleteApi={(id) => profileApi.experiences.delete(id)}
              queryKey={["me", "experiences"]}
              emptyMessage="Nenhuma experiência adicionada"
              newItem={{ title: "", company: "", location: "", description: "", startDate: "", endDate: "" }}
            />
          )}

          {tab === "education" && (
            <SubList
              items={education}
              fields={[
                { key: "school", label: "Instituição", required: true },
                { key: "degree", label: "Grau", required: true },
                { key: "field", label: "Campo" },
                { key: "description", label: "Descrição", multiline: true },
                { key: "startDate", label: "Início", type: "date" },
                { key: "endDate", label: "Fim", type: "date" },
              ]}
              currentlyHereKey="currentlyHere"
              createApi={(data) => profileApi.education.create(data as any)}
              updateApi={(id, data) => profileApi.education.update(id, data as any)}
              deleteApi={(id) => profileApi.education.delete(id)}
              queryKey={["me", "education"]}
              emptyMessage="Nenhuma formação adicionada"
              newItem={{ school: "", degree: "", field: "", description: "", startDate: "", endDate: "" }}
            />
          )}

          {tab === "certifications" && (
            <SubList
              items={certifications}
              fields={[
                { key: "name", label: "Nome", required: true },
                { key: "issuer", label: "Emissor", required: true },
                { key: "description", label: "Descrição", multiline: true },
                { key: "issueDate", label: "Data de emissão", type: "date" },
                { key: "expirationDate", label: "Data de expiração", type: "date" },
                { key: "credentialUrl", label: "URL do credencial" },
              ]}
              createApi={(data) => profileApi.certifications.create(data as any)}
              updateApi={(id, data) => profileApi.certifications.update(id, data as any)}
              deleteApi={(id) => profileApi.certifications.delete(id)}
              queryKey={["me", "certifications"]}
              emptyMessage="Nenhuma certificação adicionada"
              newItem={{ name: "", issuer: "", description: "", issueDate: "", expirationDate: "", credentialUrl: "" }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface SubField {
  key: string;
  label: string;
  required?: boolean;
  multiline?: boolean;
  type?: string;
}

function SubList<T extends { id: string }>({
  items,
  fields,
  currentlyHereKey,
  createApi,
  updateApi,
  deleteApi,
  queryKey,
  emptyMessage,
  newItem,
}: {
  items: T[];
  fields: SubField[];
  currentlyHereKey?: string;
  createApi: (data: Record<string, unknown>) => Promise<T>;
  updateApi: (id: string, data: Record<string, unknown>) => Promise<T>;
  deleteApi: (id: string) => Promise<void>;
  queryKey: string[];
  emptyMessage: string;
  newItem: Record<string, string>;
}) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ ...newItem });
  const [currentlyHere, setCurrentlyHere] = useState(false);

  const create = useMutation({
    mutationFn: (data: Record<string, unknown>) => createApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setForm({ ...newItem });
      setCurrentlyHere(false);
      setEditingId(null);
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setEditingId(null);
      setForm({ ...newItem });
      setCurrentlyHere(false);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const startEdit = (item: T) => {
    setEditingId(item.id);
    const values: Record<string, string> = {};
    for (const f of fields) {
      values[f.key] = String((item as Record<string, unknown>)[f.key] ?? "");
    }
    setForm(values);
    if (currentlyHereKey) {
      setCurrentlyHere(Boolean((item as Record<string, unknown>)[currentlyHereKey]));
    }
  };

  const handleSubmit = async () => {
    const data: Record<string, unknown> = { ...form };
    if (currentlyHereKey) {
      data[currentlyHereKey] = currentlyHere;
      if (currentlyHere) data.endDate = null;
    }
    if (editingId && editingId !== "__new__") {
      await update.mutateAsync({ id: editingId, data });
    } else {
      await create.mutateAsync(data);
    }
  };

  const isPending = create.isPending || update.isPending;
  const showForm = editingId !== null;

  return (
    <div className="space-y-4">
      {showForm ? (
        <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
          {fields.map((f) => (
            <Field key={f.key} label={f.label}>
              {f.multiline ? (
                <Textarea
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  rows={2}
                  className="h-10 border-transparent bg-muted"
                />
              ) : (

                <Input
                  type={f.type ?? "text"}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="h-10 border-transparent bg-muted"
                />
              )}
            </Field>
          ))}
          {currentlyHereKey && (
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={currentlyHere} onCheckedChange={setCurrentlyHere} />
              Atualmente aqui
            </label>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setForm({ ...newItem }); setCurrentlyHere(false); }}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="break-words font-medium">{String((item as Record<string, unknown>)[fields[0].key] ?? "")}</p>
                    <p className="break-words text-muted-foreground">{String((item as Record<string, unknown>)[fields[1]?.key] ?? "")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(item)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => remove.mutate(item.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          <Button variant="outline" className="w-full gap-1.5" onClick={() => { setEditingId("__new__"); setForm({ ...newItem }); setCurrentlyHere(false); }}>
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </>
      )}
    </div>
  );
}
