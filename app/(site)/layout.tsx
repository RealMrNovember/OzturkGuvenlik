import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBar } from "@/components/MobileBar";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBar />
      <FloatingWhatsApp />
    </div>
  );
}
