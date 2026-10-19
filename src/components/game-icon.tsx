import { useState } from "react";

import { Gamepad2 } from "lucide-react";

import { resolveCdnUrl } from "@/lib/api/media";

/**
 * Ícone do jogo em qualquer lista: a capa enviada; sem capa, o **favicon do site onde o jogo
 * vive** (pedido da Mel para a exibição global); sem nenhum dos dois, o controle. O `onError`
 * cobre favicon ausente ou bloqueado — o card nunca fica com imagem quebrada.
 */
export function GameIcon({
  cover,
  url,
  className = "h-12 w-12",
}: {
  cover?: string | null;
  url?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = cover ? resolveCdnUrl(cover) : faviconOf(url);

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
