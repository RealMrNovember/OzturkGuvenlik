import { NextResponse, type NextRequest } from "next/server";

// öztürkgüvenlik.com (Türkçe IDN) aynı Vercel projesine bağlı ve aynı siteyi
// sunuyor — ama ayrı bir canlı domain olarak aynı içeriği servis etmek
// Google'da "duplicate content" riski oluşturur. Google Ads kampanyaları
// www.ozturkguvenlik.com üzerinden yürüdüğü için (bkz. lib/site.ts) tek
// canonical adres o olmalı; bu domain'e gelen her istek oraya 308 ile
// (kalıcı, yöntemi koruyan) yönlendirilir.
const CANONICAL_HOST = "www.ozturkguvenlik.com";
const IDN_HOSTS = new Set(["xn--ztrkgvenlik-qfb4fd.com", "www.xn--ztrkgvenlik-qfb4fd.com"]);

export function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase() ?? "";
  if (IDN_HOSTS.has(host)) {
    const url = new URL(req.nextUrl.pathname + req.nextUrl.search, `https://${CANONICAL_HOST}`);
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
