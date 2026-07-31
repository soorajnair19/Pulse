import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Framing policy:
 * - /embed/*  → embeddable by any parent (no X-Frame-Options / frame-ancestors)
 * - everything else → clickjacking protection
 *
 * Omitting framing headers on embeds is more compatible than
 * `Content-Security-Policy: frame-ancestors *` — some hosts (e.g. Framer)
 * nest embeds behind srcdoc/blob ancestors that `*` does not match.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/embed")) {
    // Explicitly allow embedding. Do not set X-Frame-Options or CSP frame-ancestors.
    response.headers.delete("X-Frame-Options");
    response.headers.delete("Content-Security-Policy");
    return response;
  }

  // Skip framing locks for API (not HTML documents).
  if (pathname.startsWith("/api")) {
    return response;
  }

  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set(
    "Content-Security-Policy",
    "frame-ancestors 'self'",
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on app routes; skip Next internals and static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
