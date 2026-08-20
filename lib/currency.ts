export const CURRENCIES = ["TRY", "USD", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

export const CURRENCY_LABEL: Record<Currency, string> = {
  TRY: "Türk Lirası",
  USD: "Amerikan Doları",
  EUR: "Euro",
};

/** Kayıt anında kilitlenen kur ile TL karşılığını hesaplar. */
export function toTry(amount: number, exchangeRate: number): number {
  return amount * exchangeRate;
}

export function fmtCurrency(amount: number | string, currency: Currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "TRY" ? 0 : 2,
  }).format(Number(amount));
}
