import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class AppController {
  @Get()
  getHealth() {
    return { ok: true, service: "ourly-api", timestamp: new Date().toISOString() };
  }
}
