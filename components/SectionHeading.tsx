import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <Reveal>
      <div className={`flex flex-col gap-3 ${alignCls}`}>
        {eyebrow && (
          <div className={`flex flex-col gap-2 ${align === "center" ? "items-center" : "items-start"}`}>
            <span className="accent-bar accent-bar-pill w-10" />
            <p className="text-sm font-bold uppercase tracking-widest text-brand">{eyebrow}</p>
          </div>
        )}
        <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>
        {subtitle && <p className="max-w-2xl text-ink/60">{subtitle}</p>}
      </div>
    </Reveal>
  );
}
