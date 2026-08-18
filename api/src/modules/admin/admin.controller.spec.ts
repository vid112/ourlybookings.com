import { normalizeSlug } from "./admin.controller";

describe("normalizeSlug", () => {
  it("normalizes mixed punctuation and whitespace", () => {
    expect(normalizeSlug("  New Delhi / VIP Profile  ")).toBe("new-delhi-vip-profile");
  });
});
