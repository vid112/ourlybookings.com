import "dotenv/config";
import { createHash } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { load } from "cheerio";
import { PrismaClient } from "../src/generated/prisma/client";

const SOURCE_BASE = "https://schloka.com";
const SOURCE_INDEX = `${SOURCE_BASE}/call-girl`;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type SourceCity = {
  stateName: string;
  stateSlug: string;
  cityName: string;
  citySlug: string;
  url: string;
};

type SourceProfile = {
  sourceUrl: string;
  sourceSlug: string;
  displayName: string;
  age: number;
  title: string;
  overview: string;
  nationality?: string;
  languages: string[];
  services: string[];
  phone?: string;
  whatsapp?: string;
  images: string[];
};

type Options = {
  allCities: boolean;
  locationsOnly: boolean;
  publish: boolean;
  dryRun: boolean;
  maxProfilesPerCity: number;
  maxPagesPerCity: number;
  concurrency: number;
  citySlugs: Set<string>;
  profileUrls: string[];
};

const stateCorrections: Record<string, { name: string; slug: string }> = {
  gujrat: { name: "Gujarat", slug: "gujarat" },
  karnatka: { name: "Karnataka", slug: "karnataka" },
  maharastra: { name: "Maharashtra", slug: "maharashtra" },
  panjab: { name: "Punjab", slug: "punjab" },
  tamilnadu: { name: "Tamil Nadu", slug: "tamil-nadu" },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function clean(value: string, max = 10_000) {
  return value
    .replace(/Schloka/gi, "Ourly Bookings")
    .replace(/\p{Cc}/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function parseOptions(): Options {
  const args = process.argv.slice(2);
  const valueOf = (name: string) => args.find((arg) => arg.startsWith(`${name}=`))?.split("=")[1];
  const citySlugs = new Set((valueOf("--cities") ?? "").split(",").map(slugify).filter(Boolean));
  const profileUrls = (valueOf("--profile-urls") ?? "")
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.startsWith(`${SOURCE_BASE}/call-girl/`));
  return {
    allCities: args.includes("--all-cities"),
    locationsOnly: args.includes("--locations-only"),
    publish: args.includes("--publish"),
    dryRun: args.includes("--dry-run"),
    // Zero means no profile limit. A cap remains available for a small test import.
    maxProfilesPerCity: Math.min(
      2_000,
      Math.max(0, Number(valueOf("--max-profiles-per-city") ?? "0")),
    ),
    // Only public pagination links already present on the source page are followed.
    maxPagesPerCity: Math.min(50, Math.max(1, Number(valueOf("--max-pages-per-city") ?? "10"))),
    concurrency: Math.min(8, Math.max(1, Number(valueOf("--concurrency") ?? "3"))),
    citySlugs,
    profileUrls,
  };
}

async function fetchText(url: string, attempts = 4) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "user-agent": "OurlyAuthorizedMigration/1.0 (+https://ourlybookings.com)",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }
  }
  throw new Error(`Unable to fetch ${url}: ${String(lastError)}`);
}

function parseLocationIndex(html: string) {
  const $ = load(html);
  const cities: SourceCity[] = [];
  $(".state-group").each((_, group) => {
    const rawStateName = clean($(group).find(".state-group__title").first().text(), 100);
    if (!rawStateName) return;
    const rawStateSlug = slugify(rawStateName);
    const correction = stateCorrections[rawStateSlug];
    const stateName = correction?.name ?? rawStateName;
    const stateSlug = correction?.slug ?? rawStateSlug;
    $(group)
      .find("a.location-card")
      .each((__, link) => {
        const href = $(link).attr("href");
        const cityName = clean($(link).find(".location-card__name").text() || $(link).text(), 100);
        if (!href || !cityName) return;
        const url = new URL(href, SOURCE_BASE).toString();
        const citySlug = slugify(
          new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? cityName,
        );
        cities.push({ stateName, stateSlug, cityName, citySlug, url });
      });
  });
  if (!cities.length) throw new Error("Source location index did not contain any city cards");
  return cities;
}

