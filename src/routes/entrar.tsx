import { type FormEvent, useState } from "react";

import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { z } from "zod";

import { ApiError, authApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ThemeToggle } from "@/components/theme-toggle";

type Tab = "login" | "signup";

const searchSchema = z.object({
  tab: z.enum(["login", "signup"]).optional().default("signup"),
});

export const Route = createFileRoute("/entrar")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta · Conexão" },
      {
        name: "description",
        content: "Acesse sua conta ou comece sua jornada profissional na Conexão.",
      },
    ],
  }),
  component: Auth,
});

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Senha precisa ter ao menos 6 caracteres").max(128),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Como podemos te chamar?").max(80),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(8, "Use ao menos 8 caracteres").max(128),
});

function Auth() {
  const initial = Route.useSearch().tab as Tab;
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(initial);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand side */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-10 text-primary-foreground lg:flex"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div
          aria-hidden
          className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl"
        />

        <Link to="/" className="relative flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-foreground/20 backdrop-blur">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Conexão</span>
        </Link>

        <div className="relative max-w-md">
          <p className="text-sm font-medium uppercase tracking-wider text-primary-foreground/80">
            Networking com propósito
          </p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">
            "Encontrei aqui as conversas que mudaram minha carreira."
          </h2>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-foreground/25" />
            <div>
              <p className="font-medium">Marina Rocha</p>
              <p className="text-sm text-primary-foreground/75">Engenheira Sênior · Nubank</p>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-4 text-sm">
          {[
            { v: "120k+", l: "Profissionais" },
            { v: "2.8k", l: "Mentores ativos" },
            { v: "640", l: "Comunidades" },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-2xl font-semibold">{s.v}</p>
              <p className="text-primary-foreground/75">{s.l}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Form side */}
      <section className="flex flex-col px-6 py-10 sm:px-12">
        <div className="flex items-center justify-between lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">Conexão</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <TabBtn active={tab === "signup"} onClick={() => setTab("signup")}>
              Criar conta
            </TabBtn>
            <TabBtn active={tab === "login"} onClick={() => setTab("login")}>
              Entrar
            </TabBtn>
          </div>

          <div className="mt-8">
            {tab === "signup" ? (
              <SignupForm onDone={() => navigate({ to: "/feed" })} />
            ) : (
              <LoginForm onDone={() => navigate({ to: "/feed" })} />
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com nossos{" "}
            <a href="#" className="text-primary hover:underline">
              Termos
            </a>{" "}
            e{" "}
            <a href="#" className="text-primary hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

function TabBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function SocialButtons() {
  const [loading, setLoading] = useState<"GOOGLE" | "APPLE" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startOAuth = async (provider: "GOOGLE" | "APPLE") => {
    setLoading(provider);
    setError(null);
    // Simulate attempt then fail — SSO não configurado neste ambiente.
    await new Promise((r) => setTimeout(r, 400));
    setError(
      `Função não implementada: login com ${provider === "GOOGLE" ? "Google" : "Apple"} ainda não está configurado.`,
    );
    setLoading(null);
  };

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={() => startOAuth("GOOGLE")}
        disabled={loading !== null}
        className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
      >
        {loading === "GOOGLE" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Continuar com Google
      </button>
      <button
        type="button"
        onClick={() => startOAuth("APPLE")}
        disabled={loading !== null}
        className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
      >
        {loading === "APPLE" ? <Loader2 className="h-4 w-4 animate-spin" /> : <AppleIcon />}
        Continuar com Apple
      </button>
      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      ou com e-mail
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function SignupForm({ onDone }: { onDone: () => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as string] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    localStorage.removeItem("session_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("current_user");
    try {
      const result = await authApi.signup({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      });
      localStorage.setItem("session_token", result.token);
      localStorage.setItem("refresh_token", result.refreshToken);
      localStorage.setItem("session_expires_at", result.expiresAt);
      localStorage.setItem("refresh_expires_at", result.refreshExpiresAt);
      localStorage.setItem("current_user", JSON.stringify(result.user));
      onDone();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ form: err.message });
      } else {
        setErrors({ form: "Erro inesperado. Tente novamente." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Vamos começar.</h1>
      <p className="mt-1 text-sm text-muted-foreground">Crie sua conta em menos de um minuto.</p>

      <div className="mt-6">
        <SocialButtons />
        <Divider />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Nome completo" error={errors.name}>
          <Input
            name="name"
            placeholder="Maria da Silva"
            autoComplete="name"
            required
            maxLength={80}
          />
        </Field>
        <Field label="E-mail" error={errors.email}>
          <Input
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            required
            maxLength={255}
          />
        </Field>
        <Field label="Senha" error={errors.password}>
          <div className="relative">
            <Input
              name="password"
              type={show ? "text" : "password"}
              placeholder="Mínimo de 8 caracteres"
              autoComplete="new-password"
              required
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {errors.form && (
          <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {errors.form}
          </p>
        )}
        <Button type="submit" className="w-full rounded-full gap-2" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Criar conta <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as string] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    localStorage.removeItem("session_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("current_user");
    try {
      const result = await authApi.login({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      localStorage.setItem("session_token", result.token);
      localStorage.setItem("refresh_token", result.refreshToken);
      localStorage.setItem("session_expires_at", result.expiresAt);
      localStorage.setItem("refresh_expires_at", result.refreshExpiresAt);
      localStorage.setItem("current_user", JSON.stringify(result.user));
      onDone();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ form: err.message });
      } else {
        setErrors({ form: "Erro inesperado. Tente novamente." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta.</h1>
      <p className="mt-1 text-sm text-muted-foreground">Continue de onde parou.</p>

      <div className="mt-6">
        <SocialButtons />
        <Divider />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="E-mail" error={errors.email}>
          <Input
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            required
            maxLength={255}
          />
        </Field>
        <Field
          label="Senha"
          error={errors.password}
          right={
            <a href="#" className="text-xs font-medium text-primary hover:underline">
              Esqueci minha senha
            </a>
          }
        >
          <div className="relative">
            <Input
              name="password"
              type={show ? "text" : "password"}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {errors.form && (
          <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {errors.form}
          </p>
        )}
        <Button type="submit" className="w-full rounded-full gap-2" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Entrar <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  right,
  children,
}: {
  label: string;
  error?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {right}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.7 2.6 12 2.6 6.8 2.6 2.6 6.8 2.6 12s4.2 9.4 9.4 9.4c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-foreground" aria-hidden>
      <path d="M16.4 12.7c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.2.9-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3.1 2.4 1.3-.1 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.6-1-2.7-3.9zM14 5.4c.7-.8 1.2-1.9 1-3-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 2.9-1.4z" />
    </svg>
  );
}
