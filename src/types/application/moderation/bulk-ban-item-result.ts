export type BulkBanItemResult = {
  username: string;
  status: "BANNED" | "ALREADY_BANNED" | "FAILED";
  message: string;
};
