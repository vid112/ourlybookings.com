import { IsEnum, IsObject, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { AnalyticsEventType } from "../../../generated/prisma/enums";

export class AnalyticsEventDto {
  @IsUUID()
  sessionId: string;

  @IsEnum(AnalyticsEventType)
  type: AnalyticsEventType;

  @IsString()
  @MaxLength(500)
  page: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  profileId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  referrer?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string | number | boolean | null>;
}
