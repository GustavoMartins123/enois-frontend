import { useState } from "react";

import { Gamepad2 } from "lucide-react";

import { resolveCdnUrl } from "@/lib/api/media";

/**
 * Ícone do jogo em qualquer lista: a **foto de perfil do jogo** (quando o criador subiu uma) vence
 * tudo; sem ela, a capa enviada; sem capa, o **favicon do site onde o jogo vive** (pedido da Mel
 * para a exibição global); sem nenhum, o controle. O `onError` cobre imagem/favicon ausente ou
 * bloqueado — o card nunca fica com imagem quebrada.
 */
export function GameIcon({
  cover,
  icon,
  url,
  className = "h-12 w-12",
}: {
  cover?: string | null;
  /** Foto de perfil própria do jogo: a alternativa ao favicon. */
  icon?: string | null;
  url?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = icon ? resolveCdnUrl(icon) : cover ? resolveCdnUrl(cover) : faviconOf(url);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${className} shrink-0 rounded-xl object-cover`}
      />
    );
  }

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl bg-primary-soft text-primary ${className}`}
    >
      <Gamepad2 className="h-5 w-5" />
    </span>
  );
}

function faviconOf(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? `${parsed.origin}/favicon.ico`
      : null;
  } catch {
    return null;
  }
}
