// Shared helpers for classifying, formatting, filtering and sorting survey records.
import { ORG_STRUCTURE } from "./types";

export const getDeptName = (bureau: string, div: string) => {
  const b = ORG_STRUCTURE.find((x) => x.value === bureau);
  const d = b?.divisions?.find((x) => x.value === div);
  if (d) return d.label;
  return b?.label || bureau;
};

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

// ---- Shared filtering + sorting (used by both Dashboard and the printed report) ----

export type SurveyFilters = {
  search: string;
  bureau: string;
  category: string;
  urgency: string;
  status: string;
  hideTest: boolean;
  sortKey: string;
};

export const defaultFilters: SurveyFilters = {
  search: "", bureau: "all", category: "all", urgency: "all", status: "all", hideTest: false, sortKey: "newest",
};

/** Filter then sort a list of survey records according to the given filters.
 *  Both the dashboard table and the printed report call this so their output
 *  always matches. */
export function applyFilters(requests: any[], f: SurveyFilters): any[] {
  const q = f.search.trim().toLowerCase();
  const filtered = requests.filter((r) => {
    const matchSearch = !q ||
      r.building?.toLowerCase().includes(q) ||
      getDeptName(r.bureau, r.division)?.toLowerCase().includes(q) ||
      String(r.id).toLowerCase().includes(q);
    const matchBureau = f.bureau === "all" || r.bureau === f.bureau;
    const matchCategory = f.category === "all" || r.speakerType === f.category;
    const matchUrgency = f.urgency === "all" || r.urgency === f.urgency;
    const matchStatus = f.status === "all" || (r.status || "pending") === f.status;
    const matchTest = !f.hideTest || !isLikelyTest(r);
    return matchSearch && matchBureau && matchCategory && matchUrgency && matchStatus && matchTest;
  });

  const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const pts = (r: any) => parseInt(r.proposedCount) || 0;
  const time = (r: any) => (r.createdAt ? new Date(r.createdAt).getTime() : 0);
  return filtered.sort((a, b) => {
    switch (f.sortKey) {
      case "oldest": return time(a) - time(b);
      case "points_desc": return pts(b) - pts(a);
      case "points_asc": return pts(a) - pts(b);
      case "urgency": return (urgencyOrder[a.urgency] ?? 3) - (urgencyOrder[b.urgency] ?? 3);
      case "bureau": return getDeptName(a.bureau, a.division).localeCompare(getDeptName(b.bureau, b.division), "th");
      case "newest":
      default: return time(b) - time(a);
    }
  });
}

/** Encode active filters as a URL query string (only non-default values). */
export function filtersToParams(f: SurveyFilters): string {
  const p = new URLSearchParams();
  if (f.search) p.set("q", f.search);
  if (f.bureau !== "all") p.set("bureau", f.bureau);
  if (f.category !== "all") p.set("cat", f.category);
  if (f.urgency !== "all") p.set("urg", f.urgency);
  if (f.status !== "all") p.set("st", f.status);
  if (f.hideTest) p.set("hideTest", "1");
  if (f.sortKey !== "newest") p.set("sort", f.sortKey);
  return p.toString();
}

/** Decode filters from URL query params. */
export function paramsToFilters(sp: URLSearchParams): SurveyFilters {
  return {
    search: sp.get("q") || "",
    bureau: sp.get("bureau") || "all",
    category: sp.get("cat") || "all",
    urgency: sp.get("urg") || "all",
    status: sp.get("st") || "all",
    hideTest: sp.get("hideTest") === "1",
    sortKey: sp.get("sort") || "newest",
  };
}

/** Human-readable summary of active filters (for the printed report header). */
export function describeFilters(f: SurveyFilters): string[] {
  const parts: string[] = [];
  const SPEAKER: Record<string, string> = { ceiling: "ประเภทที่ 1", wall: "ประเภทที่ 2", horn: "ประเภทที่ 3", other: "อื่น ๆ" };
  const URG: Record<string, string> = { high: "สูง", medium: "ปานกลาง", low: "ต่ำ" };
  const ST: Record<string, string> = { pending: "รอดำเนินการ", in_progress: "กำลังดำเนินการ", completed: "เสร็จสิ้น", cancelled: "ยกเลิก" };
  if (f.bureau !== "all") parts.push(`หน่วยงาน: ${ORG_STRUCTURE.find((x) => x.value === f.bureau)?.label || f.bureau}`);
  if (f.category !== "all") parts.push(`ประเภท: ${SPEAKER[f.category] || f.category}`);
  if (f.urgency !== "all") parts.push(`ความเร่งด่วน: ${URG[f.urgency] || f.urgency}`);
  if (f.status !== "all") parts.push(`สถานะ: ${ST[f.status] || f.status}`);
  if (f.hideTest) parts.push("ซ่อนข้อมูลทดสอบ");
  if (f.search) parts.push(`ค้นหา: "${f.search}"`);
  return parts;
}
