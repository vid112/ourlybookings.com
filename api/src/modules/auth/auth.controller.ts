import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import { Throttle, minutes } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthGuard } from "./auth.guard";
import type { AuthenticatedRequest } from "./auth.types";
import {
  RequestPasswordResetDto,
  ResendOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from "./dto/otp.dto";
import { TurnstileService } from "./turnstile.service";

@ApiTags("authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    private readonly turnstile: TurnstileService,
  ) {}

  @Post("register")
  @Throttle({ default: { limit: 3, ttl: minutes(10) } })
  async register(@Body() dto: RegisterDto, @Req() request: Request) {
    await this.turnstile.verify(dto.turnstileToken, request.ip);
    return this.auth.register(
      dto.firstName,
      dto.lastName,
      dto.email,
      dto.password,
      dto.mobile,
      dto.termsAccepted,
    );
  }

  @Post("verify-otp")
  @Throttle({ default: { limit: 5, ttl: minutes(10) } })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    if (dto.purpose !== "REGISTRATION") return { verified: true };
    const user = await this.auth.verifyRegistration(dto.email, dto.code);
    return { verified: true, user };
  }

  @Post("resend-otp")
  @Throttle({ default: { limit: 3, ttl: minutes(10) } })
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.auth.resendOtp(dto.email, dto.purpose);
  }

  @Post("forgot-password")
  @Throttle({ default: { limit: 3, ttl: minutes(10) } })
  forgotPassword(@Body() dto: RequestPasswordResetDto) {
    return this.auth.requestPasswordReset(dto.email);
  }

  @Post("reset-password")
  @Throttle({ default: { limit: 5, ttl: minutes(10) } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.email, dto.code, dto.password);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return { user: request.user };
  }

  @Post("login")
  @Throttle({ default: { limit: 5, ttl: minutes(5) } })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.turnstile.verify(dto.turnstileToken, request.ip);
    const session = await this.auth.login(dto.email, dto.password, request.get("user-agent"));
    this.writeCookies(response, session.accessToken, session.refreshToken);
    return { user: session.user };
  }

  @Post("google")
  @Throttle({ default: { limit: 5, ttl: minutes(5) } })
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.loginWithGoogle(
      dto.credential,
      dto.termsAccepted,
      request.get("user-agent"),
    );
    this.writeCookies(response, session.accessToken, session.refreshToken);
    return { user: session.user };
  }

  @Post("refresh")
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = request.cookies?.ourly_refresh as string | undefined;
    const session = await this.auth.refresh(token ?? "", request.get("user-agent"));
    this.writeCookies(response, session.accessToken, session.refreshToken);
    return { user: session.user };
  }

  @Post("logout")
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(request.cookies?.ourly_refresh as string | undefined);
    const domain = this.cookieDomain();
    response.clearCookie("ourly_access", { path: "/", domain });
    response.clearCookie("ourly_refresh", { path: "/api/v1/auth", domain });
    return { ok: true };
  }

  private writeCookies(response: Response, accessToken: string, refreshToken: string) {
    const secure = this.config.get("NODE_ENV") === "production";
    const domain = this.cookieDomain();
    response.cookie("ourly_access", accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      domain,
      path: "/",
      maxAge: 15 * 60 * 1000,
    });
    response.cookie("ourly_refresh", refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      domain,
      path: "/api/v1/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private cookieDomain() {
    return this.config.get<string>("COOKIE_DOMAIN") || undefined;
  }
}
