import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateReportDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsUrl({ require_protocol: true })
  @MaxLength(1000)
  reportedUrl: string;

  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  message: string;

  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  consent: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
