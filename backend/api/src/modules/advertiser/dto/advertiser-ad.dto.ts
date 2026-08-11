import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateAdvertiserAdDto {
  @IsOptional() @IsString() @MinLength(5) @MaxLength(100) adTitle?: string;
  @IsString() @MinLength(2) @MaxLength(100) displayName: string;
  @Type(() => Number) @IsInt() @Min(18) @Max(99) age: number;
  @IsString() cityId: string;
  @IsOptional() @IsString() areaId?: string;
  @IsString() categoryId: string;
  @IsArray() @IsString({ each: true }) languages: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) serviceIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) availabilitySlots?: string[];
  @IsString() @MinLength(20) @MaxLength(500) shortIntro: string;
  @IsString() @MinLength(50) @MaxLength(10000) fullBio: string;
  @IsOptional() @IsString() @MaxLength(50) gender?: string;
  @IsOptional() @IsString() @MaxLength(80) ethnicity?: string;
  @IsOptional() @IsString() @MaxLength(100) nationality?: string;
  @IsOptional() @IsString() @MaxLength(50) eyeColor?: string;
  @IsOptional() @IsString() @MaxLength(50) hairColor?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(25) @Max(300) weightKg?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(100) @Max(250) heightCm?: number;
  @IsOptional() @IsString() @MaxLength(80) bodyType?: string;
  @IsOptional() @IsString() @MaxLength(80) bust?: string;
  @IsOptional() @IsString() @MaxLength(80) attentionTo?: string;
  @IsOptional() @IsString() @MaxLength(100) placeOfService?: string;
  @IsOptional() @IsString() @MaxLength(500) availability?: string;
  @IsOptional() @IsString() @MaxLength(500) pricingNotes?: string;
  @IsOptional() @IsString() @MaxLength(50) contactPhone?: string;
  @IsOptional() @IsString() @MaxLength(50) contactWhatsapp?: string;
  @IsOptional() @IsString() @MaxLength(100) contactTelegram?: string;
  @IsOptional() @IsEmail() @MaxLength(200) contactEmail?: string;
}

export class UpdateAdvertiserAdDto extends PartialType(CreateAdvertiserAdDto) {}

export class AttachMediaDto {
  @IsString() mediaId: string;
}

export class SubmitAdvertiserAdDto {
  @IsOptional() @IsString() @MaxLength(2048) turnstileToken?: string;
}
