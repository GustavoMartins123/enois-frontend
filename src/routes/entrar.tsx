import { type FormEvent, useState } from "react";

import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { OAuthStartResponse } from "@/types/application/auth/oauth-start-response";
import type { AuthFormProps } from "@/types/routes/auth/auth-form-props";
import type { FieldProps } from "@/types/routes/auth/field-props";
import type { ForgotPasswordDialogProps } from "@/types/routes/auth/forgot-password-dialog-props";
import type { LoginFormProps } from "@/types/routes/auth/login-form-props";
import type { TabBtnProps } from "@/types/routes/auth/tab-btn-props";
import { ArrowRight, Eye, EyeOff, Loader2, MailCheck, Sparkles } from "lucide-react";
import { z } from "zod";

import { ApiError, authApi } from "@/lib/api";
import { storeSession } from "@/lib/session";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ErrorBanner } from "@/components/error-banner";
import { ThemeToggle } from "@/components/theme-toggle";

const searchSchema = z.object({
  tab: z.enum(["login", "signup"]).optional().default("signup"),
});

export const Route = createFileRoute("/entrar")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: texts.auth.seo.authTitle },
      {
        name: "description",
        content: texts.auth.seo.authDescription,
      },
    ],
  }),
  component: Auth,
});

const loginSchema = z.object({
  email: z.string().trim().email(texts.auth.validation.invalidEmail).max(255),
  password: z.string().min(6, texts.auth.validation.loginPasswordMin).max(128),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, texts.auth.validation.signupNameMin).max(80),
  email: z.string().trim().email(texts.auth.validation.invalidEmail).max(255),
  password: z.string().min(8, texts.auth.validation.passwordMin).max(128),
  // Checkbox marcado chega como "on"; ausente significa nao aceito.
  acceptedTerms: z
    .string()
    .optional()
    .refine((value) => value === "on", { message: texts.auth.validation.termsRequired }),
});

