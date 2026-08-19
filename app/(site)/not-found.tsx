import Link from "next/link";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
        <p className="text-7xl font-black text-brand/15">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink">
          Sayfa bulunamadı
        </h1>
        <p className="mt-3 text-ink/60">
          Aradığınız sayfa taşınmış ya da kaldırılmış olabilir. Ana sayfadan devam
          edin ya da bizi arayın.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
          >
            Ana Sayfa
          </Link>
          <a
            href={site.phoneHref}
            className="inline-flex items-center justify-center rounded-full border border-ink/15 px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
          >
            {site.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
