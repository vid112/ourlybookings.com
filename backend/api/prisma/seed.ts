import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "argon2";
import { PrismaClient } from "../src/generated/prisma/client";

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

const seedLocations = [
  ["Maharashtra", "maharashtra", ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Navi Mumbai"]],
  ["Karnataka", "karnataka", ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"]],
  ["Delhi", "delhi", ["New Delhi", "South Delhi", "Dwarka", "Rohini", "Saket"]],
  ["Tamil Nadu", "tamil-nadu", ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"]],
  ["Telangana", "telangana", ["Hyderabad", "Secunderabad", "Warangal"]],
  ["Goa", "goa", ["Panaji", "North Goa", "South Goa"]],
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
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

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.test";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe-Local-Only-2026!";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {},
    create: {
      email: adminEmail.toLowerCase(),
      displayName: "Local Super Admin",
      passwordHash: await hash(adminPassword),
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: superAdminRole.id },
  });

  const india = await prisma.country.upsert({
    where: { code: "IN" },
    update: {},
    create: { name: "India", code: "IN", slug: "india" },
  });

  for (const [stateName, stateSlug, cityNames] of seedLocations) {
    const state = await prisma.state.upsert({
      where: { countryId_slug: { countryId: india.id, slug: stateSlug } },
      update: { isPublished: true },
      create: {
        countryId: india.id,
        name: stateName,
        slug: stateSlug,
        type: stateName === "Delhi" ? "Union territory" : "State",
        isPublished: true,
      },
    });
    for (const cityName of cityNames) {
      await prisma.city.upsert({
        where: { stateId_slug: { stateId: state.id, slug: slugify(cityName) } },
        update: { isPublished: true },
        create: { stateId: state.id, name: cityName, slug: slugify(cityName), isPublished: true },
      });
    }
  }

  for (const [index, categoryName] of [
    "Independent",
    "Model",
    "VIP",
    "College",
    "Massage",
  ].entries()) {
    await prisma.category.upsert({
      where: { slug: slugify(categoryName) },
      update: {},
      create: {
        name: categoryName,
        slug: slugify(categoryName),
        description: `${categoryName} adult advertising category.`,
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

  console.info(
    `Seed complete. Development admin: ${adminEmail}. Override SEED_ADMIN_PASSWORD before shared use.`,
  );
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
