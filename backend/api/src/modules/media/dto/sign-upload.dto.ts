import { IsEnum, IsIn, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export enum UploadResourceType {
  IMAGE = "image",
  VIDEO = "video",
}

export class SignUploadDto {
  @IsEnum(UploadResourceType)
  resourceType: UploadResourceType;

  @IsString()
  @Matches(/^(profiles\/[a-zA-Z0-9_-]+\/(images|videos)|pages|blogs)$/)
  folder: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  publicId?: string;

  @IsOptional()
  @IsIn(["jpg", "jpeg", "png", "webp", "avif", "mp4", "webm"])
  format?: string;
}
