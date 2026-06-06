import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { resolveCdnUrl } from "@/lib/api/media";

interface UserAvatarProps {
  src?: string | null;
  alt?: string | null;
  className?: string;
  fallback?: string;
}

export function UserAvatar({ src, alt, className, fallback }: UserAvatarProps) {
  const label = alt ?? "Avatar";
  return (
    <Avatar className={className}>
      <AvatarImage
        src={resolveCdnUrl(src) ?? "/empty.png"}
        alt={label}
        className={!src ? "dark:invert" : undefined}
      />
      <AvatarFallback>{fallback ?? label[0]?.toUpperCase() ?? "?"}</AvatarFallback>
    </Avatar>
  );
}
