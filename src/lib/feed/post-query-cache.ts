import type { QueryClient } from "@tanstack/react-query";

import type { PostView } from "@/types/application/feed/post-view";
import type { FeedPages } from "@/types/lib/feed/feed-pages";

export function updatePostInQueryCache(
  queryClient: QueryClient,
  postId: string,
  update: (post: PostView) => PostView,
) {
  queryClient.setQueriesData<FeedPages>({ queryKey: ["feed"] }, (current) => {
    if (!current) return current;
    return {
      ...current,
      pages: current.pages.map((page) => ({
        ...page,
        items: page.items.map((post) => (post.id === postId ? update(post) : post)),
      })),
    };
  });

  queryClient.setQueryData<PostView>(["post", postId], (post) =>
    post && post.id === postId ? update(post) : post,
  );
}
