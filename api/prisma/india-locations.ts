import { City as CityData, State as StateData } from "country-state-city";

const INDIA_COUNTRY_CODE = "IN";
const UNION_TERRITORY_CODES = new Set(["AN", "CH", "DH", "DL", "JK", "LA", "LD", "PY"]);

export type IndiaCitySeed = {
  name: string;
  slug: string;
  latitude?: number;
  longitude?: number;
};

export type IndiaStateSeed = {
  name: string;
  slug: string;
  type: "State" | "Union territory";
  cities: IndiaCitySeed[];
};

export function slugifyLocation(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cleanLocationName(value: string) {
  return value.trim().replace(/,+$/, "").replace(/\s+/g, " ");
}

function parseCoordinate(value?: string | null) {
  const coordinate = Number.parseFloat(value ?? "");
  return Number.isFinite(coordinate) ? coordinate : undefined;
}

export function getIndiaLocations(): IndiaStateSeed[] {
  return StateData.getStatesOfCountry(INDIA_COUNTRY_CODE).map((state) => {
    const cities = new Map<string, IndiaCitySeed>();

    for (const sourceCity of CityData.getCitiesOfState(INDIA_COUNTRY_CODE, state.isoCode)) {
      const name = cleanLocationName(sourceCity.name);
      const slug = slugifyLocation(name);
      if (!slug || cities.has(slug)) continue;

      cities.set(slug, {
        name,
        slug,
        latitude: parseCoordinate(sourceCity.latitude),
        longitude: parseCoordinate(sourceCity.longitude),
      });
    }

    return {
      name: state.name,
      slug: slugifyLocation(state.name),
      type: UNION_TERRITORY_CODES.has(state.isoCode) ? "Union territory" : "State",
      cities: [...cities.values()].sort((left, right) => left.name.localeCompare(right.name)),
    };
  });
}
