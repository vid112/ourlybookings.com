import { describe, expect, it } from "vitest";
import { demoProfiles, indiaStates } from "./india";

describe("India location fallback", () => {
  it("contains every Indian state and union territory", () => {
    expect(indiaStates).toHaveLength(36);
    expect(indiaStates.filter((item) => item.type === "State")).toHaveLength(28);
    expect(indiaStates.filter((item) => item.type === "Union territory")).toHaveLength(8);
  });

  it("uses unique location slugs", () => {
    const stateSlugs = indiaStates.map((state) => state.slug);
    expect(new Set(stateSlugs).size).toBe(stateSlugs.length);
    for (const state of indiaStates) {
      const citySlugs = state.cities.map((item) => item.slug);
      expect(new Set(citySlugs).size).toBe(citySlugs.length);
    }
  });

  it("provides one fictional profile for every seeded city route", () => {
    const cityCount = indiaStates.reduce((total, state) => total + state.cities.length, 0);
    expect(demoProfiles).toHaveLength(cityCount);
    expect(demoProfiles.every((profile) => profile.demo && profile.verifiedAdult)).toBe(true);
  });
});
