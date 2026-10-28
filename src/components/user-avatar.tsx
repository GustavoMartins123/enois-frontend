import {
  UserAvatar as DesignSystemUserAvatar,
  type UserAvatarProps,
} from "@rede-enois/design-system/domain";

import { isDesignSystemFrame, isNewFxFrame } from "@/lib/avatar-frames";

import { NewFrameAvatar } from "@/components/avatar-frames/new-frame-avatar";

/** A foto e as molduras existentes vêm do design system; as novas coleções são compostas no app. */
export function UserAvatar(props: UserAvatarProps) {
  const { frame } = props;
  if (frame == null || isDesignSystemFrame(frame)) return <DesignSystemUserAvatar {...props} />;
  if (isNewFxFrame(frame)) return <NewFrameAvatar {...props} frame={frame} />;
  return <DesignSystemUserAvatar {...props} />;
}
