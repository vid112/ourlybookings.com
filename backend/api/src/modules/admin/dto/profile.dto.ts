import { PartialType } from "@nestjs/swagger";
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  slug: string;

  @IsInt()
  @Min(18)
  @Max(99)
  age: number;

  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @IsString()
  @MinLength(20)
  @MaxLength(500)
  shortIntro: string;

  @IsString()
  @MinLength(50)
  @MaxLength(10000)
  fullBio: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  availability?: string;
}

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
