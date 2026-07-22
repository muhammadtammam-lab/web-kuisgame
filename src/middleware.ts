import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "admin_session";

// Fungsi base64 decode sederhana untuk Edge Runtime
function base64Decode(str: string): string {
  // Gunakan Buffer-like approach yang kompatibel dengan Edge
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  const cleaned = str.replace(/=+$/, "");
  
  for (let i = 0; i < cleaned.length; i += 4) {
    const a = chars.indexOf(cleaned[i]);
    const b = chars.indexOf(cleaned[i + 1] || "A");
    const c = chars.indexOf(cleaned[i + 2] || "A");
    const d = chars.indexOf(cleaned[i + 3] || "A");
    
    result += String.fromCharCode((a << 2) | (b >> 4));
    if (cleaned[i + 2]) {
      result += String.fromCharCode(((b & 15) << 4) | (c >> 2));
    }
    if (cleaned[i + 3]) {
      result += String.fromCharCode(((c & 3) << 6) | d);
    }
  }
  
  return result;
}

function hasValidSessionToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    
    // Decode payload (parts[1])
    const payloadStr = base64Decode(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadStr);
    
    // Cek expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteksi halaman admin (kecuali login)
  // Gunakan startsWith yang lebih spesifik untuk hindari false positive
  if (pathname === "/admin" || 
      (pathname.startsWith("/admin/") && !pathname.startsWith("/admin/login"))) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token || !hasValidSessionToken(token)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};