function parseCityProfileUrls(html: string, city: SourceCity, limit: number) {
  const $ = load(html);
  const prefix = `/call-girl/${city.citySlug}/`;
  const urls = new Set<string>();
  $(`a[href^="${prefix}"]`).each((_, link) => {
    const href = $(link).attr("href");
    if (href) urls.add(new URL(href, SOURCE_BASE).toString());
  });
  const values = [...urls];
  return limit > 0 ? values.slice(0, limit) : values;
}

function parseCityListingPageUrls(html: string, city: SourceCity, limit: number) {
  const $ = load(html);
  const cityPath = new URL(city.url).pathname.replace(/\/$/, "");
  const pages = new Map<number, string>([[1, city.url]]);
  $("a[href]").each((_, link) => {
    const href = $(link).attr("href");
    if (!href) return;
    const url = new URL(href, SOURCE_BASE);
    if (url.pathname.replace(/\/$/, "") !== cityPath) return;
    const page = Number(url.searchParams.get("page") ?? "1");
    if (!Number.isInteger(page) || page < 1 || page > 500) return;
    url.hash = "";
    pages.set(page, url.toString());
  });
  return [...pages.entries()]
    .sort(([left], [right]) => left - right)
    .slice(0, limit)
    .map(([, url]) => url);
}

function adaptedProfileCopy(source: SourceProfile, city: SourceCity) {
  const shortIntro = `${source.displayName} is an independent adult advertiser in ${city.cityName}. Availability, contact options and listed services are supplied by the advertiser.`;
  const fullBio = [
    `This Ourly Bookings listing is for ${source.displayName}, age ${source.age}, in ${city.cityName}.`,
    source.nationality ? `Nationality: ${source.nationality}.` : "",
    source.languages.length ? `Languages: ${source.languages.join(", ")}.` : "",
    source.services.length ? `Listed services: ${source.services.join(" · ")}.` : "",
    "Please contact the advertiser directly to confirm availability and preferences.",
  ]
    .filter(Boolean)
    .join(" ");
  return { shortIntro: clean(shortIntro, 500), fullBio: clean(fullBio, 10_000) };
}

function sectionText(html: string, heading: string) {
  const $ = load(html);
  const section = $(".detail-section")
    .filter((_, element) =>
      $(element).find(".detail-section__title, h2").first().text().toLowerCase().includes(heading),
    )
    .first();
  return clean(section.find(".detail-section__text").text() || section.text());
}

function sectionTags(html: string, heading: string) {
  const $ = load(html);
  const section = $(".detail-section")
    .filter((_, element) =>
      $(element).find(".detail-section__title, h2").first().text().toLowerCase().includes(heading),
    )
    .first();
  return section
    .find(".tag-chip")
    .map((_, tag) => clean($(tag).text(), 100))
    .get()
    .filter(Boolean);
}

