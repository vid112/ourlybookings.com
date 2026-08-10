import { IsString, Length } from "class-validator";

export class LocalUploadDto {
  @IsString()
  @Length(3, 160)
  altText!: string;
}
