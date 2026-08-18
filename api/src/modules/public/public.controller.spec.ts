import "reflect-metadata";
import { PATH_METADATA } from "@nestjs/common/constants";
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
