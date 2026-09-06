import type { PropsWithChildren } from "react";

import type { Profile } from "@/types/application/profile/profile";

export type Props = PropsWithChildren<{
  profile: Profile;
}>;
