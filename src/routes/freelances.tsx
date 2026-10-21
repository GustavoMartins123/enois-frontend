import { createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";

import { JobsListPage } from "./vagas";

export const Route = createFileRoute("/freelances")({
  head: () => ({ meta: [{ title: texts.jobs.freelanceSeoTitle }] }),
  component: Freelances,
});

function Freelances() {
  return (
    <JobsListPage
      lockedType="FREELANCE"
      title={texts.jobs.freelanceTitle}
      description={texts.jobs.freelanceDescription}
    />
  );
}
