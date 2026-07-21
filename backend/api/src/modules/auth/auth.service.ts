import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { hash, verify } from "argon2";
import { randomUUID } from "crypto";
import { PrismaService } from "../../prisma/prisma.service";
import type { RefreshPayload } from "./auth.types";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { roles: { include: { role: true } } },
    });
    if (!user || !user.isActive || !(await verify(user.passwordHash, password))) {
      throw new UnauthorizedException("Email or password is incorrect");
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return this.createSession(
      user,
      user.roles.map(({ role }) => role.name),
      userAgent,
    );
  }

  async refresh(refreshToken: string, userAgent?: string) {
    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Refresh token is invalid or expired");
    }
    const stored = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti } });
    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt <= new Date() ||
      !(await verify(stored.tokenHash, refreshToken))
    ) {
      throw new UnauthorizedException("Refresh token cannot be reused");
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: { include: { role: true } } },
    });
    if (!user || !user.isActive) throw new UnauthorizedException("Account is unavailable");

    const nextId = randomUUID();
    const next = await this.createSession(
      user,
      user.roles.map(({ role }) => role.name),
      userAgent,
      payload.familyId,
      nextId,
    );
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedBy: nextId },
    });
    return next;
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    try {
      const payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        ignoreExpiration: true,
      });
      await this.prisma.refreshToken.updateMany({
        where: { id: payload.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      return;
    }
  }

  private async createSession(
    user: { id: string; email: string; displayName: string },
    roles: string[],
    userAgent?: string,
    familyId: string = randomUUID(),
    tokenId: string = randomUUID(),
  ) {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, roles, type: "access" },
      { expiresIn: 15 * 60 },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti: tokenId, familyId, type: "refresh" },
      { secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"), expiresIn: 7 * 24 * 60 * 60 },
    );
    await this.prisma.refreshToken.create({
      data: {
        id: tokenId,
        userId: user.id,
        tokenHash: await hash(refreshToken),
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: userAgent?.slice(0, 500),
      },
    });
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, displayName: user.displayName, roles },
    };
  }
}
