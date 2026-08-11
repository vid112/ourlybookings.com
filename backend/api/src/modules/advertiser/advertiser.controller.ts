import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthGuard } from "../auth/auth.guard";
import type { AuthenticatedRequest } from "../auth/auth.types";
import { TurnstileService } from "../auth/turnstile.service";
import {
  AttachMediaDto,
  CreateAdvertiserAdDto,
  SubmitAdvertiserAdDto,
  UpdateAdvertiserAdDto,
} from "./dto/advertiser-ad.dto";

@ApiTags("advertiser")
@ApiCookieAuth("ourly_access")
@UseGuards(AuthGuard)
@Controller("advertiser")
export class AdvertiserController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly turnstile: TurnstileService,
  ) {}

  @Get("dashboard")
  async dashboard(@Req() request: AuthenticatedRequest) {
    const [user, active, expired, unpublished] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({
        where: { id: request.user.id },
        select: {
          id: true,
          displayName: true,
          email: true,
          mobile: true,
          emailVerifiedAt: true,
          mobileVerifiedAt: true,
          credits: true,
          createdAt: true,
        },
      }),
      this.prisma.profile.count({
        where: { ownerId: request.user.id, status: "PUBLISHED", deletedAt: null },
      }),
      this.prisma.profile.count({
        where: { ownerId: request.user.id, status: "ARCHIVED" },
      }),
      this.prisma.profile.count({
        where: {
          ownerId: request.user.id,
          deletedAt: null,
          status: { in: ["DRAFT", "SCHEDULED"] },
        },
      }),
    ]);
    return { user, counts: { active, expired, unpublished } };
  }

  @Get("ads")
  ads(@Req() request: AuthenticatedRequest) {
    return this.prisma.profile.findMany({
      where: { ownerId: request.user.id, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      include: {
        categories: { include: { category: true } },
        locations: { include: { city: { include: { state: { include: { country: true } } } } } },
        services: { include: { service: true } },
        media: { orderBy: { sortOrder: "asc" }, include: { media: true } },
      },
    });
  }

  @Post("ads")
  async create(@Body() dto: CreateAdvertiserAdDto, @Req() request: AuthenticatedRequest) {
    const { cityId, areaId, categoryId, serviceIds, ...data } = dto;
    const slug = await this.uniqueSlug(data.displayName);
    return this.prisma.profile.create({
      data: {
        ...data,
        slug,
        ownerId: request.user.id,
        status: "DRAFT",
        moderationStatus: "DRAFT",
        locations: { create: { cityId, areaId, isPrimary: true } },
        categories: { create: { categoryId } },
        ...(serviceIds?.length
          ? { services: { create: [...new Set(serviceIds)].map((serviceId) => ({ serviceId })) } }
          : {}),
      },
    });
  }

  @Patch("ads/:id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAdvertiserAdDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const existing = await this.owned(id, request.user.id);
    if (existing.status === "PUBLISHED")
      throw new BadRequestException("Published ads must be sent for admin review before editing");
    const { cityId, areaId, categoryId, serviceIds, ...data } = dto;
    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.update({
        where: { id },
        data: { ...data, moderationStatus: "DRAFT", moderationMessage: null },
      });
      if (cityId) {
        await tx.profileLocation.deleteMany({ where: { profileId: id } });
        await tx.profileLocation.create({
          data: { profileId: id, cityId, areaId, isPrimary: true },
        });
      }
      if (categoryId) {
        await tx.profileCategory.deleteMany({ where: { profileId: id } });
        await tx.profileCategory.create({ data: { profileId: id, categoryId } });
      }
      if (serviceIds) {
        await tx.profileService.deleteMany({ where: { profileId: id } });
        if (serviceIds.length) {
          await tx.profileService.createMany({
            data: [...new Set(serviceIds)].map((serviceId) => ({ profileId: id, serviceId })),
            skipDuplicates: true,
          });
        }
      }
      return profile;
    });
  }

  @Post("ads/:id/media")
  async attachMedia(
    @Param("id") id: string,
    @Body() dto: AttachMediaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.owned(id, request.user.id);
    const media = await this.prisma.mediaAsset.findFirst({
      where: { id: dto.mediaId, createdById: request.user.id, deletedAt: null },
    });
    if (!media) throw new BadRequestException("Uploaded image was not found");
    const count = await this.prisma.profileMedia.count({ where: { profileId: id } });
    if (count >= 8) throw new BadRequestException("A maximum of 8 images is allowed");
    return this.prisma.profileMedia.upsert({
      where: { profileId_mediaId: { profileId: id, mediaId: dto.mediaId } },
      update: {},
      create: {
        profileId: id,
        mediaId: dto.mediaId,
        role: count === 0 ? "PRIMARY" : "GALLERY",
        sortOrder: count,
      },
    });
  }

  @Delete("ads/:id/media/:mediaId")
  async removeMedia(
    @Param("id") id: string,
    @Param("mediaId") mediaId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.owned(id, request.user.id);
    await this.prisma.profileMedia.delete({
      where: { profileId_mediaId: { profileId: id, mediaId } },
    });
    return { deleted: true };
  }

  @Post("ads/:id/submit")
  async submit(
    @Param("id") id: string,
    @Body() dto: SubmitAdvertiserAdDto,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.turnstile.verify(dto.turnstileToken, request.ip);
    const profile = await this.prisma.profile.findFirst({
      where: { id, ownerId: request.user.id, deletedAt: null },
      include: { media: true, locations: true, categories: true },
    });
    if (!profile) throw new BadRequestException("Advertisement was not found");
    if (!profile.media.length)
      throw new BadRequestException("Upload at least one image before submitting");
    if (!profile.locations.length || !profile.categories.length)
      throw new BadRequestException("Category and city are required");
    return this.prisma.profile.update({
      where: { id },
      data: {
        moderationStatus: "PENDING",
        paymentStatus: "NOT_REQUIRED",
        moderationMessage: "Submitted for admin review",
        submittedAt: new Date(),
      },
    });
  }

  @Delete("ads/:id")
  async remove(@Param("id") id: string, @Req() request: AuthenticatedRequest) {
    await this.owned(id, request.user.id);
    await this.prisma.profile.update({
      where: { id },
      data: { deletedAt: new Date(), status: "ARCHIVED" },
    });
    return { deleted: true };
  }

  private async owned(id: string, ownerId: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { id, ownerId, deletedAt: null },
    });
    if (!profile) throw new BadRequestException("Advertisement was not found");
    return profile;
  }

  private async uniqueSlug(name: string) {
    const base =
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "listing";
    for (let suffix = 0; suffix < 100; suffix += 1) {
      const slug = suffix ? `${base}-${suffix + 1}` : base;
      if (!(await this.prisma.profile.findUnique({ where: { slug } }))) return slug;
    }
    return `${base}-${Date.now()}`;
  }
}
