import { BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type TurnstileResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

@Injectable()
export class TurnstileService {
  constructor(private readonly config: ConfigService) {}

  async verify(token?: string, remoteIp?: string) {
    const secret = this.config.get<string>("TURNSTILE_SECRET_KEY")?.trim();
    if (!secret) {
      if (this.config.get<string>("NODE_ENV") === "production") {
        throw new ServiceUnavailableException("Cloudflare verification is not configured");
      }
      return;
    }
    if (!token) throw new BadRequestException("Complete the Cloudflare security check");

    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);
    let result: TurnstileResponse;
    try {
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      });
      result = (await response.json()) as TurnstileResponse;
    } catch {
      throw new ServiceUnavailableException("Cloudflare verification is temporarily unavailable");
    }
    if (!result.success) {
      throw new BadRequestException("Cloudflare security check failed. Please try again");
    }
  }
}
