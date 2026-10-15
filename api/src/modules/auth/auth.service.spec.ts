import { ServiceUnavailableException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { JwtService } from "@nestjs/jwt";
import type { PrismaService } from "../../prisma/prisma.service";
import { AuthService } from "./auth.service";
import type { OtpMailerService } from "./otp-mailer.service";

describe("AuthService Google sign-in", () => {
  it("fails safely when the Google OAuth client is not configured", async () => {
    const config = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    const service = new AuthService(
      {} as PrismaService,
      {} as JwtService,
      config,
      {} as OtpMailerService,
    );

    await expect(service.loginWithGoogle("credential", true)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
