import { Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class UpdateMediaDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(240)
  altText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  focalX?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  focalY?: number;

  @IsOptional()
  @IsIn(["ACTIVE", "REVIEW", "ARCHIVED"])
  usageStatus?: string;
}

export class CreateCityDto {
  @IsString()
  stateId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateCityDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateLeadDto {
  @IsIn(["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "SPAM"])
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED" | "SPAM";
}

export class UpdateReportDto {
  @IsIn(["OPEN", "TRIAGED", "ACTIONED", "DISMISSED"])
  status: "OPEN" | "TRIAGED" | "ACTIONED" | "DISMISSED";

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  actionTaken?: string;
}

export class UpdateSeoDto {
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  seoTitle: string;

  @IsString()
  @MinLength(20)
  @MaxLength(500)
  metaDescription: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  canonicalUrl?: string;

  @IsOptional()
  @IsBoolean()
  robotsIndex?: boolean;

  @IsOptional()
  @IsBoolean()
  robotsFollow?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  focusKeyword?: string;
}

export class UpdateSettingDto {
  @IsObject()
  value: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class ImportSourceDto {
  @IsUrl({ protocols: ["https"], require_protocol: true })
  sourceUrl: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  imageLimit?: number;
}

export class ModerateProfileDto {
  @IsIn(["APPROVED", "REJECTED", "CHANGES_REQUESTED"])
  decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @IsOptional()
  @IsIn(["NOT_REQUIRED", "PENDING", "PAID", "FAILED"])
  paymentStatus?: "NOT_REQUIRED" | "PENDING" | "PAID" | "FAILED";
}

export class RankProfileDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000000)
  promotionAmount: number;

  @Type(() => Number)
  @IsInt()
  @Min(-10000)
  @Max(10000)
  adminPriority: number;
}
