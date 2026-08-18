import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const adminSession = hasAdminSession(request.cookies.get("ourly_access")?.value);
  const isLogin = request.nextUrl.pathname === "/login";
  if (!adminSession && !isLogin) return NextResponse.redirect(new URL("/login", request.url));
  if (adminSession && isLogin) return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };

function hasAdminSession(token?: string) {
  if (!token) return false;
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return false;
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as { exp?: number; roles?: string[] };
    if (!payload.exp || payload.exp * 1000 <= Date.now()) return false;
    return payload.roles?.some((role) => ["Super Admin", "Admin", "Content Editor"].includes(role)) ?? false;
  } catch {
    return false;
  }
}
