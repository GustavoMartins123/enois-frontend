import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { resolveCdnUrl } from "@/lib/api/media";

interface UserAvatarProps {
  src?: string | null;
  alt?: string | null;
  className?: string;
  fallback?: string;
  fallbackClassName?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return `${first}${last}`.toUpperCase();
}

export function UserAvatar({ src, alt, className, fallback, fallbackClassName }: UserAvatarProps) {
  const label = alt ?? "Avatar";
  const resolved = resolveCdnUrl(src);
  return (
    <Avatar className={className}>
<<<<<<< HEAD
      {resolved && (
        <AvatarImage src={resolved} alt={label} />
      )}
      <AvatarFallback className={fallbackClassName ?? "bg-violet-300 text-violet-900 font-bold text-xl leading-[30px] tracking-normal"}>
=======
      {resolved && <AvatarImage src={resolved} alt={label} />}
      <AvatarFallback
        className={
          fallbackClassName ??
          "bg-highlight-project text-highlight-project-text font-semibold bg-violet-300 text-violet-900 font-bold text-xl leading-[30px] tracking-normal"
        }
      >
>>>>>>> origin/chore/fase-6-cleanup-qa
        {fallback ?? getInitials(label)}
      </AvatarFallback>
    </Avatar>
  );
}
