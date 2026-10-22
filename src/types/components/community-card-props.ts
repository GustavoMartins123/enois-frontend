import type { Community } from "@/types/application/community/community";

export type CommunityCardProps = {
  community: Community;
  joinPending: boolean;
  leavePending: boolean;
  /** Dono não sai sem transferir: o aviso aparece no próprio card. */
  ownerBlocked: boolean;
  onJoin: (communityId: string) => void;
  onLeave: (community: Community) => void;
};
