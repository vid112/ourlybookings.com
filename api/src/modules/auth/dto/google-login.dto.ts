import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsString, MaxLength, MinLength } from "class-validator";

export class GoogleLoginDto {
  @ApiProperty({ description: "Google Identity Services ID token" })
  @IsString()
  @MinLength(100)
  @MaxLength(4096)
  credential: string;

  @ApiProperty({ description: "Adult, terms and privacy confirmation" })
  @IsBoolean()
  termsAccepted: boolean;
}
