import { SurveyData } from "./types";

export const validateStep = (step: number, d: SurveyData): Record<string, string> => {
  const e: Record<string, string> = {};
  const req = (k: keyof SurveyData, msg = "กรุณากรอกข้อมูลในช่องนี้") => {
    if (!String(d[k] ?? "").trim()) e[k as string] = msg;
  };
  if (step === 0) {
    req("surveyor", "กรุณากรอกชื่อผู้สำรวจ");
    req("building");
    req("contactPerson");
    if (d.phone && !/^[0-9\-+\s()]{8,}$/.test(d.phone)) e.phone = "รูปแบบเบอร์โทรไม่ถูกต้อง";
  }
  if (step === 1) {
    req("proposedCount", "กรุณาระบุจำนวนจุด");
  }
  if (step === 2) {
    req("urgency", "กรุณาระบุความเร่งด่วน");
  }
  return e;
};
