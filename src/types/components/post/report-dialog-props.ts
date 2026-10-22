import type { ReportTargetType } from "@/types/application/report/report-target-type";

/**
 * Denúncia de qualquer alvo (post, comentário, perfil, vaga). O formulário é um só — o que muda é
 * o tipo do alvo, que o backend já aceita nos quatro. Quem abre manda no `open` (o post guarda o
 * estado no store do card; comentário e perfil usam estado local).
 */
export type ReportDialogProps = {
  targetId: string;
  targetType: ReportTargetType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
