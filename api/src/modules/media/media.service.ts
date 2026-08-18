import { ForbiddenException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { MediaResourceType } from "../../generated/prisma/enums";
import { PrismaService } from "../../prisma/prisma.service";
import { CompleteUploadDto } from "./dto/complete-upload.dto";
import { SignUploadDto, UploadResourceType } from "./dto/sign-upload.dto";

@Injectable()
export class MediaService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const cloudName = config.get<string>("CLOUDINARY_CLOUD_NAME");
    const apiKey = config.get<string>("CLOUDINARY_API_KEY");
    const apiSecret = config.get<string>("CLOUDINARY_API_SECRET");
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
        signature_algorithm: "sha256",
      });
    }
  }

  sign(dto: SignUploadDto) {
    if (!this.hasCloudinaryConfig()) {
      if (this.config.get<string>("NODE_ENV") === "production") {
        throw new ServiceUnavailableException("Image upload service is not configured");
      }
      return { provider: "local" as const };
    }
    const secret = this.requireConfig("CLOUDINARY_API_SECRET");
    const timestamp = Math.floor(Date.now() / 1000);
    const params = {
      timestamp,
      folder: dto.folder,
      ...(dto.publicId ? { public_id: dto.publicId } : {}),
      ...(dto.format ? { format: dto.format } : {}),
      overwrite: false,
      unique_filename: true,
    };
    return {
      provider: "cloudinary" as const,
      timestamp,
      signature: cloudinary.utils.api_sign_request(params, secret),
      apiKey: this.requireConfig("CLOUDINARY_API_KEY"),
      cloudName: this.requireConfig("CLOUDINARY_CLOUD_NAME"),
      resourceType: dto.resourceType,
      params,
      uploadUrl: `https://api.cloudinary.com/v1_1/${this.requireConfig("CLOUDINARY_CLOUD_NAME")}/${dto.resourceType}/upload`,
    };
  }

  async localUpload(
    file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
    altText: string,
    userId: string,
    requestOrigin: string,
  ) {
    if (this.hasCloudinaryConfig() || this.config.get<string>("NODE_ENV") === "production") {
      throw new ForbiddenException("Local image uploads are disabled");
    }

    const formats: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const format = formats[file.mimetype];
    if (!format) throw new ForbiddenException("Unsupported image format");

    const id = randomUUID();
    const fileName = `${id}.${format}`;
    const uploadDirectory = path.resolve(process.cwd(), "uploads");
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, fileName), file.buffer, { flag: "wx" });

    return this.prisma.mediaAsset.create({
      data: {
        cloudinaryPublicId: `local/${id}`,
        assetId: `local-${id}`,
        secureUrl: `${requestOrigin}/uploads/${fileName}`,
        resourceType: MediaResourceType.IMAGE,
        format,
        bytes: file.size,
        folder: "local",
        altText,
        tags: ["development-local-upload"],
        createdById: userId,
      },
      select: {
        id: true,
        secureUrl: true,
        resourceType: true,
        width: true,
        height: true,
        createdAt: true,
      },
    });
  }

  async complete(dto: CompleteUploadDto, userId: string) {
    const expected = cloudinary.utils.api_sign_request(
      { public_id: dto.cloudinaryPublicId, version: dto.version },
      this.requireConfig("CLOUDINARY_API_SECRET"),
    );
    if (expected !== dto.signature)
      throw new ForbiddenException("Cloudinary response signature is invalid");

    return this.prisma.mediaAsset.create({
      data: {
        cloudinaryPublicId: dto.cloudinaryPublicId,
        assetId: dto.assetId,
        secureUrl: dto.secureUrl,
        resourceType:
          dto.resourceType === UploadResourceType.VIDEO
            ? MediaResourceType.VIDEO
            : MediaResourceType.IMAGE,
        format: dto.format,
        width: dto.width,
        height: dto.height,
        duration: dto.duration,
        bytes: dto.bytes,
        folder: dto.folder,
        version: dto.version,
        altText: dto.altText,
        title: dto.title,
        tags: [],
        createdById: userId,
      },
      select: {
        id: true,
        secureUrl: true,
        resourceType: true,
        width: true,
        height: true,
        createdAt: true,
      },
    });
  }

  private requireConfig(key: string) {
    const value = this.config.get<string>(key);
    if (!value) throw new ServiceUnavailableException(`${key} is not configured`);
    return value;
  }

  private hasCloudinaryConfig() {
    return Boolean(
      this.config.get<string>("CLOUDINARY_CLOUD_NAME") &&
        this.config.get<string>("CLOUDINARY_API_KEY") &&
        this.config.get<string>("CLOUDINARY_API_SECRET"),
    );
  }
}
