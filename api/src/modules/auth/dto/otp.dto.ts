import { IsEmail, IsIn, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class VerifyOtpDto {
  @IsEmail() @MaxLength(200) email: string;
  @IsString() @Matches(/^\d{6}$/) code: string;
  @IsIn(["REGISTRATION", "PASSWORD_RESET"])
  purpose: "REGISTRATION" | "PASSWORD_RESET";
}

export class ResendOtpDto {
  @IsEmail() @MaxLength(200) email: string;
  @IsIn(["REGISTRATION", "PASSWORD_RESET"])
  purpose: "REGISTRATION" | "PASSWORD_RESET";
}

export class RequestPasswordResetDto {
  @IsEmail() @MaxLength(200) email: string;
}

export class ResetPasswordDto extends VerifyOtpDto {
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: "Password must include uppercase, lowercase and a number",
  })
  password: string;
}