function Auth() {
  const initial = Route.useSearch().tab;
  const navigate = useNavigate();
  const [tab, setTab] = useState(initial);
  const [forgotOpen, setForgotOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 min-h-screen lg:grid-cols-2">
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

          <span className="text-lg font-semibold tracking-tight">
            <>{texts.brand.prefix}</>

            <span className="gradient-text">{texts.brand.accent}</span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <p className="text-sm font-medium uppercase tracking-wider text-primary-foreground/80">
            {texts.auth.hero.eyebrow}
          </p>

          <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">
            {texts.auth.hero.quote}
          </h2>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-foreground/25" />

            <div>
              <p className="font-medium">{texts.auth.hero.person}</p>

              <p className="text-sm text-primary-foreground/75">{texts.auth.hero.role}</p>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-4 text-sm">
          {texts.auth.hero.stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-semibold">{stat.value}</p>

              <p className="text-primary-foreground/75">{stat.label}</p>
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

            <span className="font-semibold tracking-tight">
              <>{texts.brand.prefix}</>

              <span className="gradient-text">{texts.brand.accent}</span>
            </span>
          </Link>

          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <TabBtn active={tab === "signup"} onClick={() => setTab("signup")}>
              {texts.common.createAccount}
            </TabBtn>

            <TabBtn active={tab === "login"} onClick={() => setTab("login")}>
              {texts.common.enter}
            </TabBtn>
          </div>

          <div className="mt-8">
            {tab === "signup" ? (
              <SignupForm onDone={() => navigate({ to: "/feed" })} />
            ) : (
              <LoginForm
                onDone={() => navigate({ to: "/feed" })}
                onForgot={() => setForgotOpen(true)}
              />
            )}
          </div>

          <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <>{texts.auth.terms.prefix}</>

            <Link to="/termos" className="text-primary hover:underline">
              {texts.auth.terms.terms}
            </Link>

            <>{texts.auth.terms.conjunction}</>

            <Link to="/privacidade" className="text-primary hover:underline">
              {texts.auth.terms.privacy}
            </Link>

            <>{texts.auth.terms.end}</>
          </p>
        </div>
      </section>
    </div>
  );
}

function TabBtn({ active, children, onClick }: TabBtnProps) {
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
  const [loading, setLoading] = useState<OAuthStartResponse["provider"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startOAuth = async (provider: OAuthStartResponse["provider"]) => {
    setLoading(provider);
    setError(null);
    const providerName = provider === "GOOGLE" ? "Google" : "Apple";
    try {
      // O backend registra state + nonce no servidor e devolve a URL de autorização.
      const start = await authApi.oauthStart(provider);
      window.location.href = start.authorizationUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : texts.auth.social.unavailable(providerName));
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      <button
        type="button"
        onClick={() => startOAuth("GOOGLE")}
        disabled={loading !== null}
        className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
      >
        {loading === "GOOGLE" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        <>{texts.auth.social.google}</>
      </button>

      <button
        type="button"
        onClick={() => startOAuth("APPLE")}
        disabled={loading !== null}
        className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
      >
        {loading === "APPLE" ? <Loader2 className="h-4 w-4 animate-spin" /> : <AppleIcon />}
        <>{texts.auth.social.apple}</>
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

      <>{texts.auth.social.divider}</>

      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function SignupForm(_props: AuthFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  /** Conta criada e pendente de confirmação: o formulário dá lugar à tela "confirme seu e-mail". */
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

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
    setFormError(null);
    setLoading(true);
    localStorage.removeItem("session_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("current_user");
    try {
      // O cadastro não abre sessão: a conta nasce pendente até confirmar o e-mail.
      const result = await authApi.signup({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        acceptedTerms: parsed.data.acceptedTerms === "on",
      });
      setPendingEmail(result.email);
    } catch (err) {
      setFormError(err);
    } finally {
      setLoading(false);
    }
  };

  if (pendingEmail) {
    return <EmailPendingScreen email={pendingEmail} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{texts.auth.signup.title}</h1>

      <p className="mt-1 text-sm text-muted-foreground">{texts.auth.signup.subtitle}</p>

      <div className="mt-6">
        <SocialButtons />
        <Divider />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label={texts.auth.fields.fullName} error={errors.name}>
          <Input
            name="name"
            placeholder={texts.auth.placeholders.name}
            autoComplete="name"
            required
            maxLength={80}
          />
        </Field>

        <Field label={texts.auth.fields.email} error={errors.email}>
          <Input
            name="email"
            type="email"
            placeholder={texts.auth.placeholders.email}
            autoComplete="email"
            required
            maxLength={255}
          />
        </Field>

        <Field label={texts.auth.fields.password} error={errors.password}>
          <div className="relative">
            <Input
              name="password"
              type={show ? "text" : "password"}
              placeholder={texts.auth.placeholders.newPassword}
              autoComplete="new-password"
              required
              maxLength={128}
            />

            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
              aria-label={show ? texts.auth.password.hide : texts.auth.password.show}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <div className="space-y-1.5">
          <label className="flex items-start gap-2 text-[12px] font-light text-text-subtle">
            <input type="checkbox" name="acceptedTerms" className="mt-0.5 h-4 w-4 shrink-0" />

            <span>
              <>{texts.auth.signup.termsPrefix}</>

              <Link
                to="/termos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                <>{texts.auth.signup.termsLink}</>
              </Link>

              <>{texts.auth.signup.termsAnd}</>

              <Link
                to="/privacidade"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                <>{texts.auth.signup.privacyLink}</>
              </Link>

              <>{texts.auth.signup.termsSuffix}</>
            </span>
          </label>
          {errors.acceptedTerms && (
            <p className="text-xs text-destructive">{errors.acceptedTerms}</p>
          )}
        </div>

        {formError && <ErrorBanner error={formError} />}
        <Button type="submit" className="w-full rounded-full gap-2" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <>{texts.common.createAccount} </>

              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

/**
 * Estado "aguardando confirmação": mostrado logo após o cadastro e também quando o login encontra
 * uma conta pendente. Aqui fica claro o que fazer e há reenvio, com o resultado de cada tentativa.
 */
function EmailPendingScreen({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed" | "limited">("idle");

  const resend = async () => {
    setState("sending");
    try {
      await authApi.resendVerification(email);
      setState("sent");
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setState("limited");
        return;
      }
      setState("failed");
    }
  };

  return (
    <div>
      <MailCheck className="h-7 w-7 text-primary" />

      <h1 className="mt-3 text-2xl font-semibold tracking-tight">
        {texts.auth.pending.title}
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">{texts.auth.pending.description(email)}</p>

      <ul className="mt-4 space-y-1.5 text-[13px] font-light text-muted-foreground">
        <li>· {texts.auth.pending.step1}</li>
        <li>· {texts.auth.pending.step2}</li>
        <li>· {texts.auth.pending.step3}</li>
      </ul>

      {state === "sent" && (
        <p className="mt-4 rounded-xl bg-growth/10 px-4 py-2 text-sm text-growth">
          {texts.auth.pending.sent}
        </p>
      )}

      {state === "failed" && (
        <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {texts.auth.pending.failed}
        </p>
      )}

      {state === "limited" && (
        <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {texts.auth.pending.limited}
        </p>
      )}

      <Button
        className="mt-6 w-full rounded-full gap-2"
        onClick={resend}
        disabled={state === "sending"}
      >
        {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}

        <>{state === "sending" ? texts.auth.pending.sending : texts.auth.pending.resend}</>
      </Button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        <>{texts.auth.pending.wrongEmail}</>
      </p>
    </div>
  );
}

function LoginForm({ onDone, onForgot }: LoginFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  /** Conta pendente de confirmação: em vez de "erro", a tela explica e oferece reenviar. */
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

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
    setFormError(null);
    setLoading(true);
    localStorage.removeItem("session_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("current_user");
    try {
      const result = await authApi.login({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      storeSession(result);
      onDone();
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(parsed.data.email);
        return;
      }
      setFormError(err);
    } finally {
      setLoading(false);
    }
  };

  if (unverifiedEmail) {
    return <EmailPendingScreen email={unverifiedEmail} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{texts.auth.login.title}</h1>

      <p className="mt-1 text-sm text-muted-foreground">{texts.auth.login.subtitle}</p>

      <div className="mt-6">
        <SocialButtons />
        <Divider />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label={texts.auth.fields.email} error={errors.email}>
          <Input
            name="email"
            type="email"
            placeholder={texts.auth.placeholders.email}
            autoComplete="email"
            required
            maxLength={255}
          />
        </Field>

        <Field
          label={texts.auth.fields.password}
          error={errors.password}
          right={
            <button
              type="button"
              onClick={onForgot}
              className="text-xs font-medium text-primary hover:underline"
            >
              {texts.auth.password.forgot}
            </button>
          }
        >
          <div className="relative">
            <Input
              name="password"
              type={show ? "text" : "password"}
              placeholder={texts.auth.placeholders.password}
              autoComplete="current-password"
              required
              maxLength={128}
            />

            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
              aria-label={show ? texts.auth.password.hide : texts.auth.password.show}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {formError && <ErrorBanner error={formError} />}
        <Button type="submit" className="w-full rounded-full gap-2" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <>{texts.common.enter} </>

              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

function Field({ label, error, right, children }: FieldProps) {
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

function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    if (!z.string().email().safeParse(email).success) {
      setErrors({ email: texts.auth.validation.invalidEmail });
      return;
    }
    setErrors({});
    setFormError(null);
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setFormError(err);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setSent(false);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : close())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold tracking-tight">
            {texts.auth.forgot.title}
          </DialogTitle>
        </DialogHeader>
        {sent ? (
          <div className="space-y-4 pb-2 pt-2">
            <div className="flex items-start gap-3 rounded-xl bg-primary/10 p-4">
              <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <div>
                <p className="text-sm font-medium">{texts.auth.forgot.checkEmail}</p>

                <p className="mt-1 text-[13px] text-muted-foreground">
                  {texts.auth.forgot.sentDescription}
                </p>
              </div>
            </div>

            <Button className="w-full rounded-full" onClick={close}>
              {texts.auth.forgot.understood}
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 pb-2 pt-2" noValidate>
            <p className="text-sm text-muted-foreground">{texts.auth.forgot.description}</p>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{texts.auth.fields.email}</Label>

              <Input
                name="email"
                type="email"
                placeholder={texts.auth.placeholders.email}
                autoComplete="email"
                required
                maxLength={255}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            {formError && <ErrorBanner error={formError} />}
            <Button type="submit" className="w-full gap-2 rounded-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <>{texts.auth.forgot.sendLink} </>

                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
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
