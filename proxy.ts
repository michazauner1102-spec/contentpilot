import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/**
 * Optimistischer Check: prüft nur die Cookie-Signatur, nie die Datenbank.
 * Die verbindliche Prüfung passiert in den Route Handlern über requireUser().
 */
export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isLogin = path === "/login";

  const session = await verifySessionToken(
    req.cookies.get(SESSION_COOKIE)?.value
  );

  if (!session && !isLogin) {
    const url = new URL("/login", req.nextUrl);
    return NextResponse.redirect(url);
  }
  if (session && isLogin) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|webp)$).*)"],
};
