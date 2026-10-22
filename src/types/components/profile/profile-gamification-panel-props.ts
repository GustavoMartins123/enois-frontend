import type { Profile } from "@/types/application/profile/profile";

export type ProfileGamificationPanelProps = {
  profile: Profile;
  isOwner: boolean;
  postsCount: number;
};
