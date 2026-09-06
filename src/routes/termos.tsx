import { Link, createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";

import { LegalLastUpdated, LegalLayout, LegalSection } from "@/components/legal-layout";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: texts.legal.terms.seoTitle },
      {
        name: "description",
        content:
          texts.legal.terms.seoDescription,
      },
    ],
  }),
  component: Termos,
});

function Termos() {
  const [
    acceptance,
    definitions,
    registration,
    conduct,
    publishedContent,
    jobs,
    thirdParty,
    availability,
    liability,
    termination,
    law,
    contact,
  ] = texts.legal.terms.sections;

  return (
    <LegalLayout>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{texts.legal.terms.title}</h1>
        <LegalLastUpdated date={texts.legal.updatedAt} />
      </header>

      <LegalSection title={acceptance.title}>
        <p className="whitespace-pre-line">{acceptance.text}</p>
      </LegalSection>

      <LegalSection title={definitions.title}>
        <p className="whitespace-pre-line">{definitions.text}</p>
      </LegalSection>

      <LegalSection title={registration.title}>
        <p className="whitespace-pre-line">{registration.text}</p>
      </LegalSection>

      <LegalSection title={conduct.title}>
        <p className="whitespace-pre-line">{conduct.text}</p>
      </LegalSection>

      <LegalSection title={publishedContent.title}>
        <p className="whitespace-pre-line">{publishedContent.text}</p>
      </LegalSection>

      <LegalSection title={jobs.title}>
        <p className="whitespace-pre-line">{jobs.text}</p>
      </LegalSection>

      <LegalSection title={thirdParty.title}>
        <p className="whitespace-pre-line">{thirdParty.text}</p>
      </LegalSection>

      <LegalSection title={availability.title}>
        <p className="whitespace-pre-line">{availability.text}</p>
      </LegalSection>

      <LegalSection title={liability.title}>
        <p className="whitespace-pre-line">{liability.text}</p>
      </LegalSection>

      <LegalSection title={termination.title}>
        <p className="whitespace-pre-line">{termination.text}</p>
      </LegalSection>

      <LegalSection title={law.title}>
        <p className="whitespace-pre-line">{law.text}</p>
      </LegalSection>

      <LegalSection title={contact.title}>
        <p className="whitespace-pre-line">{contact.text}</p>
      </LegalSection>

      <footer className="border-t border-border pt-6 text-sm">
        <p>
          <>{texts.legal.footer.backPrefix} </><Link to="/" className="text-primary hover:underline">
            {texts.legal.footer.home}
          </Link>
        </p>
      </footer>
    </LegalLayout>
  );
}
