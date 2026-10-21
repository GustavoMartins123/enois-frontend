export type BulkBanItemResult = {
  username: string;
  status: "BANNED" | "ALREADY_BANNED" | "FAILED";
  message: string;
};

export type BulkBanResult = {
  total: number;
  banned: number;
  alreadyBanned: number;
  failed: number;
  items: BulkBanItemResult[];
};
