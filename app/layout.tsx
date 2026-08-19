import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBar } from "@/components/MobileBar";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { site } from "@/lib/site";
import { localBusinessJsonLd } from "@/lib/seo";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBar />
        <FloatingWhatsApp />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
      </body>
    </html>
  );
}
