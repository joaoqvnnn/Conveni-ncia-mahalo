import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!);
export const ADMIN_COOKIE = "conv_admin";

export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(SECRET);

  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function getAdminSession() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.role === "admin" ? { role: "admin" } : null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const s = await getAdminSession();
  if (!s) throw new Error("UNAUTHORIZED");
  return s;
}

export async function destroyAdminSession() {
  cookies().delete(ADMIN_COOKIE);
}
