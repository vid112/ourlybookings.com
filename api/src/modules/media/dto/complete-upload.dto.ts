import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from "class-validator";
import { UploadResourceType } from "./sign-upload.dto";

export class CompleteUploadDto {
  @IsString()
  cloudinaryPublicId: string;

  @IsOptional()
  @IsString()
  assetId?: string;

  @IsUrl({ require_protocol: true })
  secureUrl: string;

  @IsEnum(UploadResourceType)
  resourceType: UploadResourceType;

  @IsString()
  format: string;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsInt()
  height?: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsInt()
  @Min(1)
  bytes: number;

  @IsString()
  folder: string;

  @IsString()
  version: string;

  @IsString()
  signature: string;

  @IsString()
  @MaxLength(300)
  altText: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}
