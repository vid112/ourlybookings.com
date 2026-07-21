import { BadRequestException, Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle, minutes } from "@nestjs/throttler";
import { PrismaService } from "../../prisma/prisma.service";
import { AnalyticsEventDto } from "./dto/analytics-event.dto";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { CreateReportDto } from "./dto/create-report.dto";

@ApiTags("public")
@Controller("public")
export class PublicController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("site")
  async site() {
    const settings = await this.prisma.siteSetting.findMany({
      where: { isPublic: true },
      select: { key: true, value: true },
    });
    return Object.fromEntries(settings.map(({ key, value }) => [key, value]));
  }

  @Get("home")
  async home() {
    const [profiles, states, posts] = await Promise.all([
      this.prisma.profile.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        orderBy: [{ featuredOrder: "asc" }, { publishedAt: "desc" }],
        take: 6,
        select: this.publicProfileSelect(),
      }),
      this.prisma.state.findMany({
        where: { isPublished: true },
        orderBy: { name: "asc" },
        take: 12,
        include: { cities: { where: { isPublished: true }, orderBy: { name: "asc" }, take: 6 } },
      }),
      this.prisma.blogPost.findMany({
        where: { status: "PUBLISHED", deletedAt: null },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: { title: true, slug: true, excerpt: true, publishedAt: true },
      }),
    ]);
    return { profiles, states, posts };
  }

  @Get("profiles")
  async profiles(
    @Query("state") state?: string,
    @Query("city") city?: string,
    @Query("category") category?: string,
  ) {
    return this.prisma.profile.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        ...(state || city
          ? {
              locations: {
                some: {
                  ...(state ? { city: { state: { slug: state } } } : {}),
                  ...(city ? { city: { slug: city } } : {}),
                },
              },
            }
          : {}),
        ...(category ? { categories: { some: { category: { slug: category } } } } : {}),
      },
      orderBy: [{ featuredOrder: "asc" }, { publishedAt: "desc" }],
      take: 48,
      select: this.publicProfileSelect(),
    });
  }

  @Get("profiles/:slug")
  async profile(@Param("slug") slug: string) {
    return this.prisma.profile.findFirstOrThrow({
      where: { slug, status: "PUBLISHED", deletedAt: null },
      select: this.publicProfileSelect(true),
    });
  }

  @Get(["locations/:stateSlug", "locations/:stateSlug/:citySlug"])
  async location(@Param("stateSlug") stateSlug: string, @Param("citySlug") citySlug?: string) {
    return this.prisma.state.findFirstOrThrow({
      where: { slug: stateSlug, isPublished: true },
      include: {
        cities: {
          where: { isPublished: true, ...(citySlug ? { slug: citySlug } : {}) },
          orderBy: { name: "asc" },
        },
      },
    });
  }

  @Post("leads")
  @Throttle({ default: { limit: 5, ttl: minutes(10) } })
  async createLead(@Body() dto: CreateLeadDto) {
    if (dto.website) throw new BadRequestException("Submission rejected");
    if (!dto.consent) throw new BadRequestException("Consent is required");
    const locationContext = [dto.city, dto.category].filter(Boolean).join(" · ");
    const lead = await this.prisma.lead.create({
      data: {
        type: dto.type,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        message: locationContext ? `[${locationContext}] ${dto.message}` : dto.message,
        sourcePage: dto.sourcePage,
        consentAt: new Date(),
        retentionUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
      select: { id: true, createdAt: true },
    });
    return { accepted: true, reference: lead.id, receivedAt: lead.createdAt };
  }

  @Post("analytics/events")
  @Throttle({ default: { limit: 60, ttl: minutes(1) } })
  async event(@Body() dto: AnalyticsEventDto) {
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    await this.prisma.$transaction([
      this.prisma.visitorSession.upsert({
        where: { id: dto.sessionId },
        create: { id: dto.sessionId, expiresAt },
        update: { lastSeenAt: new Date(), expiresAt },
      }),
      this.prisma.analyticsEvent.create({
        data: {
          sessionId: dto.sessionId,
          type: dto.type,
          page: dto.page,
          profileId: dto.profileId,
          referrer: dto.referrer,
          metadata: dto.metadata,
        },
      }),
    ]);
    return { accepted: true };
  }

  @Post("content-reports")
  @Throttle({ default: { limit: 3, ttl: minutes(15) } })
  async report(@Body() dto: CreateReportDto) {
    if (dto.website) throw new BadRequestException("Submission rejected");
    const report = await this.prisma.contentReport.create({
      data: {
        reportedUrl: dto.reportedUrl,
        reason: "User-submitted safety report",
        details: dto.message,
        reporterEmail: dto.email,
        priority: 5,
      },
      select: { id: true, createdAt: true },
    });
    return { accepted: true, reference: report.id, receivedAt: report.createdAt };
  }

  private publicProfileSelect(detailed = false) {
    return {
      id: true,
      displayName: true,
      slug: true,
      age: true,
      languages: true,
      shortIntro: true,
      ...(detailed
        ? {
            fullBio: true,
            availability: true,
            pricingNotes: true,
            contactPhone: true,
            contactWhatsapp: true,
          }
        : {}),
      categories: { select: { category: { select: { name: true, slug: true } } } },
      locations: {
        where: { isPrimary: true },
        take: 1,
        select: {
          city: {
            select: { name: true, slug: true, state: { select: { name: true, slug: true } } },
          },
        },
      },
      media: {
        orderBy: { sortOrder: "asc" as const },
        select: {
          role: true,
          media: {
            select: {
              secureUrl: true,
              altText: true,
              title: true,
              caption: true,
              width: true,
              height: true,
              resourceType: true,
            },
          },
        },
      },
    };
  }
}
