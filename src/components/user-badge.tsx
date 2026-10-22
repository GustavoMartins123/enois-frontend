import { MAX_BADGES } from "@/constants/badges";

import { resolveCdnUrl } from "@/lib/api/media";

/**
 * Emblemas (até 5 PNGs) escolhidos pela própria pessoa no editar perfil.
 *
 * Aparecem colados ao nome dela onde quer que o nome apareça — perfil, post, comentário, blog e
 * página do criador. `badge` é o campo antigo de um emblema só: quando a lista não veio (backend
 * ainda sem `authorBadges`), ele é a lista. Sem emblema, não renderiza nada.
 */
export function UserBadges({
  badges,
  badge,
  className,
}: {
  badges?: (string | null)[] | null;
  badge?: string | null;
  className?: string;
}) {
  const lista = (badges?.length ? badges : badge ? [badge] : [])
    .filter((url): url is string => Boolean(url))
    .slice(0, MAX_BADGES);

  if (lista.length === 0) return null;

  return (
    <span className="inline-flex shrink-0 items-center gap-0.5">
      {lista.map((url, index) => (
        <img
          key={`${index}-${url}`}
          src={resolveCdnUrl(url)}
          alt=""
          className={`h-4 w-4 shrink-0 rounded-full object-cover ${className ?? ""}`}
        />
      ))}
    </span>
  );
}
