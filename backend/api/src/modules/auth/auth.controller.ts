import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import { Throttle, minutes } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthGuard } from "./auth.guard";
import type { AuthenticatedRequest } from "./auth.types";

@ApiTags("authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post("register")
  @Throttle({ default: { limit: 3, ttl: minutes(10) } })
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.register(dto.displayName, dto.email, dto.password, request.get("user-agent"));
    this.writeCookies(response, session.accessToken, session.refreshToken);
    return { user: session.user };
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
    const session = await this.auth.login(dto.email, dto.password, request.get("user-agent"));
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
    response.clearCookie("ourly_access", { path: "/" });
    response.clearCookie("ourly_refresh", { path: "/api/v1/auth" });
    return { ok: true };
  }

  private writeCookies(response: Response, accessToken: string, refreshToken: string) {
    const secure = this.config.get("NODE_ENV") === "production";
    response.cookie("ourly_access", accessToken, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });
    response.cookie("ourly_refresh", refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/api/v1/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
