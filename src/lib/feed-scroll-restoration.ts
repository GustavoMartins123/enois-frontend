import type { FeedScrollState } from "@/types/lib/feed-scroll-state";
import type { HomeTab } from "@/types/routes/feed/home-tab";

const STORAGE_KEY = "feed:scroll-restoration";

export function saveFeedScroll(state: FeedScrollState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // A private browsing context can disable storage; navigation still works without restoration.
  }
}

export function readFeedScroll(tab: HomeTab): FeedScrollState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const state = JSON.parse(raw) as Partial<FeedScrollState>;
    if (
      state.tab !== tab ||
      typeof state.postId !== "string" ||
      typeof state.scrollY !== "number" ||
      !Number.isFinite(state.scrollY)
    ) {
      return null;
    }

    return state as FeedScrollState;
  } catch {
    return null;
  }
}

export function clearFeedScroll(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // A private browsing context can disable storage; there is nothing to clear.
  }
}
