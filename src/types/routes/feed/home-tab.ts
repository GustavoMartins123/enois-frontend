import type { FeedTab } from "@/types/application/feed/feed-tab";

/** Abas da tela inicial: as do feed social + o feed corporativo (endpoint próprio). */
export type HomeTab = FeedTab | "CORPORATE";
