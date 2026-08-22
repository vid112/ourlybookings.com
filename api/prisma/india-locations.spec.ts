import { getIndiaLocations } from "./india-locations";

describe("India location seed data", () => {
  const locations = getIndiaLocations();

  it("contains every Indian state and union territory", () => {
    expect(locations).toHaveLength(36);
    expect(locations.filter((location) => location.type === "State")).toHaveLength(28);
    expect(locations.filter((location) => location.type === "Union territory")).toHaveLength(8);
  });

  it("contains the complete available city dataset with unique slugs per state", () => {
    expect(
      locations.reduce((total, location) => total + location.cities.length, 0),
    ).toBeGreaterThan(4_000);

    for (const location of locations) {
      expect(location.cities.length).toBeGreaterThan(0);
      expect(new Set(location.cities.map((city) => city.slug)).size).toBe(location.cities.length);
    }
  });
});
