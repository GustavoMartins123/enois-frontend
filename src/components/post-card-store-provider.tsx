import { type ReactNode, createContext, useContext, useState } from "react";

import { useStore } from "zustand";

import type { PostView } from "@/lib/api";
import { createPostCardStore } from "@/stores/post-card.store";

const PostCardStoreContext = createContext<ReturnType<typeof createPostCardStore> | null>(null);

export function PostCardStoreProvider({ post, children }: { post: PostView; children: ReactNode }) {
  const [store] = useState(() => createPostCardStore(post));

  return <PostCardStoreContext.Provider value={store}>{children}</PostCardStoreContext.Provider>;
}

export function usePostCardStore<T>(
  selector: (state: ReturnType<ReturnType<typeof createPostCardStore>["getState"]>) => T,
) {
  const store = useContext(PostCardStoreContext);

  if (!store) {
    throw new Error("usePostCardStore must be used within PostCardStoreProvider");
  }

  return useStore(store, selector);
}
