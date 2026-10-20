export type ModeratorSanctionResult = {
  userId: string;
  username: string;
  type: "RESTRICTION" | "BAN";
  status: string;
};
