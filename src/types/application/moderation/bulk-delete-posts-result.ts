export type BulkDeletePostsResult = {
  total: number;
  items: { postId: string; status: "DELETED" | "FAILED" }[];
};
