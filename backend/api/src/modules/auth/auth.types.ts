import type { Request } from "express";

export type AuthUser = {
  id: string;
  email: string;
  roles: string[];
};

export type AuthenticatedRequest = Request & { user: AuthUser };

export type AccessPayload = {
  sub: string;
  email: string;
  roles: string[];
  type: "access";
};

export type RefreshPayload = {
  sub: string;
  jti: string;
  familyId: string;
  type: "refresh";
};
