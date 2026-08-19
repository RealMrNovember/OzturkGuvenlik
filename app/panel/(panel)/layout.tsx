import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PanelShell } from "@/components/panel/PanelShell";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  return (
    <PanelShell session={{ name: session.name, role: session.role, id: session.id }}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </PanelShell>
  );
}