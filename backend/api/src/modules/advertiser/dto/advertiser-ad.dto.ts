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
  @IsString() @MinLength(2) @MaxLength(100) displayName: string;
  @Type(() => Number) @IsInt() @Min(18) @Max(99) age: number;
  @IsString() cityId: string;
  @IsString() categoryId: string;
  @IsArray() @IsString({ each: true }) languages: string[];
  @IsString() @MinLength(20) @MaxLength(500) shortIntro: string;
  @IsString() @MinLength(50) @MaxLength(10000) fullBio: string;
  @IsOptional() @IsString() @MaxLength(100) nationality?: string;
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
