import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Prisma } from "../../generated/prisma/client";
import { EntityType } from "../../generated/prisma/enums";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthGuard } from "../auth/auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import type { AuthenticatedRequest } from "../auth/auth.types";
import {
  CreateCityDto,
  UpdateCityDto,
  UpdateLeadDto,
  UpdateMediaDto,
  UpdateReportDto,
  UpdateSeoDto,
  UpdateSettingDto,
  UpdateCategoryDto,
  ModerateProfileDto,
  RankProfileDto,
  VerifyPaymentDto,
} from "./dto/admin.dto";
import { CreateProfileDto, UpdateProfileDto } from "./dto/profile.dto";

type UploadedCategoryImage = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

@ApiTags("admin")
@ApiCookieAuth("ourly_access")
@UseGuards(AuthGuard, RolesGuard)
@Roles("Super Admin", "Admin", "Content Editor")
@Controller("admin")
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("dashboard")
  async dashboard() {
    const [users, profiles, publishedProfiles, leads, reports, events, cities, media] =
      await Promise.all([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.profile.count({ where: { deletedAt: null } }),
        this.prisma.profile.count({ where: { status: "PUBLISHED", deletedAt: null } }),
        this.prisma.lead.count({ where: { status: "NEW", deletedAt: null } }),
        this.prisma.contentReport.count({ where: { status: { in: ["OPEN", "TRIAGED"] } } }),
        this.prisma.analyticsEvent.count({
          where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        }),
        this.prisma.city.count({ where: { isPublished: true } }),
        this.prisma.mediaAsset.count({ where: { deletedAt: null } }),
      ]);
    return {
      users,
      profiles,
      publishedProfiles,
      newLeads: leads,
      openReports: reports,
      eventsLast24Hours: events,
      publishedCities: cities,
      media,
    };
  }

  @Get("users")
  users() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        displayName: true,
        email: true,
        mobile: true,
        emailVerifiedAt: true,
        mobileVerifiedAt: true,
        accountStatus: true,
        isActive: true,
        credits: true,
        lastLoginAt: true,
        createdAt: true,
        roles: { select: { role: { select: { name: true } } } },
        profiles: {
          where: { deletedAt: null },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            displayName: true,
            slug: true,
            status: true,
            moderationStatus: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
      },
    });
  }

  @Get("categories")
  categories() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        imageUrl: true,
        sortOrder: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  @Patch("categories/:id")
  updateCategory(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  @Post("categories/:id/image")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 8 * 1024 * 1024, files: 1 },
      fileFilter: (_request, file, callback) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        callback(
          allowed.includes(file.mimetype)
            ? null
            : new BadRequestException("Only JPG, PNG and WebP images are allowed"),
          allowed.includes(file.mimetype),
        );
      },
    }),
  )
  async uploadCategoryImage(
    @Param("id") id: string,
    @UploadedFile() file: UploadedCategoryImage | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!file) throw new BadRequestException("Select an image to upload");
    const category = await this.prisma.category.findUniqueOrThrow({ where: { id } });
    const forwardedProtocol = request.headers["x-forwarded-proto"];
    const protocol =
      typeof forwardedProtocol === "string"
        ? forwardedProtocol.split(",")[0]?.trim()
        : request.protocol;
    const version = Date.now();
    const imageUrl = `${protocol}://${request.get("host")}/api/v1/public/categories/${category.slug}/image?v=${version}`;
    return this.prisma.category.update({
      where: { id },
      data: {
        imageData: new Uint8Array(file.buffer),
        imageMimeType: file.mimetype,
        imageUrl,
      },
      select: { id: true, imageUrl: true, updatedAt: true },
    });
  }

  @Get("profiles")
  profiles() {
    return this.prisma.profile.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        verification: { select: { status: true, adultConfirmed: true, verifiedAt: true } },
        categories: { include: { category: { select: { id: true, name: true } } } },
        media: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          include: { media: { select: { secureUrl: true, altText: true } } },
        },
        locations: { where: { isPrimary: true }, include: { city: { include: { state: true } } } },
        owner: { select: { id: true, email: true, displayName: true } },
      },
    });
  }

  @Post("profiles")
  async createProfile(@Body() dto: CreateProfileDto) {
    const { cityId, categoryIds, ...profileData } = dto;
    return this.prisma.$transaction(async (transaction) => {
      const profile = await transaction.profile.create({
        data: { ...profileData, slug: normalizeSlug(dto.slug), status: "DRAFT" },
      });
      if (cityId) {
        await transaction.profileLocation.create({
          data: { profileId: profile.id, cityId, isPrimary: true },
        });
      }
      if (categoryIds?.length) {
        await transaction.profileCategory.createMany({
          data: [...new Set(categoryIds)].map((categoryId) => ({
            profileId: profile.id,
            categoryId,
          })),
          skipDuplicates: true,
        });
      }
      return profile;
    });
  }

  @Patch("profiles/:id")
  async updateProfile(@Param("id") id: string, @Body() dto: UpdateProfileDto) {
    if (dto.status === "PUBLISHED") {
      throw new BadRequestException("Use the publish action so verification checks are enforced");
    }
    const { cityId, categoryIds, ...profileData } = dto;
    return this.prisma.$transaction(async (transaction) => {
      const profile = await transaction.profile.update({
        where: { id },
        data: {
          ...profileData,
          ...(profileData.slug ? { slug: normalizeSlug(profileData.slug) } : {}),
          ...(profileData.status === "ARCHIVED" ? { publishedAt: null } : {}),
        },
      });
      if (cityId) {
        await transaction.profileLocation.deleteMany({ where: { profileId: id, isPrimary: true } });
        await transaction.profileLocation.upsert({
          where: { profileId_cityId: { profileId: id, cityId } },
          update: { isPrimary: true },
          create: { profileId: id, cityId, isPrimary: true },
        });
      }
      if (categoryIds) {
        await transaction.profileCategory.deleteMany({ where: { profileId: id } });
        if (categoryIds.length) {
          await transaction.profileCategory.createMany({
            data: [...new Set(categoryIds)].map((categoryId) => ({ profileId: id, categoryId })),
            skipDuplicates: true,
          });
        }
      }
      return profile;
    });
  }

  @Post("profiles/:id/publish")
  async publishProfile(@Param("id") id: string) {
    const profile = await this.prisma.profile.findUniqueOrThrow({
      where: { id },
      include: { verification: true, consents: true, media: true, locations: true },
    });
    const publicationConsent = profile.consents.some(
      (consent) => consent.consentType === "PUBLICATION" && !consent.revokedAt,
    );
    if (profile.verification?.status !== "VERIFIED" || !profile.verification.adultConfirmed)
      throw new BadRequestException("Adult verification must be approved before publication");
    if (!publicationConsent)
      throw new BadRequestException("Active publication consent is required");
    if (!profile.media.length)
      throw new BadRequestException("At least one licensed media asset is required");
    if (!profile.locations.length)
      throw new BadRequestException("At least one location is required");
    if (profile.submittedAt && profile.moderationStatus !== "APPROVED")
      throw new BadRequestException("Submitted advertisements must use the approval action");
    if (profile.promotionPlan && profile.paymentStatus !== "PAID")
      throw new BadRequestException("Verify the promotion payment before publication");
    return this.prisma.profile.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  }

  @Post("profiles/:id/moderate")
  async moderateProfile(
    @Param("id") id: string,
    @Body() dto: ModerateProfileDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const profile = await this.prisma.profile.findUniqueOrThrow({
      where: { id },
      include: { media: true, locations: true },
    });
    if (dto.decision === "APPROVED") {
      if (!profile.media.length) throw new BadRequestException("At least one image is required");
      if (!profile.locations.length) throw new BadRequestException("A primary city is required");
      if (profile.promotionPlan && profile.paymentStatus !== "PAID") {
        throw new BadRequestException("Verify the promotion payment before approval");
      }
      const promotionStartsAt = profile.promotionPlan ? promotionStart() : null;
      const promotionEndsAt = promotionStartsAt ? promotionEnd(promotionStartsAt) : null;
      await this.prisma.$transaction([
        this.prisma.verificationRecord.upsert({
          where: { profileId: id },
          update: {
            status: "VERIFIED",
            adultConfirmed: true,
            verifiedAt: new Date(),
            reviewedById: request.user.id,
            privateNotes: dto.message,
          },
          create: {
            profileId: id,
            status: "VERIFIED",
            adultConfirmed: true,
            verifiedAt: new Date(),
            reviewedById: request.user.id,
            privateNotes: dto.message,
          },
        }),
        this.prisma.consentRecord.create({
          data: {
            profileId: id,
            consentType: "PUBLICATION",
            evidenceRef: "advertiser-self-attestation",
            grantedAt: profile.submittedAt ?? new Date(),
            reviewedById: request.user.id,
          },
        }),
        this.prisma.profile.update({
          where: { id },
          data: {
            moderationStatus: "APPROVED",
            verificationStatus: "VERIFIED",
            paymentStatus: profile.promotionPlan
              ? profile.paymentStatus
              : (dto.paymentStatus ?? "NOT_REQUIRED"),
            moderationMessage: dto.message ?? "Approved by administrator",
            status: "PUBLISHED",
            publishedAt: new Date(),
            promotionStartsAt,
            promotionEndsAt,
          },
        }),
      ]);
    } else {
      await this.prisma.profile.update({
        where: { id },
        data: {
          moderationStatus: dto.decision,
          paymentStatus:
            dto.paymentStatus ?? (dto.decision === "REJECTED" ? "PENDING" : profile.paymentStatus),
          moderationMessage:
            dto.message ??
            (dto.decision === "REJECTED"
              ? "Payment or verification is pending. Contact support for assistance."
              : "Please update the requested details."),
          status: "DRAFT",
          publishedAt: null,
        },
      });
    }
    return this.prisma.profile.findUniqueOrThrow({ where: { id } });
  }

  @Post("profiles/:id/payment")
  async verifyPayment(
    @Param("id") id: string,
    @Body() dto: VerifyPaymentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const profile = await this.prisma.profile.findUniqueOrThrow({ where: { id } });
    if (!profile.promotionPlan || !profile.paymentProofUrl) {
      throw new BadRequestException("Payment plan and proof are required");
    }
    return this.prisma.profile.update({
      where: { id },
      data: {
        paymentStatus: dto.status,
        paymentVerifiedAt: dto.status === "PAID" ? new Date() : null,
        paymentVerifiedById: dto.status === "PAID" ? request.user.id : null,
        moderationMessage:
          dto.message ??
          (dto.status === "PAID"
            ? "Payment verified. Advertisement is ready for content approval."
            : "Payment proof could not be verified. Upload a valid screenshot."),
      },
    });
  }

  @Patch("profiles/:id/rank")
  rankProfile(@Param("id") id: string, @Body() dto: RankProfileDto) {
    return this.prisma.profile.update({ where: { id }, data: dto });
  }

  @Delete("profiles/:id")
  async deleteProfile(@Param("id") id: string) {
    await this.prisma.profile.update({
      where: { id },
      data: { deletedAt: new Date(), status: "ARCHIVED", publishedAt: null },
    });
    return { deleted: true };
  }

  @Get("media")
  media() {
    return this.prisma.mediaAsset.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 300,
      include: {
        profiles: {
          take: 5,
          include: { profile: { select: { id: true, displayName: true, slug: true } } },
        },
        _count: { select: { profiles: true } },
      },
    });
  }

  @Patch("media/:id")
  updateMedia(@Param("id") id: string, @Body() dto: UpdateMediaDto) {
    return this.prisma.mediaAsset.update({ where: { id }, data: dto });
  }

  @Delete("media/:id")
  async deleteMedia(@Param("id") id: string) {
    const activeUsages = await this.prisma.profileMedia.count({ where: { mediaId: id } });
    if (activeUsages) {
      throw new BadRequestException(`Media is attached to ${activeUsages} profile(s)`);
    }
    await this.prisma.mediaAsset.update({
      where: { id },
      data: { deletedAt: new Date(), usageStatus: "ARCHIVED" },
    });
    return { deleted: true };
  }

  @Get("locations")
  locations() {
    return this.prisma.state.findMany({
      orderBy: { name: "asc" },
      include: {
        country: { select: { name: true, code: true } },
        cities: {
          orderBy: { name: "asc" },
          include: { _count: { select: { profiles: true } } },
        },
      },
    });
  }

  @Post("locations/cities")
  createCity(@Body() dto: CreateCityDto) {
    return this.prisma.city.create({
      data: {
        ...dto,
        slug: normalizeSlug(dto.slug || dto.name),
        isPublished: dto.isPublished ?? false,
      },
    });
  }

  @Patch("locations/cities/:id")
  updateCity(@Param("id") id: string, @Body() dto: UpdateCityDto) {
    return this.prisma.city.update({
      where: { id },
      data: { ...dto, ...(dto.slug ? { slug: normalizeSlug(dto.slug) } : {}) },
    });
  }

  @Get("seo")
  async seo() {
    const [metadata, missingAlt, redirects] = await Promise.all([
      this.prisma.seoMeta.findMany({ orderBy: { updatedAt: "desc" }, take: 300 }),
      this.prisma.mediaAsset.findMany({
        where: {
          deletedAt: null,
          OR: [{ altText: "" }, { altText: { equals: "image", mode: "insensitive" } }],
        },
        select: { id: true, secureUrl: true, altText: true },
        take: 100,
      }),
      this.prisma.redirect.findMany({ orderBy: { updatedAt: "desc" }, take: 100 }),
    ]);
    return { metadata, missingAlt, redirects };
  }

  @Put("seo/:entityType/:entityId")
  updateSeo(
    @Param("entityType") entityTypeParam: string,
    @Param("entityId") entityId: string,
    @Body() dto: UpdateSeoDto,
  ) {
    const entityType = entityTypeParam.toUpperCase() as EntityType;
    if (!Object.values(EntityType).includes(entityType)) {
      throw new BadRequestException("Unsupported SEO entity type");
    }
    return this.prisma.seoMeta.upsert({
      where: { entityType_entityId: { entityType, entityId } },
      update: dto,
      create: { entityType, entityId, ...dto },
    });
  }

  @Get("leads")
  leads() {
    return this.prisma.lead.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }

  @Patch("leads/:id")
  updateLead(@Param("id") id: string, @Body() dto: UpdateLeadDto) {
    return this.prisma.lead.update({ where: { id }, data: dto });
  }

  @Get("content-reports")
  reports() {
    return this.prisma.contentReport.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 200,
    });
  }

  @Patch("content-reports/:id")
  updateReport(@Param("id") id: string, @Body() dto: UpdateReportDto) {
    const closed = dto.status === "ACTIONED" || dto.status === "DISMISSED";
    return this.prisma.contentReport.update({
      where: { id },
      data: { ...dto, closedAt: closed ? new Date() : null },
    });
  }

  @Get("analytics/summary")
  async analytics() {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [total, byType, topProfiles] = await Promise.all([
      this.prisma.analyticsEvent.count({ where: { createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.groupBy({
        by: ["type"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ["profileId"],
        where: { createdAt: { gte: since }, profileId: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { profileId: "desc" } },
        take: 10,
      }),
    ]);
    return { since, total, byType, topProfiles };
  }

  @Get("settings")
  settings() {
    return this.prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  }

  @Put("settings/:key")
  updateSetting(@Param("key") key: string, @Body() dto: UpdateSettingDto) {
    const normalizedKey = normalizeSlug(key).replace(/-/g, ".");
    const data = { value: dto.value as Prisma.InputJsonValue, isPublic: dto.isPublic };
    return this.prisma.siteSetting.upsert({
      where: { key: normalizedKey },
      update: data,
      create: { key: normalizedKey, ...data },
    });
  }
}

export function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function promotionStart() {
  return new Date();
}

function promotionEnd(start: Date) {
  return new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000);
}
