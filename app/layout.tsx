import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { localBusinessJsonLd } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Güvenlik Kamerası, Alarm, PDKS — İstanbul`,
    template: `%s | ${site.shortName}`,
  },
  description:
    "2014'ten beri İstanbul genelinde güvenlik kamerası, hırsız ve yangın alarmı, PDKS, bariyer ve turnike sistemleri. Ücretsiz keşif: 0535 014 65 93. Google 5.0 puan, 33+ yorum.",
  keywords: [
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
    title: `${site.name} | Güvenlik Kamerası, Alarm, PDKS — İstanbul`,
    description:
      "2014'ten beri İstanbul genelinde güvenlik sistemleri: kamera, alarm, PDKS, bariyer ve turnike. Ücretsiz keşif.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/images/logo-square.png" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
      </body>
    </html>
  );
}
