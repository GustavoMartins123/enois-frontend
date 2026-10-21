export type SuspiciousPostView = {
  postId: string;
  reportId: string;
  score: number;
  reason: string;
  /** JSON da pré-triagem: { signals: string[], score: number }. */
  signals: string;
};

export type BulkDeletePostsResult = {
  total: number;
  items: { postId: string; status: "DELETED" | "FAILED" }[];
};
