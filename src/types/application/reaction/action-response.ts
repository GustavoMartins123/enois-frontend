import type { PostView } from "../feed/post-view";

export type ActionResponse = {
  postId: string;
  status: string;
  counters: PostView["counters"];
};
