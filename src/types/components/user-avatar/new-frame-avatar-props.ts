import type { UserAvatarProps } from "@rede-enois/design-system/domain";

export type NewFrameAvatarProps = Omit<UserAvatarProps, "frame"> & {
  frame: string;
};
