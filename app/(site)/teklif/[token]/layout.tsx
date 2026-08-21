import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teklifiniz",
  robots: { index: false, follow: false },
};

export default function TeklifLayout({ children }: { children: React.ReactNode }) {
  return children;
}
