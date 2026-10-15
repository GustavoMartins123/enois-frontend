import { useState } from "react";

import { Link, createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";
import { ArrowLeft, CheckCircle2, LifeBuoy, Loader2 } from "lucide-react";

import { ApiError, supportApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/current-user";
import { requireAuth } from "@/lib/require-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { AppContainer } from "@/components/app-container";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE = 10;

export const Route = createFileRoute("/suporte")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: texts.support.seoTitle }] }),
  component: Suporte,
});

function Suporte() {
  const currentUser = getCurrentUser();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState(currentUser?.email ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const reset = () => {
    setSubject("");
    setMessage("");
    setErrors({});
    setFormError(null);
    setSent(false);
  };

  const submit = async () => {
    const next: Record<string, string> = {};
    if (!subject.trim()) next.subject = texts.support.validationSubject;
    if (message.trim().length < MIN_MESSAGE) next.message = texts.support.validationMessage;
    if (!EMAIL_PATTERN.test(contactEmail.trim())) next.contactEmail = texts.support.validationEmail;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setFormError(null);
    setSending(true);
    try {
      await supportApi.open({
        subject: subject.trim(),
        message: message.trim(),
        contactEmail: contactEmail.trim(),
      });
      setSent(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : texts.support.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          <>{texts.post.back}</>
        </Link>

        <div className="surface-card p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-primary" />

            <h1 className="text-2xl font-semibold tracking-tight">{texts.support.title}</h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">{texts.support.subtitle}</p>

          {sent ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />

              <h2 className="mt-3 text-lg font-semibold tracking-tight">
                {texts.support.successTitle}
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                {texts.support.successDescription}
              </p>

              <Button variant="outline" className="mt-6 rounded-full" onClick={reset}>
                {texts.support.newRequest}
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="support-subject">{texts.support.subject}</Label>

                <Input
                  id="support-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder={texts.support.subjectPlaceholder}
                  maxLength={160}
                />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="support-message">{texts.support.message}</Label>

                <Textarea
                  id="support-message"
                  rows={6}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={texts.support.messagePlaceholder}
                  maxLength={4000}
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="support-email">{texts.support.contactEmail}</Label>

                <Input
                  id="support-email"
                  type="email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  maxLength={255}
                />

                <p className="text-[11px] text-text-subtle">{texts.support.contactEmailHint}</p>
                {errors.contactEmail && (
                  <p className="text-xs text-destructive">{errors.contactEmail}</p>
                )}
              </div>

              {formError && (
                <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  {formError}
                </p>
              )}

              <Button className="w-full rounded-full" disabled={sending} onClick={submit}>
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    <>{texts.support.sending}</>
                  </>
                ) : (
                  texts.support.action
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppContainer>
  );
}
