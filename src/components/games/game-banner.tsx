import { resolveCdnUrl } from "@/lib/api/media";

import { SandboxedHtmlFrame } from "@/components/post/sandboxed-html-frame";

/**
 * Banner do topo da página do jogo: FOTO ou HTML/CSS editável — as duas opções, como no banner
 * do perfil. A foto vence quando as duas existem; o HTML roda no mesmo quadro isolado do resto do
 * app (sem script, sem rede), porque é conteúdo colado pelo criador.
 */
export function GameBanner({
  banner,
  bannerHtml,
  title,
}: {
  banner?: string | null;
  bannerHtml?: string | null;
  title: string;
}) {
  if (banner) {
    return (
      <img
        src={resolveCdnUrl(banner)}
        alt=""
        className="h-32 w-full rounded-2xl object-cover sm:h-44"
      />
    );
  }

  if (bannerHtml) {
    return (
      <div className="h-32 w-full overflow-hidden rounded-2xl border border-border-soft sm:h-44">
        <SandboxedHtmlFrame
          html={bannerHtml}
          title={`Banner de ${title}`}
          className="h-full"
          innerPadding={false}
          autoHeight={false}
        />
      </div>
    );
  }

  return null;
}
