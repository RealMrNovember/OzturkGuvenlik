import { describe, expect, test } from "vitest";
import { escapeHtml } from "@/lib/email";

describe("escapeHtml", () => {
  test("escapes all five HTML-significant characters", () => {
    expect(escapeHtml(`<script>alert("x") & 'y'</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;) &amp; &#39;y&#39;&lt;/script&gt;"
    );
  });

  test("leaves plain text untouched", () => {
    expect(escapeHtml("Ahmet Yılmaz, 3 katlı ofis")).toBe("Ahmet Yılmaz, 3 katlı ofis");
  });

  test("neutralizes an injected <a> tag from a form field", () => {
    const malicious = `Test <a href="javascript:alert(1)">click</a>`;
    const escaped = escapeHtml(malicious);
    expect(escaped).not.toContain("<a");
    expect(escaped).toContain("&lt;a href=&quot;javascript:alert(1)&quot;&gt;");
  });
});