function parseSourceProfile(html: string, sourceUrl: string, imageLimit = 5): SourceProfile | null {
  const $ = load(html);
  const headerMeta = clean($(".detail-header__meta").first().text(), 500);
  const headerTags = $(".detail-header__meta .detail-header__tag")
    .map((_, tag) => clean($(tag).text(), 100))
    .get();
  const title = clean($(".detail-header__title, h1").first().text(), 500);
  const ageMatch =
    headerTags.find((tag) => /\b\d{2}\s*Years?\b/i.test(tag))?.match(/\b(\d{2})/) ??
    headerMeta.match(/\b(\d{2})\s*Years?\b/i);
  const nameMatch = headerMeta.match(/^(.+?)\s+(\d{2})\s*Years?\b/i);
  const age = Number(ageMatch?.[1]);
  const displayName = clean(headerTags[0] ?? nameMatch?.[1] ?? title.split(/[-|,]/)[0], 100);
  if (!displayName || !Number.isInteger(age) || age < 18 || age > 99) return null;

  const overview = sectionText(html, "overview");
  const services = sectionTags(html, "services");
  const characteristics = sectionTags(html, "characteristics");
  const characteristicText = characteristics.join(" ") || sectionText(html, "characteristics");
  const nationality = clean(
    characteristicText.match(/Nationality:\s*([^:]+?)(?=\s+[A-Z][\w ]+:|$)/i)?.[1] ?? "",
    100,
  );
  const languages = clean(
    characteristicText.match(/Languages?:\s*([^:]+?)(?=\s+[A-Z][\w ]+:|$)/i)?.[1] ?? "",
  )
    .split(/[,/]/)
    .map((language) => clean(language, 50))
    .filter(Boolean);
  const images = new Set<string>();
  $(".gallery img, .gallery__item img, img[alt*='advert' i]").each((_, image) => {
    const raw = $(image).attr("src") || $(image).attr("data-src");
    if (!raw) return;
    const url = new URL(raw, SOURCE_BASE);
    if (url.protocol === "https:" && url.hostname === "cdn.schloka.com") images.add(url.toString());
  });
  const phoneHref = $("a[href^='tel:']").first().attr("href");
  const whatsappHref = $("a[href*='wa.me/']").first().attr("href");
  const pageContact = clean(
    `${$("title").text()} ${$("meta[name='description']").attr("content") ?? ""}`,
  )
    .match(/(?<!\d)(?:\+91[- ]?)?([6-9]\d{9})(?!\d)/)?.[0]
    .replace(/[- ]/g, "");
  const phone = phoneHref?.replace(/^tel:/, "").replace(/[^+\d]/g, "") || pageContact;
  const whatsapp = whatsappHref?.match(/wa\.me\/(\d+)/)?.[1] || pageContact?.replace(/^\+/, "");
  const sourceSlug = slugify(
    new URL(sourceUrl).pathname.split("/").filter(Boolean).at(-1) ?? title,
  );
  if (!overview || !sourceSlug || !images.size) return null;
  return {
    sourceUrl,
    sourceSlug,
    displayName,
    age,
    title,
    overview,
    nationality: nationality || undefined,
    languages,
    services,
    phone: phone || undefined,
    whatsapp: whatsapp || undefined,
    images: [...images].slice(0, imageLimit),
  };
}

async function syncLocations(cities: SourceCity[], dryRun: boolean) {
  if (dryRun) return new Map<string, string>();
  const india = await prisma.country.upsert({
    where: { code: "IN" },
    update: { name: "India", slug: "india" },
    create: { code: "IN", name: "India", slug: "india" },
  });
  const grouped = new Map<string, SourceCity[]>();
  for (const city of cities) {
    const stateCities = grouped.get(city.stateSlug) ?? [];
    stateCities.push(city);
    grouped.set(city.stateSlug, stateCities);
  }
  for (const [stateSlug, stateCities] of grouped) {
    const stateName = stateCities[0].stateName;
    const state = await prisma.state.upsert({
      where: { countryId_slug: { countryId: india.id, slug: stateSlug } },
      update: { name: stateName, isPublished: true },
      create: {
        countryId: india.id,
        name: stateName,
        slug: stateSlug,
        type: ["delhi", "chandigarh", "lakshadweep"].includes(stateSlug)
          ? "Union territory"
          : "State",
        description: `Browse Ourly Bookings listings across ${stateName}.`,
        isPublished: true,
      },
    });
    await prisma.city.createMany({
      data: stateCities.map((city) => ({
        stateId: state.id,
        name: city.cityName,
        slug: city.citySlug,
        description: `Browse independent adult listings in ${city.cityName}, ${stateName}.`,
        isPublished: true,
      })),
      skipDuplicates: true,
    });
    await prisma.city.updateMany({
      where: { stateId: state.id, slug: { in: stateCities.map((city) => city.citySlug) } },
      data: { isPublished: true },
    });
  }
  for (const [legacySlug, correction] of Object.entries(stateCorrections)) {
    if (legacySlug === correction.slug) continue;
    const [legacyState, targetState] = await Promise.all([
      prisma.state.findUnique({
        where: { countryId_slug: { countryId: india.id, slug: legacySlug } },
        include: { cities: true },
      }),
      prisma.state.findUnique({
        where: { countryId_slug: { countryId: india.id, slug: correction.slug } },
      }),
    ]);
    if (!legacyState || !targetState) continue;
    for (const legacyCity of legacyState.cities) {
      const targetCity = await prisma.city.findUnique({
        where: { stateId_slug: { stateId: targetState.id, slug: legacyCity.slug } },
      });
      if (targetCity) {
        const attachedProfiles = await prisma.profileLocation.count({
          where: { cityId: legacyCity.id },
        });
        const attachedLeads = await prisma.lead.count({ where: { cityId: legacyCity.id } });
        if (!attachedProfiles && !attachedLeads) {
          await prisma.city.delete({ where: { id: legacyCity.id } });
        }
      } else {
        await prisma.city.update({
          where: { id: legacyCity.id },
          data: { stateId: targetState.id },
        });
      }
    }
    const remainingCities = await prisma.city.count({ where: { stateId: legacyState.id } });
    if (!remainingCities) await prisma.state.delete({ where: { id: legacyState.id } });
  }
  const rows = await prisma.city.findMany({
    where: { state: { countryId: india.id } },
    select: { id: true, slug: true, state: { select: { slug: true } } },
  });
  return new Map(rows.map((city) => [`${city.state.slug}/${city.slug}`, city.id]));
}

