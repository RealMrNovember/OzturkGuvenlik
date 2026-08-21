import type { Metadata } from "next";
import { KesifContent } from "@/components/KesifContent";

export const metadata: Metadata = {
  title: "Ücretsiz Keşif Talebi",
  description:
    "30 saniyede ücretsiz keşif talebi oluşturun. Mekânınızı ve ilgilendiğiniz sistemleri seçin, size en kısa sürede dönüş yapalım.",
  alternates: { canonical: "/kesif" },
};

export default function KesifPage() {
  return <KesifContent />;
}
