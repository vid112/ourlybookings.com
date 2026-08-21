import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    const connectionString = config.getOrThrow<string>("DATABASE_URL");
    super({
      adapter: new PrismaPg({
        connectionString,
        connectionTimeoutMillis: 10_000,
        idleTimeoutMillis: 30_000,
        keepAlive: true,
        max: 5,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
    // Do not block the web server health check on a remote database round trip.
    // Warm the pool in the background so the first user request is still fast.
    void this.$queryRaw`SELECT 1`.catch(() => undefined);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
