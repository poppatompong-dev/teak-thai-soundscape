// Shared helpers for classifying and formatting survey records.

/**
 * Heuristic: does this record look like test/junk data rather than a real
 * submission? Mirrors the criteria used when cleaning the database:
 *  - contains the word "ทดสอบ"/"test", OR
 *  - has no valid phone AND the surveyor name is not a proper Thai name.
 * This is a best-effort guess, not a guarantee.
 */
export function isLikelyTest(r: any): boolean {
  const blob = `${r?.surveyor ?? ""} ${r?.reasonForNeed ?? ""} ${r?.contactPerson ?? ""}`;
  if (/ทดสอบ|test/i.test(blob)) return true;
  const validPhone = /^0\d{8,9}$/.test(String(r?.phone ?? "").trim());
  const properName = /^(นาย|นาง|นางสาว)/.test(String(r?.surveyor ?? "").trim());
  return !validPhone && !properName;
}

/** Thai-formatted date+time, e.g. "29 พ.ค. 2569 14:32 น." Falls back to the
 *  legacy `date` field for records saved before timestamps were stored. */
export function formatThaiDateTime(r: any): string {
  if (r?.createdAt) {
    const d = new Date(r.createdAt);
    if (!isNaN(d.getTime())) {
      const date = d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
      const time = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
      return `${date} ${time} น.`;
    }
  }
  return r?.date || "-";
}

/** Time-only portion if available, else empty string. */
export function formatThaiTime(r: any): string {
  if (r?.createdAt) {
    const d = new Date(r.createdAt);
    if (!isNaN(d.getTime())) return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.";
  }
  return "";
}
