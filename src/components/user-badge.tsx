import { resolveCdnUrl } from "@/lib/api/media";

/**
 * Emblema (PNG) escolhido pela própria pessoa no editar perfil.
 *
 * Deve aparecer colado ao nome dela ondequer que o nome apareça (perfil, post, comentário,
 * mensagens). Sem emblema, não renderiza nada.
 */
export function UserBadge({ badge, className }: { badge?: string | null; className?: string }) {
  if (!badge) return null;

  return (
    <img
      src={resolveCdnUrl(badge)}
      alt=""
      className={`h-4 w-4 shrink-0 rounded-full object-cover ${className ?? ""}`}
    />
  );
}
