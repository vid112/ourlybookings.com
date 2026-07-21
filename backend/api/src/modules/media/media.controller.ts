import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedRequest } from "../auth/auth.types";
import { AuthGuard } from "../auth/auth.guard";
import { CompleteUploadDto } from "./dto/complete-upload.dto";
import { SignUploadDto } from "./dto/sign-upload.dto";
import { MediaService } from "./media.service";

@ApiTags("admin media")
@ApiCookieAuth("ourly_access")
@UseGuards(AuthGuard)
@Controller("admin/media")
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post("signature")
  sign(@Body() dto: SignUploadDto) {
    return this.media.sign(dto);
  }

  @Post("complete")
  complete(@Body() dto: CompleteUploadDto, @Req() request: AuthenticatedRequest) {
    return this.media.complete(dto, request.user.id);
  }
}
