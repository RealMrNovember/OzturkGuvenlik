import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBar } from "@/components/MobileBar";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SiteProvider } from "@/components/SiteContext";
import { getResolvedSite } from "@/lib/site-settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const resolved = await getResolvedSite();
  return (
    <SiteProvider value={resolved}>
      <div className="flex min-h-full flex-1 flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBar />
        <FloatingWhatsApp />
      </div>
    </SiteProvider>
  );
}
