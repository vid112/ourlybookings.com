import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import type { AccessPayload, AuthenticatedRequest } from "./auth.types";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.ourly_access as string | undefined;
    if (!token) throw new UnauthorizedException("Authentication required");
    try {
      const payload = await this.jwt.verifyAsync<AccessPayload>(token);
      if (payload.type !== "access") throw new Error("Unexpected token type");
      (request as AuthenticatedRequest).user = {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles,
      };
      return true;
    } catch {
      throw new UnauthorizedException("Access token is invalid or expired");
    }
  }
}
