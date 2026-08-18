import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedRequest } from "../auth/auth.types";
import { AuthGuard } from "../auth/auth.guard";
import { CompleteUploadDto } from "./dto/complete-upload.dto";
import { LocalUploadDto } from "./dto/local-upload.dto";
import { SignUploadDto } from "./dto/sign-upload.dto";
import { MediaService } from "./media.service";

type UploadedImage = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

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

  @Post("local-upload")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 8 * 1024 * 1024, files: 1 },
      fileFilter: (_request, file, callback) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        callback(
          allowed.includes(file.mimetype)
            ? null
            : new BadRequestException("Only JPG, PNG and WebP images are allowed"),
          allowed.includes(file.mimetype),
        );
      },
    }),
  )
  localUpload(
    @UploadedFile() file: UploadedImage | undefined,
    @Body() dto: LocalUploadDto,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!file) throw new BadRequestException("Select an image to upload");
    const forwardedProtocol = request.headers["x-forwarded-proto"];
    const protocol =
      typeof forwardedProtocol === "string"
        ? forwardedProtocol.split(",")[0]?.trim()
        : request.protocol;
    return this.media.localUpload(file, dto.altText, request.user.id, `${protocol}://${request.get("host")}`);
  }
}
