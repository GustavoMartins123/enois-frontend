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
        <p>
          {acceptance.paragraphs[0]}
        </p>
      </LegalSection>

      <LegalSection title={definitions.title}>
        <p>
          {definitions.paragraphs[0]}
        </p>
      </LegalSection>

      <LegalSection title={registration.title}>
        <p>
          {registration.paragraphs[0]}
        </p>
        <p>
          {registration.paragraphs[1]}
        </p>
      </LegalSection>

      <LegalSection title={conduct.title}>
        <p>
          {conduct.paragraphs[0]}
        </p>
        <p>
          {conduct.paragraphs[1]}
        </p>
      </LegalSection>

      <LegalSection title={publishedContent.title}>
        <p>
          {publishedContent.paragraphs[0]}
        </p>
        <p>
          {publishedContent.paragraphs[1]}
        </p>
      </LegalSection>

      <LegalSection title={jobs.title}>
        <p>
          {jobs.paragraphs[0]}
        </p>
      </LegalSection>

      <LegalSection title={thirdParty.title}>
        <p>
          {thirdParty.paragraphs[0]}
        </p>
      </LegalSection>

      <LegalSection title={availability.title}>
        <p>
          {availability.paragraphs[0]}
        </p>
        <p>
          {availability.paragraphs[1]}
        </p>
      </LegalSection>

      <LegalSection title={liability.title}>
        <p>
          {liability.paragraphs[0]}
        </p>
      </LegalSection>

      <LegalSection title={termination.title}>
        <p>
          {termination.paragraphs[0]}
        </p>
      </LegalSection>

      <LegalSection title={law.title}>
        <p>
          {law.paragraphs[0]}
        </p>
      </LegalSection>

      <LegalSection title={contact.title}>
        <p>
          {contact.paragraphs[0]}
        </p>
      </LegalSection>

      <footer className="border-t border-border pt-6 text-sm">
        <p>
          {texts.legal.footer.backPrefix}{" "}
          <Link to="/" className="text-primary hover:underline">
            {texts.legal.footer.home}
          </Link>
        </p>
      </footer>
    </LegalLayout>
  );
}
