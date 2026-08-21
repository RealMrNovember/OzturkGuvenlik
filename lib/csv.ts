export type CsvColumn<T> = { key: keyof T | string; label: string; value?: (row: T) => string | number };

/** Excel'in (özellikle Türkçe yerelde) doğru açması için UTF-8 BOM'lu,
 * virgülle ayrılmış, RFC4180 uyumlu tırnaklama yapılır. */
export function toCsv<T extends Record<string, unknown>>(rows: T[], columns: CsvColumn<T>[]): string {
  const escape = (v: unknown): string => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => escape(c.label)).join(",");
  const lines = rows.map((row) =>
    columns
      .map((c) => escape(c.value ? c.value(row) : (row as Record<string, unknown>)[c.key as string]))
      .join(",")
  );
  return "﻿" + [header, ...lines].join("\r\n");
}

export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
