import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş",
  robots: { index: false, follow: false },
};

export default function PanelGirisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
