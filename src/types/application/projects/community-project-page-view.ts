import type { CommunityProjectView } from "./community-project-view";

export type CommunityProjectPageView = {
  items: CommunityProjectView[];
  nextCursor: string | null;
};
