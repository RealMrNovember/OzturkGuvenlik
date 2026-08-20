"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/fetch";
import { CURRENCIES, CURRENCY_SYMBOL, toTry, type Currency } from "@/lib/currency";

const CLOSE_DELAY_MS = 250;

function useCurrencyPicker(currency: string, onPick: (currency: Currency, exchangeRate: number) => void) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cur = (CURRENCIES.includes(currency as Currency) ? currency : "TRY") as Currency;

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  const pick = async (next: Currency) => {
    setOpen(false);
    setError("");
    if (next === "TRY") {
      onPick("TRY", 1);
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ rate: number }>(`/api/exchange-rate?currency=${next}`);
      onPick(next, res.rate);
    } catch (err) {
      setError((err as Error).message || "Kur alınamadı");
    } finally {
      setLoading(false);
    }
  };

  return { cur, open, setOpen, loading, error, cancelClose, scheduleClose, pick };
}

/** Yalnızca para birimi seçici — tutar girişi olmayan, belge (teklif/fatura) düzeyinde tek kur seçimi için. */
export function CurrencyPicker({
  currency,
  onChange,
  className,
}: {
  currency: string;
  onChange: (patch: { currency: string; exchangeRate: number }) => void;
  className?: string;
}) {
  const { cur, open, setOpen, loading, error, cancelClose, scheduleClose, pick } = useCurrencyPicker(
    currency,
    (c, r) => onChange({ currency: c, exchangeRate: r })
  );

  return (
    <div className={className}>
      <div
        className="relative inline-block"
        onMouseEnter={() => {
          cancelClose();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm font-bold text-ink/70 transition-colors hover:border-brand disabled:opacity-50"
        >
          {loading ? "…" : `${CURRENCY_SYMBOL[cur]} ${cur}`}
        </button>
        {open && (
          <div className="absolute left-0 top-full z-10 mt-1 flex overflow-hidden rounded-xl border border-ink/10 bg-white shadow-xl">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => pick(c)}
                className={`px-3.5 py-2.5 text-sm font-bold transition-colors ${
                  c === cur ? "bg-brand text-white" : "text-ink/60 hover:bg-surface"
                }`}
              >
                {CURRENCY_SYMBOL[c]}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

type AmountProps = {
  amount: string;
  currency: string;
  exchangeRate: number;
  onChange: (patch: { amount?: string; currency?: string; exchangeRate?: number }) => void;
  className?: string;
};

export function CurrencyAmountInput({ amount, currency, exchangeRate, onChange, className }: AmountProps) {
  const { cur, open, setOpen, loading, error, cancelClose, scheduleClose, pick } = useCurrencyPicker(
    currency,
    (c, r) => onChange({ currency: c, exchangeRate: r })
  );

  const tryEquivalent = cur !== "TRY" && Number(amount) > 0 ? toTry(Number(amount), exchangeRate) : null;

  return (
    <div className={className}>
      <div className="flex items-center rounded-xl border border-ink/15 bg-white transition-colors focus-within:border-brand">
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => onChange({ amount: e.target.value })}
          placeholder="0"
          className="w-full rounded-l-xl bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink/35"
        />
        <div
          className="relative"
          onMouseEnter={() => {
            cancelClose();
            setOpen(true);
          }}
          onMouseLeave={scheduleClose}
        >
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            disabled={loading}
            className="flex h-full items-center gap-1 rounded-r-xl border-l border-ink/10 bg-surface px-3 py-2.5 text-sm font-bold text-ink/70 transition-colors hover:text-brand disabled:opacity-50"
          >
            {loading ? "…" : CURRENCY_SYMBOL[cur]}
          </button>
          {open && (
            <div className="absolute right-0 top-full z-10 mt-1 flex overflow-hidden rounded-xl border border-ink/10 bg-white shadow-xl">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => pick(c)}
                  className={`px-3.5 py-2.5 text-sm font-bold transition-colors ${
                    c === cur ? "bg-brand text-white" : "text-ink/60 hover:bg-surface"
                  }`}
                >
                  {CURRENCY_SYMBOL[c]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
      {tryEquivalent !== null && !error && (
        <p className="mt-1 text-xs text-ink/45">
          1 {CURRENCY_SYMBOL[cur]} ≈ {exchangeRate.toLocaleString("tr-TR", { maximumFractionDigits: 4 })} ₺ · yaklaşık{" "}
          {tryEquivalent.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺
        </p>
      )}
    </div>
  );
}
