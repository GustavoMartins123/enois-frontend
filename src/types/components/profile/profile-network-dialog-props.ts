export type ProfileNetworkDialogProps = {
  username: string;
  name: string;
  kind: "connections" | "followers";
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
