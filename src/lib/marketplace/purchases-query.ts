import { queryOptions } from "@tanstack/react-query";

import { marketplaceApi } from "@/lib/api";

export function marketplacePurchasesQueryOptions(sessionKey: string | null) {
  return queryOptions({
    queryKey: ["marketplace", "purchases", sessionKey],
    queryFn: () => marketplaceApi.purchases(),
  });
}
