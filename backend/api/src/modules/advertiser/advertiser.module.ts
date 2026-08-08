import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdvertiserController } from "./advertiser.controller";

@Module({ imports: [AuthModule], controllers: [AdvertiserController] })
export class AdvertiserModule {}
