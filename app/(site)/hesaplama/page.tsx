import type { Metadata } from "next";
import { HesaplamaContent } from "@/components/HesaplamaContent";

export const metadata: Metadata = {
  title: "HDD / Disk Hesaplama Aracı",
  description:
    "Kamera sayısı, çözünürlük, FPS ve saklama süresine göre kayıt cihazınız için gereken disk kapasitesini ücretsiz hesaplayın.",
  alternates: { canonical: "/hesaplama" },
};

export default function HesaplamaPage() {
  return <HesaplamaContent />;
}
