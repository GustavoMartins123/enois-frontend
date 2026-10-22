import { texts } from "@/texts";
import type { JobApplication } from "@/types/application/job/job-application";
import type { JobApplicationStatus } from "@/types/application/job/job-application-status";

/**
 * Regras de triagem do lado da interface, em um lugar só.
 *
 * Sao as MESMAS transicoes que o backend valida (JobApplicationStatus.canMoveTo): a tela nunca
 * oferece uma acao que o servidor recusaria. Se a politica mudar la, muda aqui junto.
 */
export function actionsFor(status: JobApplicationStatus) {
  switch (status) {
    case "APPLIED":
      return [
        { status: "IN_REVIEW" as const, label: texts.jobs.applications.markInReview },
        { status: "NOT_SELECTED" as const, label: texts.jobs.applications.markNotSelected },
      ];
    case "IN_REVIEW":
      return [
        { status: "ADVANCED" as const, label: texts.jobs.applications.markAdvanced },
        { status: "NOT_SELECTED" as const, label: texts.jobs.applications.markNotSelected },
      ];
    case "ADVANCED":
      return [{ status: "IN_REVIEW" as const, label: texts.jobs.applications.backToReview }];
    // Terminal: a decisao ja foi comunicada ao candidato.
    case "NOT_SELECTED":
      return [];
  }
}

/** Cor do selo: em andamento chama atencao, terminal fica discreto. */
export function statusTone(status: JobApplicationStatus): string {
  switch (status) {
    case "IN_REVIEW":
    case "ADVANCED":
      return "bg-primary-soft text-primary";
    default:
      return "bg-muted text-text-subtle";
  }
}

export function applicationStatusLabel(status: JobApplication["status"]): string {
  return texts.jobs.applications.statusLabels[status];
}
