import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "node:path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: false });
  const config = app.get(ConfigService);
  const isProduction = config.get("NODE_ENV") === "production";
  const frontendUrl = new URL(config.getOrThrow<string>("FRONTEND_URL"));
  const allowedOrigins = new Set([
    frontendUrl.origin,
    config.getOrThrow<string>("ADMIN_URL"),
  ]);
  if (frontendUrl.hostname.startsWith("www.")) {
    const apexUrl = new URL(frontendUrl);
    apexUrl.hostname = frontendUrl.hostname.slice(4);
    allowedOrigins.add(apexUrl.origin);
  } else if (!frontendUrl.hostname.includes("localhost")) {
    const wwwUrl = new URL(frontendUrl);
    wwwUrl.hostname = `www.${frontendUrl.hostname}`;
    allowedOrigins.add(wwwUrl.origin);
  }

  app.setGlobalPrefix("api/v1", { exclude: ["api/docs"] });
  app.enableCors({
    origin: [...allowedOrigins],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });
  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  if (!isProduction) {
    app.useStaticAssets(path.resolve(process.cwd(), "uploads"), { prefix: "/uploads/", maxAge: "1h" });
  }
  app.use(cookieParser(config.getOrThrow<string>("COOKIE_SECRET")));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Ourly Bookings API")
    .setDescription("Versioned public, admin, analytics and media API")
    .setVersion("1.0")
    .addCookieAuth("ourly_access")
    .build();
  SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(config.get<number>("PORT") ?? 4000, "0.0.0.0");
}

void bootstrap();
