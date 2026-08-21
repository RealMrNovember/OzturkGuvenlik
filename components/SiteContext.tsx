"use client";

import { createContext, useContext, type ReactNode } from "react";
import { site as staticSite } from "@/lib/site";
import type { ResolvedSite } from "@/lib/site-resolve";

// Varsayılan değer statik site.ts'ten türetilir — Provider'sız kullanılırsa
// (unutulursa) bile sayfa asla boş/kırık iletişim bilgisiyle render olmaz.
const FALLBACK: ResolvedSite = {
  ...staticSite,
  phones: [
    { label: "", number: staticSite.phoneDisplay },
    { label: "", number: staticSite.secondPhoneDisplay },
  ],
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  ogImageUrl: "/images/hero-1.jpg",
  googleAnalyticsId: "",
  googleSiteVerification: "",
};

const SiteContext = createContext<ResolvedSite>(FALLBACK);

export function SiteProvider({ value, children }: { value: ResolvedSite; children: ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

/** İstemci bileşenlerinde admin'in panelden düzenlediği iletişim/sosyal
 * medya/WhatsApp bilgilerine erişim — bkz. app/(site)/layout.tsx'teki Provider. */
export function useSite(): ResolvedSite {
  return useContext(SiteContext);
}
