import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
        src={src ?? "/empty.png"}
        alt={label}
        className={!src ? "dark:invert" : undefined}
      />
      <AvatarFallback>{fallback ?? label[0]?.toUpperCase() ?? "?"}</AvatarFallback>
    </Avatar>
  );
}
