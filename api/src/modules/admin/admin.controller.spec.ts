import type { AuthenticatedRequest } from "../auth/auth.types";
import { AdminController, normalizeSlug } from "./admin.controller";

describe("normalizeSlug", () => {
  it("normalizes mixed punctuation and whitespace", () => {
    expect(normalizeSlug("  New Delhi / VIP Profile  ")).toBe("new-delhi-vip-profile");
  });
});

describe("AdminController category images", () => {
  it("stores the image in PostgreSQL and returns a cache-busted public URL", async () => {
    type UpdateCall = {
      where: { id: string };
      data: { imageData: Uint8Array; imageMimeType: string; imageUrl: string };
      select: { id: boolean; imageUrl: boolean; updatedAt: boolean };
    };
    const update = jest.fn((call: UpdateCall) => {
      expect(call.where).toEqual({ id: "category-1" });
      expect(call.data.imageData).toBeInstanceOf(Uint8Array);
      expect(call.data.imageMimeType).toBe("image/webp");
      expect(call.data.imageUrl).toMatch(
        /^https:\/\/api\.example\.test\/api\/v1\/public\/categories\/massage\/image\?v=\d+$/,
      );
      return Promise.resolve({
        id: "category-1",
        imageUrl: "https://api.example.test/api/v1/public/categories/massage/image?v=123",
      });
    });
    const controller = new AdminController({
      category: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: "category-1", slug: "massage" }),
        update,
      },
    } as never);
    const request = {
      headers: { "x-forwarded-proto": "https" },
      protocol: "http",
      get: () => "api.example.test",
    } as unknown as AuthenticatedRequest;

    await controller.uploadCategoryImage(
      "category-1",
      {
        buffer: Buffer.from("image"),
        mimetype: "image/webp",
        originalname: "category.webp",
        size: 5,
      },
      request,
    );

    expect(update).toHaveBeenCalledTimes(1);
  });
});
