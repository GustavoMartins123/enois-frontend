import { type CSSProperties, useMemo } from "react";

import {
  profileNameFontFamily,
  profileNameTheme,
  profileNameThemePaint,
} from "@/constants/profile-name-fonts";
import { usePreferencesStore } from "@/stores/preferences.store";
import { texts } from "@/texts";
import type { ThemeProfilePreviewProps } from "@/types/components/marketplace/theme-profile-preview-props";
import { Briefcase, MapPin } from "lucide-react";

import { useCurrentUser } from "@/lib/current-user";
import { buildGalleryCollection } from "@/lib/theme/gallery-collections";
import { useIsAuthenticated } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingState } from "@/components/ui/loading-state";

import { UserAvatar } from "@/components/user-avatar";

export function ThemeProfilePreview({ theme, title }: ThemeProfilePreviewProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full rounded-full">
          {texts.marketplace.previewAction}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="break-words pr-6">
            {texts.marketplace.previewTitle(title)}
          </DialogTitle>

          <DialogDescription>{texts.marketplace.previewDescription}</DialogDescription>
        </DialogHeader>

        <ProfilePreview theme={theme} />
      </DialogContent>
    </Dialog>
  );
}

function ProfilePreview({ theme }: Pick<ThemeProfilePreviewProps, "theme">) {
  const authenticated = useIsAuthenticated();
  const profile = useCurrentUser();
  const localNameFont = usePreferencesStore((state) => state.displayNameFont);
  const localNameColor = usePreferencesStore((state) => state.displayNameColor);
  const localNameTheme = usePreferencesStore((state) => state.displayNameTheme);
  // A mesma expansão de tokens de "Aplicar", sem registrar a coleção nem salvar preferências.
  const collection = useMemo(() => buildGalleryCollection(theme), [theme]);
  const mode = theme.modeDefault === "dark" ? "dark" : "light";

  if (authenticated && profile.isPending) return <LoadingState label={texts.common.loading} />;
  if (authenticated && profile.isError) {
    return (
      <div className="space-y-3" role="alert">
        <p className="text-sm text-text-subtle">{texts.profile.loadError}</p>

        <Button variant="outline" onClick={() => void profile.refetch()}>
          {texts.marketplace.previewRetry}
        </Button>
      </div>
    );
  }

  const user = authenticated ? profile.data : undefined;
  const name = user?.name ?? texts.appearance.previewAvatarName;
  const nameTheme = user ? (localNameTheme ?? user.nameTheme) : null;
  const nameDefinition = profileNameTheme(nameTheme);
  const nameFont = user ? (localNameFont ?? user.nameFont ?? nameDefinition.font) : null;
  const nameColor = user ? (localNameColor ?? user.nameColor) : null;

  return (
    <section
      aria-label={texts.marketplace.profilePreview}
      className="min-w-0 space-y-4 rounded-xl bg-background p-3 text-foreground sm:p-5"
      style={{ ...collection.tokens[mode], colorScheme: mode } as CSSProperties}
    >
      {!user && <p className="text-sm text-text-subtle">{texts.marketplace.previewGuest}</p>}

      {/* O token direto evita o CSS estrutural de .bg-surface-card da coleção ativa. */}
      <div className="rounded-[1.5rem] border border-border-soft bg-[var(--surface-card)]">
        <div
          className="h-24 rounded-t-[1.5rem] sm:h-32"
          style={{ background: "var(--gradient-primary)" }}
        />

        <div className="relative px-5 pb-5">
          <UserAvatar
            src={user?.avatar}
            alt={name}
            frame={user?.avatarFrame}
            className="-mt-10 h-20 w-20 ring-4 ring-surface-card"
          />

          <div className="mt-4 space-y-2">
            <h3
              className={cn(
                "break-words text-xl text-[color:var(--text-strong)]",
                nameDefinition.className,
              )}
              style={{
                fontFamily: profileNameFontFamily(nameFont),
                ...(nameDefinition.colors.length > 1
                  ? {
                      backgroundImage: profileNameThemePaint(nameTheme, nameColor),
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }
                  : { color: nameColor ?? undefined }),
              }}
            >
              {name}
            </h3>

            {user?.username && (
              <p className="break-words text-sm text-text-subtle">@{user.username}</p>
            )}
            {user?.headline && <p className="break-words text-sm text-primary">{user.headline}</p>}

            {(user?.company || user?.location) && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-subtle">
                {user.company && (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Briefcase className="h-4 w-4 shrink-0" />

                    <span className="min-w-0 break-words">{user.company}</span>
                  </span>
                )}

                {user.location && (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" />

                    <span className="min-w-0 break-words">{user.location}</span>
                  </span>
                )}
              </div>
            )}

            {user?.openToWork && (
              <span className="inline-flex rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-growth">
                {texts.profile.openToWork}
              </span>
            )}
          </div>
        </div>
      </div>

      {user && user.skills.length > 0 && (
        <div className="rounded-2xl border border-border-soft bg-[var(--surface-card)] p-4">
          <h4 className="text-sm font-medium text-[color:var(--text-strong)]">
            {texts.profile.sections.skills}
          </h4>

          <ul className="mt-3 flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <li
                key={skill}
                className="min-w-0 break-words rounded-full bg-surface-2 px-3 py-1 text-xs text-primary"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