async function saveProfile(
  source: SourceProfile,
  city: SourceCity,
  cityId: string,
  publish: boolean,
) {
  const profileSlug = `${city.citySlug}-${source.sourceSlug}`.slice(0, 240);
  const { shortIntro, fullBio } = adaptedProfileCopy(source, city);
  const category = await prisma.category.upsert({
    where: { slug: "independent" },
    update: { isPublished: true },
    create: {
      name: "Independent",
      slug: "independent",
      description: "Independent adult advertising category.",
      isPublished: true,
    },
  });
  const serviceRows = await Promise.all(
    source.services.map((name, sortOrder) =>
      prisma.service.upsert({
        where: { slug: slugify(name) },
        update: { name, isPublished: true },
        create: {
          name,
          slug: slugify(name),
          description: `${name} availability provided by the advertiser.`,
          sortOrder,
          isPublished: true,
        },
      }),
    ),
  );

  return prisma.$transaction(async (transaction) => {
    const now = new Date();
    const profile = await transaction.profile.upsert({
      where: { slug: profileSlug },
      update: {
        displayName: source.displayName,
        age: source.age,
        nationality: source.nationality,
        languages: source.languages,
        shortIntro,
        fullBio,
        contactPhone: source.phone,
        contactWhatsapp: source.whatsapp,
        verificationStatus: "VERIFIED",
        status: publish ? "PUBLISHED" : "DRAFT",
        publishedAt: publish ? now : null,
        deletedAt: null,
      },
      create: {
        displayName: source.displayName,
        slug: profileSlug,
        age: source.age,
        nationality: source.nationality,
        languages: source.languages,
        shortIntro,
        fullBio,
        contactPhone: source.phone,
        contactWhatsapp: source.whatsapp,
        verificationStatus: "VERIFIED",
        status: publish ? "PUBLISHED" : "DRAFT",
        publishedAt: publish ? now : null,
      },
    });
    await transaction.profileLocation.deleteMany({
      where: { profileId: profile.id, isPrimary: true },
    });
    await transaction.profileLocation.upsert({
      where: { profileId_cityId: { profileId: profile.id, cityId } },
      update: { isPrimary: true },
      create: { profileId: profile.id, cityId, isPrimary: true },
    });
    await transaction.profileCategory.upsert({
      where: { profileId_categoryId: { profileId: profile.id, categoryId: category.id } },
      update: {},
      create: { profileId: profile.id, categoryId: category.id },
    });
    for (const service of serviceRows) {
      await transaction.profileService.upsert({
        where: { profileId_serviceId: { profileId: profile.id, serviceId: service.id } },
        update: {},
        create: { profileId: profile.id, serviceId: service.id },
      });
    }
    await transaction.verificationRecord.upsert({
      where: { profileId: profile.id },
      update: {
        status: "VERIFIED",
        adultConfirmed: true,
        documentType: "AUTHORIZED_SOURCE_MIGRATION",
        documentRef: source.sourceUrl,
        verifiedAt: now,
        privateNotes:
          "Age was parsed from the owner-authorized source record; retain source evidence.",
      },
      create: {
        profileId: profile.id,
        status: "VERIFIED",
        adultConfirmed: true,
        documentType: "AUTHORIZED_SOURCE_MIGRATION",
        documentRef: source.sourceUrl,
        verifiedAt: now,
        privateNotes:
          "Age was parsed from the owner-authorized source record; retain source evidence.",
      },
    });
    const activeConsent = await transaction.consentRecord.findFirst({
      where: { profileId: profile.id, consentType: "PUBLICATION", revokedAt: null },
    });
    if (!activeConsent) {
      await transaction.consentRecord.create({
        data: {
          profileId: profile.id,
          consentType: "PUBLICATION",
          evidenceRef: source.sourceUrl,
          grantedAt: now,
          privateNotes: "Owner-authorized migration from the supplied source website.",
        },
      });
    }
    await transaction.profileMedia.deleteMany({
      where: {
        profileId: profile.id,
        media: { cloudinaryPublicId: { startsWith: "source:schloka:" } },
      },
    });
    for (const [sortOrder, secureUrl] of source.images.entries()) {
      const digest = createHash("sha256").update(secureUrl).digest("hex");
      const format =
        new URL(secureUrl).pathname.split(".").at(-1)?.toLowerCase().slice(0, 10) || "jpg";
      const media = await transaction.mediaAsset.upsert({
        where: { cloudinaryPublicId: `source:schloka:${digest}` },
        update: {
          secureUrl,
          altText: `${source.displayName} in ${city.cityName} — image ${sortOrder + 1}`,
          title: `${source.displayName} gallery image ${sortOrder + 1}`,
          description: `Authorized source: ${source.sourceUrl}`,
          usageStatus: "ACTIVE",
          deletedAt: null,
        },
        create: {
          cloudinaryPublicId: `source:schloka:${digest}`,
          secureUrl,
          resourceType: "IMAGE",
          format,
          bytes: 0,
          folder: "imports/schloka",
          altText: `${source.displayName} in ${city.cityName} — image ${sortOrder + 1}`,
          title: `${source.displayName} gallery image ${sortOrder + 1}`,
          description: `Authorized source: ${source.sourceUrl}`,
          tags: ["authorized-source", "schloka", city.stateSlug, city.citySlug],
        },
      });
      await transaction.profileMedia.upsert({
        where: { profileId_mediaId: { profileId: profile.id, mediaId: media.id } },
        update: { role: sortOrder === 0 ? "COVER" : "GALLERY", sortOrder },
        create: {
          profileId: profile.id,
          mediaId: media.id,
          role: sortOrder === 0 ? "COVER" : "GALLERY",
          sortOrder,
        },
      });
    }
    await transaction.seoMeta.upsert({
      where: { entityType_entityId: { entityType: "PROFILE", entityId: profile.id } },
      update: {
        seoTitle: `${source.displayName}, ${source.age} in ${city.cityName} | Ourly Bookings`,
        metaDescription: shortIntro.slice(0, 300),
        canonicalUrl: `/profiles/${profile.slug}`,
      },
      create: {
        entityType: "PROFILE",
        entityId: profile.id,
        seoTitle: `${source.displayName}, ${source.age} in ${city.cityName} | Ourly Bookings`,
        metaDescription: shortIntro.slice(0, 300),
        canonicalUrl: `/profiles/${profile.slug}`,
        schemaType: "Person",
      },
    });
    return profile;
  });
}

