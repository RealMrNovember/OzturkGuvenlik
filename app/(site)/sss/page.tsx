import type { Metadata } from "next";
import { services } from "@/lib/services";
import { GENERAL_FAQS } from "@/lib/faqs";
import { faqPageJsonLd } from "@/lib/seo";
import { SssContent } from "@/components/SssContent";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description:
    "Keşif, kurulum, garanti, bakım ve ödeme hakkında en çok merak edilen sorular ve cevapları.",
  alternates: { canonical: "/sss" },
};

export default function SssPage() {
  const allFaqs = [...GENERAL_FAQS, ...services.flatMap((s) => s.faqs)];
  const jsonLd = faqPageJsonLd(allFaqs);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SssContent />
    </>
  );
}
