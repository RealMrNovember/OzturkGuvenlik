import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { localBusinessJsonLd } from "@/lib/seo";
import { getSiteSettings, getResolvedSite } from "@/lib/site-settings";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const DEFAULT_TITLE = `${site.name} | Güvenlik Kamerası, Alarm, PDKS — İstanbul`;
const DEFAULT_DESCRIPTION =
  "2014'ten beri İstanbul genelinde güvenlik kamerası, hırsız ve yangın alarmı, PDKS, bariyer ve turnike sistemleri. Ücretsiz keşif: 0535 014 65 93. Google 5.0 puan, 33+ yorum.";

export async function generateMetadata(): Promise<Metadata> {
  const resolved = await getResolvedSite();
  const title = resolved.seoTitle || DEFAULT_TITLE;
  const description = resolved.seoDescription || DEFAULT_DESCRIPTION;
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s | ${site.shortName}` },
    description,
    keywords: resolved.seoKeywords
      ? resolved.seoKeywords.split(",").map((k) => k.trim())
      : [
          "güvenlik kamerası istanbul",
          "kamera sistemleri yenibosna",
          "hırsız alarmı",
          "yangın alarmı",
          "pdks",
          "parmak izi okuyucu",
          "turnike sistemleri",
          "öztürk güvenlik",
        ],
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: site.url,
      siteName: site.shortName,
      title,
      description,
      images: [{ url: resolved.ogImageUrl, width: 2000, height: 1500, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [resolved.ogImageUrl],
    },
    robots: { index: true, follow: true },
    icons: { icon: "/images/logo-square.png" },
    verification: resolved.googleSiteVerification ? { google: resolved.googleSiteVerification } : undefined,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();
  const resolved = await getResolvedSite();
  const brandColor = HEX_COLOR.test(settings.brandColor) ? settings.brandColor : undefined;
  const brandLightColor = HEX_COLOR.test(settings.brandLightColor)
    ? settings.brandLightColor
    : undefined;
  const accentColor = HEX_COLOR.test(settings.accentColor) ? settings.accentColor : undefined;
  const accentThickness =
    Number.isInteger(settings.accentThickness) && settings.accentThickness > 0
      ? `${settings.accentThickness}px`
      : undefined;
  const themeStyle = {
    ...(brandColor ? { "--color-brand": brandColor } : {}),
    ...(brandLightColor ? { "--color-brand-light": brandLightColor } : {}),
    ...(accentColor ? { "--color-accent": accentColor } : {}),
    ...(accentThickness ? { "--accent-thickness": accentThickness } : {}),
  } as CSSProperties;

  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`} style={themeStyle}>
      <body className="min-h-full">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd(resolved)) }}
        />
        {resolved.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${resolved.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${resolved.googleAnalyticsId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
