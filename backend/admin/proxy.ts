import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const loggedIn = request.cookies.has("ourly_access");
  const isLogin = request.nextUrl.pathname === "/login";
  if (!loggedIn && !isLogin) return NextResponse.redirect(new URL("/login", request.url));
  if (loggedIn && isLogin) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
