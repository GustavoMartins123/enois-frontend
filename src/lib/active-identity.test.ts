import type { CorporateProfileView } from "@/types/application/corporate/corporate-profile-view";
import { describe, expect, it } from "vitest";

import { effectiveIdentity } from "./active-identity";

const base: CorporateProfileView = {
  exists: true,
  username: "mel.pro",
  name: "Mel Pro",
  headline: "Headline",
  bio: "",
  avatar: "",
  banner: "",
  location: "",
  industry: "",
  externalLinks: "",
  status: "ACTIVE",
};

describe("effectiveIdentity", () => {
  it("usa a identidade profissional quando o perfil existe e está ATIVO", () => {
    expect(effectiveIdentity("CORPORATE", base)).toBe("CORPORATE");
  });

  it("nunca devolve profissional sem perfil ativo", () => {
    expect(effectiveIdentity("CORPORATE", null)).toBe("SOCIAL");
    expect(effectiveIdentity("CORPORATE", undefined)).toBe("SOCIAL");
    expect(effectiveIdentity("CORPORATE", { ...base, exists: false })).toBe("SOCIAL");
    expect(effectiveIdentity("CORPORATE", { ...base, status: "DRAFT" })).toBe("SOCIAL");
    expect(effectiveIdentity("CORPORATE", { ...base, status: "DISABLED" })).toBe("SOCIAL");
  });

  it("social continua social mesmo com perfil ativo", () => {
    expect(effectiveIdentity("SOCIAL", base)).toBe("SOCIAL");
  });
});
