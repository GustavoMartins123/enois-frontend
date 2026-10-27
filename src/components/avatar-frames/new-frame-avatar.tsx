import type { NewFrameAvatarProps } from "@/types/components/user-avatar/new-frame-avatar-props";
import { UserAvatar as DesignSystemUserAvatar } from "@rede-enois/design-system/domain";

import { useNewFrameAnimation } from "@/lib/use-new-frame-animation";
import { cn } from "@/lib/utils";

import { AvatarFrameFx } from "./avatar-frame-fx";
import "./avatar-frames.css";

export function NewFrameAvatar({
  frame,
  className,
  frameOverflow = "visible",
  ...avatarProps
}: NewFrameAvatarProps) {
  const animationRef = useNewFrameAnimation(frame);
  return (
    <span
      ref={animationRef}
      className={cn(
        "@container relative isolate flex h-10 w-10 shrink-0 rounded-full",
        frameOverflow === "hidden" && "overflow-hidden",
        className,
      )}
      data-avatar-frame={frame}
      data-avatar-animated
    >
      <DesignSystemUserAvatar {...avatarProps} className="h-full w-full" />
      <AvatarFrameFx frame={frame} />
    </span>
  );
}
