import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { LeadType } from "../../../generated/prisma/enums";

export class CreateLeadDto {
  @IsEnum(LeadType)
  type: LeadType = LeadType.ENQUIRY;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsString()
  @MinLength(20)
  @MaxLength(3000)
  message: string;

  @IsString()
  @MaxLength(500)
  sourcePage: string;

  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  consent: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
