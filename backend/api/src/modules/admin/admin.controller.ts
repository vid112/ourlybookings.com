import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthGuard } from "../auth/auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { CreateProfileDto, UpdateProfileDto } from "./dto/profile.dto";

@ApiTags("admin")
@ApiCookieAuth("ourly_access")
@UseGuards(AuthGuard, RolesGuard)
@Roles("Super Admin", "Admin", "Content Editor")
@Controller("admin")
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("dashboard")
  async dashboard() {
    const [profiles, leads, reports, events] = await Promise.all([
      this.prisma.profile.count({ where: { deletedAt: null } }),
      this.prisma.lead.count({ where: { status: "NEW", deletedAt: null } }),
      this.prisma.contentReport.count({ where: { status: { in: ["OPEN", "TRIAGED"] } } }),
      this.prisma.analyticsEvent.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
    ]);
    return { profiles, newLeads: leads, openReports: reports, eventsLast24Hours: events };
  }

  @Get("profiles")
  profiles() {
    return this.prisma.profile.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: {
        verification: { select: { status: true, adultConfirmed: true, verifiedAt: true } },
        locations: { where: { isPrimary: true }, include: { city: { include: { state: true } } } },
      },
    });
  }

  @Post("profiles")
  createProfile(@Body() dto: CreateProfileDto) {
    return this.prisma.profile.create({ data: { ...dto, slug: normalizeSlug(dto.slug) } });
  }

  @Patch("profiles/:id")
  updateProfile(@Param("id") id: string, @Body() dto: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { id },
      data: { ...dto, ...(dto.slug ? { slug: normalizeSlug(dto.slug) } : {}) },
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
    return this.prisma.profile.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  }

  @Delete("profiles/:id")
  async deleteProfile(@Param("id") id: string) {
    await this.prisma.profile.update({
      where: { id },
      data: { deletedAt: new Date(), status: "ARCHIVED" },
    });
    return { deleted: true };
  }

  @Get("leads")
  leads() {
    return this.prisma.lead.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }

  @Get("content-reports")
  reports() {
    return this.prisma.contentReport.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 200,
    });
  }

  @Get("analytics/summary")
  async analytics() {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [total, byType] = await Promise.all([
      this.prisma.analyticsEvent.count({ where: { createdAt: { gte: since } } }),
      this.prisma.analyticsEvent.groupBy({
        by: ["type"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
      }),
    ]);
    return { since, total, byType };
  }
}

export function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
