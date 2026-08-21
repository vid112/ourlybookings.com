import "reflect-metadata";
import { PATH_METADATA } from "@nestjs/common/constants";
import type { Response } from "express";
import { PublicController } from "./public.controller";

describe("PublicController routes", () => {
  it("uses Nest 11 compatible state and city location paths", () => {
    const descriptor = Object.getOwnPropertyDescriptor(PublicController.prototype, "location");
    const handler: unknown = descriptor?.value;
    if (typeof handler !== "function") throw new Error("Location handler metadata is missing");
    const paths: unknown = Reflect.getMetadata(PATH_METADATA, handler);

    expect(paths).toEqual(["locations/:stateSlug", "locations/:stateSlug/:citySlug"]);
  });
});

describe("PublicController category images", () => {
  it("serves stored bytes with immutable cache headers", async () => {
    const controller = new PublicController({
      category: {
        findUnique: jest.fn().mockResolvedValue({
          imageData: new Uint8Array(Buffer.from("image")),
          imageMimeType: "image/webp",
          updatedAt: new Date("2026-08-21T00:00:00.000Z"),
        }),
      },
    } as never);
    const set = jest.fn();
    const send = jest.fn();
    const response = { set, send } as unknown as Response;

    await controller.categoryImage("massage", response);

    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      }),
    );
    expect(send).toHaveBeenCalledWith(Buffer.from("image"));
  });
});
