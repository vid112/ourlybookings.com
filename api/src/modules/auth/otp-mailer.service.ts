import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";

@Injectable()
export class OtpMailerService {
  constructor(private readonly config: ConfigService) {}

  async sendCode(email: string, code: string, purpose: "REGISTRATION" | "PASSWORD_RESET") {
    const host = this.config.get<string>("SMTP_HOST")?.trim();
    const user = this.config.get<string>("SMTP_USER")?.trim();
    const pass = this.config.get<string>("SMTP_PASSWORD")?.replace(/\s+/g, "");
    const port = this.config.get<number>("SMTP_PORT") ?? 465;
    const from = this.config.get<string>("SMTP_FROM")?.trim() ?? user;
    if (!host || !user || !pass || !from) {
      throw new ServiceUnavailableException("Email OTP service is not configured");
    }
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    const isRegistration = purpose === "REGISTRATION";
    await transporter.sendMail({
      from: `Ourly Bookings <${from}>`,
      to: email,
      subject: isRegistration ? "Verify your Ourly Bookings account" : "Reset your Ourly Bookings password",
      text: `Your Ourly Bookings verification code is ${code}. It expires in 10 minutes. Do not share this code.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;background:#101624;color:#f8f8fa;border-radius:18px"><h1 style="margin:0 0 12px;color:#dc3267">Ourly Bookings</h1><p>${isRegistration ? "Complete your advertiser registration" : "Use this code to reset your password"}:</p><div style="font-size:34px;font-weight:700;letter-spacing:10px;margin:24px 0;color:#ffffff">${code}</div><p style="color:#a9b0c3">This code expires in 10 minutes. Never share it with anyone.</p></div>`,
    });
  }
}
