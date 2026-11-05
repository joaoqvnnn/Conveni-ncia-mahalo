import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!);
const CUSTOMER_COOKIE = "conv_session";
const ADMIN_COOKIE = "conv_admin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ---- Rotas do admin ----
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) return redirectTo(req, "/admin/login");
    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (payload.role !== "admin") return redirectTo(req, "/admin/login");
      return NextResponse.next();
    } catch {
      return redirectTo(req, "/admin/login");
    }
  }

  // ---- Rotas do cliente ----
  if (pathname.startsWith("/conta") || pathname === "/checkout") {
    const token = req.cookies.get(CUSTOMER_COOKIE)?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/entrar";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      const url = req.nextUrl.clone();
      url.pathname = "/entrar";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

function redirectTo(req: NextRequest, path: string) {
  const url = req.nextUrl.clone();
  url.pathname = path;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/conta/:path*", "/checkout", "/admin/:path*"],
};