async function mapWithConcurrency<T>(
  values: T[],
  concurrency: number,
  worker: (value: T, index: number) => Promise<void>,
) {
  let nextIndex = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, async () => {
      while (nextIndex < values.length) {
        const index = nextIndex;
        nextIndex += 1;
        await worker(values[index], index);
      }
    }),
  );
}

async function main() {
  const options = parseOptions();
  if (
    !options.allCities &&
    !options.citySlugs.size &&
    !options.profileUrls.length &&
    !options.locationsOnly
  ) {
    throw new Error(
      "Choose --all-cities, --cities=mumbai,delhi, --profile-urls=https://..., or --locations-only",
    );
  }
  if (process.env.SCHLOKA_IMPORT_AUTHORIZED !== "true") {
    throw new Error(
      "Set SCHLOKA_IMPORT_AUTHORIZED=true only after confirming ownership, publication rights and adult consent.",
    );
  }
  if (options.publish && process.env.SCHLOKA_IMPORT_PUBLISH_CONFIRMED !== "true") {
    throw new Error("Publishing requires SCHLOKA_IMPORT_PUBLISH_CONFIRMED=true");
  }

  console.info(`Fetching authorized source index: ${SOURCE_INDEX}`);
  const cities = parseLocationIndex(await fetchText(SOURCE_INDEX));
  const cityIds = await syncLocations(cities, options.dryRun);
  console.info(
    `Locations ready: ${new Set(cities.map((city) => city.stateSlug)).size} states, ${cities.length} cities`,
  );
  if (options.locationsOnly || options.dryRun) return;

  let imported = 0;
  let skipped = 0;
  if (options.profileUrls.length) {
    for (const seedUrl of options.profileUrls) {
      const citySlug = slugify(new URL(seedUrl).pathname.split("/").filter(Boolean)[1] ?? "");
      const city = cities.find((candidate) => candidate.citySlug === citySlug);
      if (!city) {
        skipped += 1;
        console.warn(`Direct profile skipped; city not found for ${seedUrl}`);
        continue;
      }
      try {
        const seedHtml = await fetchText(seedUrl);
        const relatedUrls = parseCityProfileUrls(seedHtml, city, options.maxProfilesPerCity);
        const profileUrls = [seedUrl, ...relatedUrls.filter((url) => url !== seedUrl)];
        if (options.maxProfilesPerCity > 0) {
          profileUrls.splice(options.maxProfilesPerCity);
        }
        for (const profileUrl of profileUrls) {
          const parsed = parseSourceProfile(
            profileUrl === seedUrl ? seedHtml : await fetchText(profileUrl),
            profileUrl,
            5,
          );
          const cityId = cityIds.get(`${city.stateSlug}/${city.citySlug}`);
          if (!parsed || !cityId) {
            skipped += 1;
            continue;
          }
          await saveProfile(parsed, city, cityId, options.publish);
          imported += 1;
        }
      } catch (error) {
        skipped += 1;
        console.warn(`Direct profile skipped ${seedUrl}: ${String(error)}`);
      }
    }
    console.info(`Direct import complete. Profiles imported: ${imported}. Skipped: ${skipped}.`);
    if (!options.allCities && !options.citySlugs.size) return;
  }

  const selected = options.allCities
    ? cities
    : cities.filter((city) => options.citySlugs.has(city.citySlug));
  await mapWithConcurrency(selected, options.concurrency, async (city, index) => {
    try {
      const firstListingHtml = await fetchText(city.url);
      const listingPages = parseCityListingPageUrls(
        firstListingHtml,
        city,
        options.maxPagesPerCity,
      );
      const profileUrls = new Set(
        parseCityProfileUrls(firstListingHtml, city, options.maxProfilesPerCity),
      );
      for (const listingPage of listingPages.filter((url) => url !== city.url)) {
        const listingHtml = await fetchText(listingPage);
        for (const profileUrl of parseCityProfileUrls(listingHtml, city, options.maxProfilesPerCity)) {
          profileUrls.add(profileUrl);
          if (options.maxProfilesPerCity > 0 && profileUrls.size >= options.maxProfilesPerCity) break;
        }
        if (options.maxProfilesPerCity > 0 && profileUrls.size >= options.maxProfilesPerCity) break;
      }
      for (const profileUrl of profileUrls) {
        try {
          const parsed = parseSourceProfile(await fetchText(profileUrl), profileUrl, 5);
          const cityId = cityIds.get(`${city.stateSlug}/${city.citySlug}`);
          if (!parsed || !cityId) {
            skipped += 1;
            continue;
          }
          await saveProfile(parsed, city, cityId, options.publish);
          imported += 1;
        } catch (error) {
          skipped += 1;
          console.warn(`Profile skipped ${profileUrl}: ${String(error)}`);
        }
      }
    } catch (error) {
      skipped += 1;
      console.warn(`City skipped ${city.citySlug}: ${String(error)}`);
    }
    if ((index + 1) % 20 === 0 || index + 1 === selected.length) {
      console.info(
        `Progress ${index + 1}/${selected.length}; imported ${imported}; skipped ${skipped}`,
      );
    }
  });
  console.info(`Import complete. Profiles imported: ${imported}. Skipped: ${skipped}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
