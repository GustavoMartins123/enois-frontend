import { createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/developers")({
  // Página PUBLICA de documentação. O subdomínio developers.enois.ia.br aponta para cá quando o
  // DNS/TLS estiver configurado (ver docs/DEVELOPERS_PORTAL.md no backend).
  head: () => ({
    meta: [
      { title: texts.developers.seoTitle },
      { name: "description", content: texts.developers.seoDescription },
    ],
  }),
  component: Developers,
});

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-xl border border-border-soft bg-surface-1 p-3 text-xs leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-5">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>

      <div className="mt-2 space-y-2 text-sm font-normal text-text-subtle">{children}</div>
    </section>
  );
}

function Developers() {
  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">{texts.developers.title}</h1>

          <p className="mt-1 text-sm text-text-subtle">{texts.developers.subtitle}</p>
        </header>

        <Section title={texts.developers.philosophyTitle}>
          <p>{texts.developers.philosophy}</p>
        </Section>

        <Section title={texts.developers.baseUrlTitle}>
          <p>
            {texts.developers.baseUrlHint} <code>https://enois.ia.br/api</code>
          </p>

          <p className="rounded-xl bg-surface-2 p-3 text-xs">{texts.developers.baseUrlNote}</p>
        </Section>

        <Section title={texts.developers.authTitle}>
          <p>{texts.developers.authIntro}</p>

          <Code>{`POST /api/auth/login
Content-Type: application/json
Idempotency-Key: <uuid>

{ "email": "voce@exemplo.com", "password": "••••••" }

# 200 ->
{ "token": "<session>", "refreshToken": "<refresh>", "expiresAt": "...", "user": { ... } }`}</Code>

          <p>{texts.developers.authHeader}</p>

          <Code>{`X-Session-Token: <session>`}</Code>

          <p>{texts.developers.authNote}</p>
        </Section>

        <Section title={texts.developers.endpointsTitle}>
          <p>{texts.developers.endpointsIntro}</p>

          <ul className="list-disc space-y-1 pl-5">
            <li>
              <code>GET /api/feed</code>, <code>GET /api/feed/posts/&#123;postId&#125;</code>
            </li>
            <li>
              <code>GET /api/users/&#123;username&#125;</code>, <code>GET /api/users/search?q=</code>
            </li>
            <li>
              <code>GET /api/communities</code>, <code>GET /api/communities/&#123;id&#125;/feed</code>
            </li>
            <li>
              <code>GET /api/jobs</code>, <code>GET /api/jobs/&#123;jobId&#125;</code>
            </li>
            <li>
              <code>GET /api/events</code>, <code>GET /api/mentors</code>
            </li>
            <li>
              <code>GET /api/notifications</code>, <code>GET /api/conversations</code>,{" "}
              <code>GET /api/identity</code>
            </li>
          </ul>

          <p>{texts.developers.endpointsNote}</p>
        </Section>

        <Section title={texts.developers.paginationTitle}>
          <p>{texts.developers.pagination}</p>

          <Code>{`{ "items": [ ... ], "nextCursor": "<cursor ou null>" }`}</Code>
        </Section>

        <Section title={texts.developers.errorsTitle}>
          <p>{texts.developers.errors}</p>

          <Code>{`{ "code": "POST_NOT_FOUND", "message": "Post nao encontrado.", "timestamp": "..." }`}</Code>

          <p>{texts.developers.errorsNote}</p>
        </Section>

        <Section title={texts.developers.limitsTitle}>
          <p>{texts.developers.limits}</p>
        </Section>

        <Section title={texts.developers.publishingTitle}>
          <p>{texts.developers.publishing}</p>
        </Section>

        <Section title={texts.developers.statusTitle}>
          <p>{texts.developers.status}</p>

          <p>
            {texts.developers.securityLinkPrefix}{" "}
            <a className="text-primary hover:underline" href="mailto:seguranca@enois.ia.br">
              seguranca@enois.ia.br
            </a>
          </p>
        </Section>
      </div>
    </AppContainer>
  );
}
