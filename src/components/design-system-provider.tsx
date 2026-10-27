import { Link } from "@tanstack/react-router";

import type { WithRequiredChildren } from "@/types/components/with-required-children";
import { EnoisProvider, type LinkProps } from "@rede-enois/design-system";

import { resolveCdnUrl } from "@/lib/api/media";

/** Design system links navigate through the router; anything outside the app stays a plain anchor. */
function RouterLink({ href, ...props }: LinkProps) {
  if (!href.startsWith("/")) return <a href={href} {...props} />;
  return <Link to={href} {...props} />;
}

/** Plugs the app's router and media CDN into the design system components. */
export function DesignSystemProvider({ children }: WithRequiredChildren) {
  return (
    <EnoisProvider Link={RouterLink} resolveMediaUrl={resolveCdnUrl}>
      {children}
    </EnoisProvider>
  );
}
