export type IdentityState =
  | "NOT_VERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED"
  | "REVOKED"
  | "ERROR";

export type IdentityStatus = {
  state: IdentityState;
  verified: boolean;
  providerAvailable: boolean;
  provider: string | null;
  reasonCode: string | null;
  completedAt: string | null;
};

export type JobEligibility = {
  allowed: boolean;
  reputation: number;
  requiredReputation: number;
  identityVerified: boolean;
  identityEnforced: boolean;
  reason: string | null;
};
