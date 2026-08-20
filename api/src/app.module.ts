import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule, minutes } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { MediaModule } from "./modules/media/media.module";
import { PublicModule } from "./modules/public/public.module";
import { PrismaModule } from "./prisma/prisma.module";
import { validateEnvironment } from "./config/env";
import { AdvertiserModule } from "./modules/advertiser/advertiser.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../.env"],
      validate: validateEnvironment,
    }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: minutes(1), limit: 100 }] }),
    PrismaModule,
    AuthModule,
    PublicModule,
    MediaModule,
    AdminModule,
    AdvertiserModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
