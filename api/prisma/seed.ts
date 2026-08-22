import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "argon2";
import { PrismaClient } from "../src/generated/prisma/client";
import { getIndiaLocations } from "./india-locations";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required for seeding");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const permissions = [
  "dashboard.read",
  "profiles.read",
  "profiles.write",
  "profiles.publish",
  "media.write",
  "seo.write",
  "locations.write",
  "leads.read",
  "analytics.read",
  "reports.manage",
  "users.manage",
  "settings.manage",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function internationalCountries() {
  const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
  return ISO_COUNTRY_CODES.map((code) => ({ code, name: displayNames.of(code) ?? code })).sort(
    (left, right) => left.name.localeCompare(right.name),
  );
}

const ISO_COUNTRY_CODES = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ
BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP
KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY
MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY
QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ
VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(/\s+/);

async function main() {
  await prisma.city.deleteMany({
    where: { state: { country: { code: { notIn: ISO_COUNTRY_CODES } } } },
  });
  await prisma.state.deleteMany({ where: { country: { code: { notIn: ISO_COUNTRY_CODES } } } });
  await prisma.country.deleteMany({ where: { code: { notIn: ISO_COUNTRY_CODES } } });

  const permissionRows = await Promise.all(
    permissions.map((key) =>
      prisma.permission.upsert({ where: { key }, update: {}, create: { key } }),
    ),
  );

  for (const name of [
    "Super Admin",
    "Admin",
    "SEO Manager",
    "Content Editor",
    "Media Manager",
    "Analyst",
    "Advertiser",
  ]) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }
  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: "Super Admin" } });
  await Promise.all(
    permissionRows.map((permission) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: permission.id } },
        update: {},
        create: { roleId: superAdminRole.id, permissionId: permission.id },
      }),
    ),
  );

  const configuredAdminEmail = process.env.SEED_ADMIN_EMAIL;
  const configuredAdminPassword = process.env.SEED_ADMIN_PASSWORD;
  const shouldCreateDevelopmentAdmin = process.env.NODE_ENV !== "production";
  const adminEmail = configuredAdminEmail ??
    (shouldCreateDevelopmentAdmin ? "admin@example.test" : undefined);
  const adminPassword = configuredAdminPassword ??
    (shouldCreateDevelopmentAdmin ? "ChangeMe-Local-Only-2026!" : undefined);

  if (adminEmail && adminPassword) {
    const admin = await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {},
      create: {
        email: adminEmail.toLowerCase(),
        displayName: "Super Admin",
        passwordHash: await hash(adminPassword),
      },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: superAdminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: superAdminRole.id },
    });
  } else {
    console.warn(
      "Production admin was not seeded. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one.",
    );
  }

  const india = await prisma.country.upsert({
    where: { code: "IN" },
    update: {},
    create: { name: "India", code: "IN", slug: "india" },
  });

  for (const location of getIndiaLocations()) {
    const state = await prisma.state.upsert({
      where: { countryId_slug: { countryId: india.id, slug: location.slug } },
      update: { name: location.name, type: location.type, isPublished: true },
      create: {
        countryId: india.id,
        name: location.name,
        slug: location.slug,
        type: location.type,
        isPublished: true,
      },
    });

    await prisma.city.createMany({
      data: location.cities.map((city) => ({
        stateId: state.id,
        name: city.name,
        slug: city.slug,
        latitude: city.latitude,
        longitude: city.longitude,
        isPublished: true,
      })),
      skipDuplicates: true,
    });
    await prisma.city.updateMany({
      where: { stateId: state.id, slug: { in: location.cities.map((city) => city.slug) } },
      data: { isPublished: true },
    });
  }

  for (const entry of internationalCountries()) {
    if (entry.code === "IN") continue;
    const country = await prisma.country.upsert({
      where: { code: entry.code },
      update: { name: entry.name },
      create: {
        name: entry.name,
        code: entry.code,
        slug: `${slugify(entry.name)}-${entry.code.toLowerCase()}`,
      },
    });
    const state = await prisma.state.upsert({
      where: { countryId_slug: { countryId: country.id, slug: "all-regions" } },
      update: { name: "All Regions", isPublished: true },
      create: {
        countryId: country.id,
        name: "All Regions",
        slug: "all-regions",
        type: "Region",
        description: `Nationwide listings across ${entry.name}.`,
        isPublished: true,
      },
    });
    await prisma.city.upsert({
      where: { stateId_slug: { stateId: state.id, slug: "all-cities" } },
      update: { name: "All Cities", isPublished: true },
      create: {
        stateId: state.id,
        name: "All Cities",
        slug: "all-cities",
        description: `Listings available across ${entry.name}.`,
        isPublished: true,
      },
    });
  }

  const allCities = await prisma.city.findMany({ select: { id: true, name: true } });
  const areaBatchSize = 500;
  for (let index = 0; index < allCities.length; index += areaBatchSize) {
    const cityBatch = allCities.slice(index, index + areaBatchSize);
    await prisma.area.createMany({
      data: cityBatch.map((city) => ({
        cityId: city.id,
        name: "All Areas",
        slug: "all-areas",
        description: `Listings across all areas of ${city.name}.`,
        isPublished: true,
      })),
      skipDuplicates: true,
    });
  }
  await prisma.area.updateMany({
    where: { cityId: { in: allCities.map((city) => city.id) }, slug: "all-areas" },
    data: { name: "All Areas", isPublished: true },
  });

  const publicCategories = [
    {
      name: "Call Girls Service",
      description: "Browse independently managed adult listings by country, region and city.",
    },
    {
      name: "Gigolo Services",
      description: "Discover independently managed male companion listings by location.",
    },
    {
      name: "Massage Service Men",
      description: "Explore male massage-service advertisements published by independent adults.",
    },
    {
      name: "Girls Massage Services",
      description: "Browse independent women-led massage-service advertisements by city.",
    },
    {
      name: "Escort Services",
      description: "Find independently managed adult companion advertisements worldwide.",
    },
  ];
  await prisma.category.updateMany({
    where: { slug: { notIn: publicCategories.map((category) => slugify(category.name)) } },
    data: { isPublished: false },
  });
  for (const [index, category] of publicCategories.entries()) {
    await prisma.category.upsert({
      where: { slug: slugify(category.name) },
      update: {
        name: category.name,
        description: category.description,
        sortOrder: index,
        isPublished: true,
      },
      create: {
        name: category.name,
        slug: slugify(category.name),
        description: category.description,
        sortOrder: index,
        isPublished: true,
      },
    });
  }

  const publicServices = [
    "GFE",
    "Dinner Date",
    "Overnight",
    "Travel",
    "BDSM",
    "Massage",
    "Role Play",
    "Striptease",
    "Video Call",
  ];
  for (const [index, name] of publicServices.entries()) {
    await prisma.service.upsert({
      where: { slug: slugify(name) },
      update: { name, sortOrder: index, isPublished: true },
      create: {
        name,
        slug: slugify(name),
        description: `${name} option selected by an independent advertiser.`,
        sortOrder: index,
        isPublished: true,
      },
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: "brand" },
    update: {},
    create: {
      key: "brand",
      isPublic: true,
      value: { name: "Ourly Bookings", country: "India", demoMode: true },
    },
  });

  console.info(`Seed complete.${adminEmail ? ` Admin: ${adminEmail}.` : ""}`);
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
