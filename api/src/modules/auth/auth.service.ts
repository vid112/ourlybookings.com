import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { hash, verify } from "argon2";
import { createHash, randomInt, randomUUID, timingSafeEqual } from "crypto";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { PrismaService } from "../../prisma/prisma.service";
import type { RefreshPayload } from "./auth.types";
import { OtpMailerService } from "./otp-mailer.service";

const refreshTokenDigest = (token: string) => createHash("sha256").update(token).digest("hex");

const verifyRefreshToken = async (storedHash: string, token: string) => {
  // Tokens issued before the SHA-256 migration used Argon2. Keep them valid
  // until their normal seven-day expiry, while avoiding Argon2 for new tokens.
  if (storedHash.startsWith("$argon2")) return verify(storedHash, token);

  const actual = Buffer.from(refreshTokenDigest(token), "hex");
  const expected = Buffer.from(storedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

type LoginUser = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  isActive: boolean;
  accountStatus: "ACTIVE" | "UNVERIFIED" | "BLOCKED";
  roles: string[];
};

@Injectable()
export class AuthService {
  private readonly google = new OAuth2Client();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mailer: OtpMailerService,
  ) {}

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    mobile: string | undefined,
    termsAccepted: boolean,
  ) {
    if (!termsAccepted) throw new BadRequestException("Terms and privacy consent are required");
    const normalizedEmail = email.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email: normalizedEmail } })) {
      throw new ConflictException("An account already exists for this email");
    }
    const advertiserRole = await this.prisma.role.upsert({
      where: { name: "Advertiser" },
      update: {},
      create: { name: "Advertiser", description: "Can create and manage own advertisements" },
    });
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        mobile: mobile?.trim(),
        passwordHash: await hash(password),
        accountStatus: "UNVERIFIED",
        termsAcceptedAt: new Date(),
        roles: { create: { roleId: advertiserRole.id } },
      },
    });
    try {
      await this.issueOtp(user.id, user.email, "REGISTRATION", true);
    } catch (error) {
      await this.prisma.user.delete({ where: { id: user.id } });
      throw error;
    }
    return {
      verificationRequired: true,
      email: user.email,
      expiresInSeconds: 600,
      resendAfterSeconds: 60,
    };
  }

  async verifyRegistration(email: string, code: string) {
    const user = await this.verifyOtp(email, code, "REGISTRATION");
    const activated = await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date(), accountStatus: "ACTIVE" },
      include: { roles: { include: { role: true } } },
    });
    return {
      id: activated.id,
      email: activated.email,
      displayName: activated.displayName,
      roles: activated.roles.map(({ role }) => role.name),
    };
  }

  async resendOtp(email: string, purpose: "REGISTRATION" | "PASSWORD_RESET") {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user || user.accountStatus === "BLOCKED") return { sent: true, resendAfterSeconds: 60 };
    if (purpose === "REGISTRATION" && user.accountStatus === "ACTIVE") {
      throw new BadRequestException("Account is already verified");
    }
    await this.issueOtp(user.id, user.email, purpose);
    return { sent: true, resendAfterSeconds: 60 };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (user && user.accountStatus === "ACTIVE" && user.isActive) {
      await this.issueOtp(user.id, user.email, "PASSWORD_RESET", true);
    }
    return { sent: true, resendAfterSeconds: 60 };
  }

  async resetPassword(email: string, code: string, password: string) {
    const user = await this.verifyOtp(email, code, "PASSWORD_RESET");
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hash(password) },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { reset: true };
  }

  async login(email: string, password: string, userAgent?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const [user] = await this.prisma.$queryRaw<LoginUser[]>`
      SELECT
        u.id,
        u.email,
        u."displayName",
        u."passwordHash",
        u."isActive",
        u."accountStatus",
        COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), ARRAY[]::text[]) AS roles
      FROM "User" u
      LEFT JOIN "UserRole" ur ON ur."userId" = u.id
      LEFT JOIN "Role" r ON r.id = ur."roleId"
      WHERE u.email = ${normalizedEmail}
      GROUP BY u.id
      LIMIT 1
    `;
    if (
      !user ||
      !user.isActive ||
      user.accountStatus === "BLOCKED" ||
      !(await verify(user.passwordHash, password))
    ) {
      throw new UnauthorizedException("Email or password is incorrect");
    }
    if (user.accountStatus === "UNVERIFIED") {
      throw new ForbiddenException("Email verification is required before login");
    }
    return this.createSession(user, user.roles, userAgent, true);
  }

  async loginWithGoogle(credential: string, termsAccepted: boolean, userAgent?: string) {
    const clientId = this.config.get<string>("GOOGLE_CLIENT_ID");
    if (!clientId) {
      throw new ServiceUnavailableException("Google sign-in is not configured");
    }

    let payload: TokenPayload | undefined;
    try {
      const ticket = await this.google.verifyIdToken({ idToken: credential, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException("Google sign-in could not be verified");
    }
    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new UnauthorizedException("Google account email is not verified");
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    let user = await this.prisma.user.findUnique({
      where: { googleSubject: payload.sub },
      include: { roles: { include: { role: true } } },
    });
    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { roles: { include: { role: true } } },
      });
    }

    if (!user) {
      if (!termsAccepted) {
        throw new BadRequestException(
          "Confirm that you are 18+ and accept the terms before continuing with Google",
        );
      }
      const advertiserRole = await this.prisma.role.upsert({
        where: { name: "Advertiser" },
        update: {},
        create: { name: "Advertiser", description: "Can create and manage own advertisements" },
      });
      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          googleSubject: payload.sub,
          displayName: payload.name?.trim() || normalizedEmail.split("@")[0] || "Advertiser",
          passwordHash: await hash(`${randomUUID()}${randomUUID()}`),
          emailVerifiedAt: new Date(),
          termsAcceptedAt: new Date(),
          accountStatus: "ACTIVE",
          roles: { create: { roleId: advertiserRole.id } },
        },
        include: { roles: { include: { role: true } } },
      });
    } else {
      if (!user.isActive || user.accountStatus === "BLOCKED") {
        throw new UnauthorizedException("Account is unavailable");
      }
      if (user.googleSubject && user.googleSubject !== payload.sub) {
        throw new UnauthorizedException("Google account does not match this user");
      }
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleSubject: payload.sub,
          emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
          accountStatus: "ACTIVE",
          ...(!user.termsAcceptedAt && termsAccepted ? { termsAcceptedAt: new Date() } : {}),
        },
        include: { roles: { include: { role: true } } },
      });
    }

    return this.createSession(
      user,
      user.roles.map(({ role }) => role.name),
      userAgent,
      true,
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
      !(await verifyRefreshToken(stored.tokenHash, refreshToken))
    ) {
      throw new UnauthorizedException("Refresh token cannot be reused");
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: { include: { role: true } } },
    });
    if (!user || !user.isActive || user.accountStatus !== "ACTIVE")
      throw new UnauthorizedException("Account is unavailable");

    const nextId = randomUUID();
    const next = await this.createSession(
      user,
      user.roles.map(({ role }) => role.name),
      userAgent,
      false,
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

  private async issueOtp(
    userId: string,
    email: string,
    purpose: "REGISTRATION" | "PASSWORD_RESET",
    skipCooldown = false,
  ) {
    const latest = await this.prisma.verificationCode.findFirst({
      where: { userId, purpose },
      orderBy: { createdAt: "desc" },
    });
    if (!skipCooldown && latest && latest.createdAt > new Date(Date.now() - 60_000)) {
      throw new HttpException(
        "Please wait 60 seconds before requesting another code",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const code = randomInt(100000, 1000000).toString();
    await this.prisma.$transaction([
      this.prisma.verificationCode.updateMany({
        where: { userId, purpose, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      this.prisma.verificationCode.create({
        data: {
          userId,
          purpose,
          codeHash: await hash(code),
          expiresAt: new Date(Date.now() + 10 * 60_000),
        },
      }),
    ]);
    await this.mailer.sendCode(email, code, purpose);
  }

  private async verifyOtp(email: string, code: string, purpose: "REGISTRATION" | "PASSWORD_RESET") {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user || user.accountStatus === "BLOCKED")
      throw new BadRequestException("Verification code is invalid or expired");
    const record = await this.prisma.verificationCode.findFirst({
      where: { userId: user.id, purpose, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (!record || record.expiresAt <= new Date() || record.attempts >= 5) {
      throw new BadRequestException("Verification code is invalid or expired");
    }
    const valid = await verify(record.codeHash, code);
    await this.prisma.verificationCode.update({
      where: { id: record.id },
      data: {
        attempts: { increment: 1 },
        ...(!valid && record.attempts + 1 >= 5 ? { consumedAt: new Date() } : {}),
      },
    });
    if (!valid) throw new BadRequestException("Verification code is invalid or expired");
    await this.prisma.verificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
    return user;
  }

  private async createSession(
    user: { id: string; email: string; displayName: string },
    roles: string[],
    userAgent?: string,
    recordLogin = false,
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
    const createRefreshToken = this.prisma.refreshToken.create({
      data: {
        id: tokenId,
        userId: user.id,
        tokenHash: refreshTokenDigest(refreshToken),
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: userAgent?.slice(0, 500),
      },
    });
    if (recordLogin) {
      await Promise.all([
        createRefreshToken,
        this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
      ]);
    } else {
      await createRefreshToken;
    }
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, displayName: user.displayName, roles },
    };
  }
}
