import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const config = app.get(ConfigService);
  const isProduction = config.get("NODE_ENV") === "production";

  app.setGlobalPrefix("api/v1", { exclude: ["api/docs"] });
  app.enableCors({
    origin: [config.getOrThrow<string>("FRONTEND_URL"), config.getOrThrow<string>("ADMIN_URL")],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });
  app.use(helmet({ contentSecurityPolicy: isProduction ? undefined : false }));
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
